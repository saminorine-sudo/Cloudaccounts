import "server-only";

import { randomUUID } from "node:crypto";

import {
  adminClient,
  canWriteToSupabase,
  type Db,
} from "@/lib/supabase/clients";
import type {
  AppointmentRow,
  ContactSubmissionRow,
  LeadRow,
} from "@/lib/supabase/database.types";
import type {
  BookingInput,
  ContactInput,
  LeadInput,
} from "@/lib/validation/schemas";

/**
 * SUBMISSION STORE
 *
 * Where leads, contact enquiries and bookings are written.
 *
 *   Supabase configured   → inserts through the service-role client.
 *   Not configured        → keeps records in process memory so the forms work
 *                           end to end during development.
 *
 * The in-memory mode is development-only and loses everything on restart.
 * `assertProductionConfig()` in `lib/supabase/clients` refuses to let a
 * production server start in that state, because a site that appears to
 * accept enquiries and silently discards them is the worst possible failure.
 *
 * Why the service role, which bypasses RLS: these writes come from
 * unauthenticated visitors. Rather than granting `anon` insert rights on the
 * leads table — which would also let anyone post directly to the REST API —
 * the route handlers validate first and then write with elevated privilege.
 * The trust boundary is the route handler, and it is enforced there.
 */

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "CONSULTATION_BOOKED"
  | "PROPOSAL_SENT"
  | "WON"
  | "LOST";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type LeadRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  businessType: string;
  turnover: string;
  services: string[];
  message: string;
  preferredContact: string;
  source: string;
  status: LeadStatus;
  assignedToId: string | null;
  followUpAt: string | null;
};

export type ContactRecord = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
};

export type AppointmentRecord = {
  id: string;
  createdAt: string;
  consultationTypeSlug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** 24-hour HH:mm, Europe/London. */
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  notes: string | null;
  status: AppointmentStatus;
};

/** True once a database is connected and submissions are durable. */
export const isPersistent = canWriteToSupabase();

const leads: LeadRecord[] = [];
const contactSubmissions: ContactRecord[] = [];
const appointments: AppointmentRecord[] = [];

const nullable = (value: string | undefined) =>
  value && value.trim() !== "" ? value.trim() : null;

function fail(action: string, error: { message: string }): never {
  throw new Error(`Supabase write failed (${action}): ${error.message}`);
}

/* -------------------------------------------------------------------------- */
/* Row mapping                                                                */
/* -------------------------------------------------------------------------- */

function toLeadRecord(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    businessName: row.business_name,
    businessType: row.business_type,
    turnover: row.turnover,
    services: row.services ?? [],
    message: row.message,
    preferredContact: row.preferred_contact,
    source: row.source,
    status: row.status,
    assignedToId: row.assigned_to_id,
    followUpAt: row.follow_up_at,
  };
}

function toContactRecord(row: ContactSubmissionRow): ContactRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
  };
}

function toAppointmentRecord(
  row: AppointmentRow,
  consultationTypeSlug: string,
): AppointmentRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    consultationTypeSlug,
    date: row.scheduled_on.slice(0, 10),
    // Postgres `time` comes back as HH:MM:SS; the app works in HH:MM.
    time: row.scheduled_at_time.slice(0, 5),
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    businessName: row.business_name,
    notes: row.notes,
    status: row.status,
  };
}

async function consultationTypeIdForSlug(db: Db, slug: string): Promise<string> {
  const { data, error } = await db
    .from("consultation_types")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) fail("consultation type lookup", error);
  if (!data) throw new Error(`Unknown consultation type: ${slug}`);
  return data.id;
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                     */
/* -------------------------------------------------------------------------- */

export async function createLead(input: LeadInput): Promise<LeadRecord> {
  if (!isPersistent) {
    const now = new Date().toISOString();
    const record: LeadRecord = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: nullable(input.phone),
      businessName: nullable(input.businessName),
      businessType: input.businessType,
      turnover: input.turnover,
      services: input.services,
      message: input.message,
      preferredContact: input.preferredContact,
      source: nullable(input.source) ?? "website",
      status: "NEW",
      assignedToId: null,
      followUpAt: null,
    };
    leads.push(record);
    return record;
  }

  const { data, error } = await adminClient()
    .from("leads")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: nullable(input.phone),
      business_name: nullable(input.businessName),
      business_type: input.businessType,
      turnover: input.turnover,
      services: input.services,
      message: input.message,
      preferred_contact: input.preferredContact,
      source: nullable(input.source) ?? "website",
    })
    .select("*")
    .single();

  if (error) fail("create lead", error);
  return toLeadRecord(data);
}

