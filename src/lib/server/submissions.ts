import "server-only";

import { randomUUID } from "node:crypto";

import type {
  BookingInput,
  ContactInput,
  LeadInput,
} from "@/lib/validation/schemas";

/**
 * SUBMISSION STORE — the second seam for Supabase.
 *
 * Leads, contact enquiries and bookings are written through this module. The
 * current implementation keeps them in process memory, which is fine for
 * development and deliberately obvious: `isPersistent` is false, and the
 * admin surface will show that submissions are not durable until a database
 * is connected.
 *
 * Swapping to Supabase means replacing the bodies of `createLead`,
 * `createContactSubmission` and `createAppointment` with inserts. The shapes
 * below are already the intended table shapes, including the status enums and
 * the lead status history that the CRM will read.
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
  /** Where the enquiry originated — plan slug, page, campaign. */
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

/** False until a real database is connected. */
export const isPersistent = false;

const leads: LeadRecord[] = [];
const contactSubmissions: ContactRecord[] = [];
const appointments: AppointmentRecord[] = [];

const nullable = (value: string | undefined) =>
  value && value.trim() !== "" ? value.trim() : null;

export async function createLead(input: LeadInput): Promise<LeadRecord> {
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

export async function createContactSubmission(
  input: ContactInput,
): Promise<ContactRecord> {
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

/**
 * Checks whether a slot is already taken.
 *
 * In memory this is a scan. Against Postgres it becomes a unique index on
 * (consultation_type_id, date, time) so two people cannot book the same slot
 * in a race — an application-level check alone cannot guarantee that.
 */
export async function isSlotTaken(
  consultationTypeSlug: string,
  date: string,
  time: string,
): Promise<boolean> {
  return appointments.some(
    (appointment) =>
      appointment.consultationTypeSlug === consultationTypeSlug &&
      appointment.date === date &&
      appointment.time === time &&
      appointment.status !== "CANCELLED",
  );
}

export async function createAppointment(
  input: BookingInput,
): Promise<AppointmentRecord> {
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

/** Read helpers, used by the admin surfaces once they exist. */
export async function listLeads(): Promise<LeadRecord[]> {
  return [...leads].reverse();
}

export async function listAppointments(): Promise<AppointmentRecord[]> {
  return [...appointments].reverse();
}

export async function listContactSubmissions(): Promise<ContactRecord[]> {
  return [...contactSubmissions].reverse();
}
