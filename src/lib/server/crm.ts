import "server-only";

import { randomUUID } from "node:crypto";

import { adminClient } from "@/lib/supabase/clients";
import {
  isPersistent,
  memoryStore,
  type AppointmentStatus,
  type LeadNoteRecord,
  type LeadRecord,
  type LeadStatus,
  type LeadStatusChange,
} from "@/lib/server/submissions";

/**
 * CRM reads and writes for the admin area.
 *
 * Separate from `submissions.ts`, which owns the public write path. That file
 * is reached by anonymous visitors; this one is only ever reached by an
 * authorised staff member. Keeping them apart makes it obvious which
 * functions sit on which side of the trust boundary.
 *
 * Both storage modes are supported, so the admin screens can be built and
 * exercised against the in-memory store before a database exists.
 */

export type { LeadNoteRecord, LeadStatusChange };

export const leadStatuses: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "CONSULTATION_BOOKED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
];

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CONSULTATION_BOOKED: "Consultation booked",
  PROPOSAL_SENT: "Proposal sent",
  WON: "Won",
  LOST: "Lost",
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

/** Statuses that represent a closed lead, for conversion reporting. */
export const closedStatuses: LeadStatus[] = ["WON", "LOST"];

function fail(action: string, error: { message: string }): never {
  throw new Error(`CRM operation failed (${action}): ${error.message}`);
}

function rowToNote(row: {
  id: string;
  lead_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}): LeadNoteRecord {
  return {
    id: row.id,
    leadId: row.lead_id,
    authorId: row.author_id,
    authorName: null,
    body: row.body,
    createdAt: row.created_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

export async function getLead(id: string): Promise<LeadRecord | undefined> {
  if (!isPersistent) {
    return memoryStore.leads.find((lead) => lead.id === id);
  }

  const { data, error } = await adminClient()
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) fail("get lead", error);
  if (!data) return undefined;
  return memoryStore.toLeadRecord(data);
}

export async function getLeadNotes(leadId: string): Promise<LeadNoteRecord[]> {
  if (!isPersistent) {
    // Reverse first, then sort. Two records written in the same millisecond
    // have identical timestamps, and `sort` is stable — so starting from
    // newest-inserted keeps ties in the order they actually happened instead
    // of leaving it to chance.
    return memoryStore.leadNotes
      .filter((note) => note.leadId === leadId)
      .reverse()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const { data, error } = await adminClient()
    .from("lead_notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) fail("get lead notes", error);
  return (data ?? []).map(rowToNote);
}

export async function getLeadStatusHistory(
  leadId: string,
): Promise<LeadStatusChange[]> {
  if (!isPersistent) {
    // Same tie-breaking as `getLeadNotes`: a lead created and then advanced
    // within one millisecond must still read in the right order.
    return memoryStore.leadStatusHistory
      .filter((entry) => entry.leadId === leadId)
      .reverse()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const { data, error } = await adminClient()
    .from("lead_status_history")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) fail("get lead status history", error);
  return (data ?? []).map((row) => ({
    id: row.id,
    leadId: row.lead_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    createdAt: row.created_at,
  }));
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  actorId: string | null,
): Promise<void> {
  if (!isPersistent) {
    const lead = memoryStore.leads.find((entry) => entry.id === leadId);
    if (!lead) throw new Error("Lead not found");

    if (lead.status !== status) {
      // Postgres records this with a trigger. In memory it has to be done
      // here, and only on a real change, to match that behaviour.
      memoryStore.leadStatusHistory.push({
        id: randomUUID(),
        leadId,
        fromStatus: lead.status,
        toStatus: status,
        createdAt: new Date().toISOString(),
      });
      lead.status = status;
      lead.updatedAt = new Date().toISOString();
    }
    return;
  }

  // The database trigger writes the history entry, so this is a plain update.
  const { error } = await adminClient()
    .from("leads")
    .update({ status })
    .eq("id", leadId);

  if (error) fail("update lead status", error);
  void actorId;
}

export async function assignLead(
  leadId: string,
  assigneeId: string | null,
): Promise<void> {
  if (!isPersistent) {
    const lead = memoryStore.leads.find((entry) => entry.id === leadId);
    if (!lead) throw new Error("Lead not found");
    lead.assignedToId = assigneeId;
    lead.updatedAt = new Date().toISOString();
    return;
  }

  const { error } = await adminClient()
    .from("leads")
    .update({ assigned_to_id: assigneeId })
    .eq("id", leadId);

  if (error) fail("assign lead", error);
}

export async function setLeadFollowUp(
  leadId: string,
  followUpAt: string | null,
): Promise<void> {
  if (!isPersistent) {
    const lead = memoryStore.leads.find((entry) => entry.id === leadId);
    if (!lead) throw new Error("Lead not found");
    lead.followUpAt = followUpAt;
    lead.updatedAt = new Date().toISOString();
    return;
  }

  const { error } = await adminClient()
    .from("leads")
    .update({ follow_up_at: followUpAt })
    .eq("id", leadId);

  if (error) fail("set follow-up date", error);
}

export async function addLeadNote(
  leadId: string,
  body: string,
  author: { id: string; name: string } | null,
): Promise<LeadNoteRecord> {
  if (!isPersistent) {
    const note: LeadNoteRecord = {
      id: randomUUID(),
      leadId,
      authorId: author?.id ?? null,
      authorName: author?.name ?? null,
      body,
      createdAt: new Date().toISOString(),
    };
    memoryStore.leadNotes.push(note);
    return note;
  }

  // `author_id` must reference a real profile. The development preview actor
  // is not one, so it is stored as null rather than a dangling reference.
  const { data, error } = await adminClient()
    .from("lead_notes")
    .insert({ lead_id: leadId, body, author_id: null })
    .select("*")
    .single();

  if (error) fail("add lead note", error);
  return rowToNote(data);
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<void> {
  if (!isPersistent) {
    const appointment = memoryStore.appointments.find(
      (entry) => entry.id === appointmentId,
    );
    if (!appointment) throw new Error("Appointment not found");
    appointment.status = status;
    return;
  }

  const { error } = await adminClient()
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);

  if (error) fail("update appointment status", error);
}

export async function setContactHandled(
  submissionId: string,
  isHandled: boolean,
): Promise<void> {
  if (!isPersistent) {
    const submission = memoryStore.contactSubmissions.find(
      (entry) => entry.id === submissionId,
    );
    if (!submission) throw new Error("Enquiry not found");
    submission.isHandled = isHandled;
    return;
  }

  const { error } = await adminClient()
    .from("contact_submissions")
    .update({ is_handled: isHandled })
    .eq("id", submissionId);

  if (error) fail("update enquiry", error);
}