export async function createContactSubmission(
  input: ContactInput,
): Promise<ContactRecord> {
  if (!isPersistent) {
    const record: ContactRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      name: input.name,
      email: input.email,
      phone: nullable(input.phone),
      subject: input.subject,
      message: input.message,
    };
    contactSubmissions.push(record);
    return record;
  }

  const { data, error } = await adminClient()
    .from("contact_submissions")
    .insert({
      name: input.name,
      email: input.email,
      phone: nullable(input.phone),
      subject: input.subject,
      message: input.message,
    })
    .select("*")
    .single();

  if (error) fail("create contact submission", error);
  return toContactRecord(data);
}

/**
 * Whether a slot is already taken.
 *
 * This is a courtesy check that produces a friendly message. It cannot
 * prevent a genuine race — two requests can both pass it — which is why the
 * database carries a unique index on the slot and `createAppointment` treats
 * a unique violation as the authoritative answer.
 */
export async function isSlotTaken(
  consultationTypeSlug: string,
  date: string,
  time: string,
): Promise<boolean> {
  if (!isPersistent) {
    return appointments.some(
      (appointment) =>
        appointment.consultationTypeSlug === consultationTypeSlug &&
        appointment.date === date &&
        appointment.time === time &&
        appointment.status !== "CANCELLED",
    );
  }

  const db = adminClient();
  const typeId = await consultationTypeIdForSlug(db, consultationTypeSlug);

  const { data, error } = await db
    .from("appointments")
    .select("id")
    .eq("consultation_type_id", typeId)
    .eq("scheduled_on", date)
    .eq("scheduled_at_time", time)
    .neq("status", "CANCELLED")
    .limit(1);

  if (error) fail("slot check", error);
  return (data ?? []).length > 0;
}

/** Thrown when the unique slot index rejects a double booking. */
export class SlotUnavailableError extends Error {
  constructor() {
    super("That slot has just been taken.");
    this.name = "SlotUnavailableError";
  }
}

/** Postgres unique-violation SQLSTATE. */
const UNIQUE_VIOLATION = "23505";

export async function createAppointment(
  input: BookingInput,
): Promise<AppointmentRecord> {
  if (!isPersistent) {
    if (
      await isSlotTaken(input.consultationTypeSlug, input.date, input.time)
    ) {
      throw new SlotUnavailableError();
    }

    const record: AppointmentRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      consultationTypeSlug: input.consultationTypeSlug,
      date: input.date,
      time: input.time,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: nullable(input.phone),
      businessName: nullable(input.businessName),
      notes: nullable(input.notes),
      status: "PENDING",
    };
    appointments.push(record);
    return record;
  }

  const db = adminClient();
  const typeId = await consultationTypeIdForSlug(db, input.consultationTypeSlug);

  const { data, error } = await db
    .from("appointments")
    .insert({
      consultation_type_id: typeId,
      scheduled_on: input.date,
      scheduled_at_time: input.time,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: nullable(input.phone),
      business_name: nullable(input.businessName),
      notes: nullable(input.notes),
    })
    .select("*")
    .single();

  if (error) {
    // The unique index is the real arbiter of who got the slot.
    if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
      throw new SlotUnavailableError();
    }
    fail("create appointment", error);
  }

  return toAppointmentRecord(data, input.consultationTypeSlug);
}

/* -------------------------------------------------------------------------- */
/* Reads — used by the admin surfaces                                         */
/* -------------------------------------------------------------------------- */

export async function listLeads(): Promise<LeadRecord[]> {
  if (!isPersistent) return [...leads].reverse();

  const { data, error } = await adminClient()
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) fail("list leads", error);
  return (data ?? []).map(toLeadRecord);
}

export async function listContactSubmissions(): Promise<ContactRecord[]> {
  if (!isPersistent) return [...contactSubmissions].reverse();

  const { data, error } = await adminClient()
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) fail("list contact submissions", error);
  return (data ?? []).map(toContactRecord);
}

export async function listAppointments(): Promise<AppointmentRecord[]> {
  if (!isPersistent) return [...appointments].reverse();

  const db = adminClient();
  const [{ data, error }, types] = await Promise.all([
    db
      .from("appointments")
      .select("*")
      .order("scheduled_on", { ascending: false }),
    db.from("consultation_types").select("id, slug"),
  ]);

  if (error) fail("list appointments", error);
  if (types.error) fail("list consultation types", types.error);

  const slugById = new Map(
    (types.data ?? []).map((type) => [type.id, type.slug]),
  );

  return (data ?? []).map((row) =>
    toAppointmentRecord(row, slugById.get(row.consultation_type_id) ?? ""),
  );
}
