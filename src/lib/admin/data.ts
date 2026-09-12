import "server-only";

import { cache } from "react";

import { getAdminAccess, requireAdminAccess } from "@/lib/admin/access";
import {
  getLead,
  getLeadNotes,
  getLeadStatusHistory,
  type LeadNoteRecord,
  type LeadStatusChange,
} from "@/lib/server/crm";
import {
  listAppointments,
  listContactSubmissions,
  listLeads,
  type AppointmentRecord,
  type ContactRecord,
  type LeadRecord,
} from "@/lib/server/submissions";

/**
 * ADMIN DATA ACCESS LAYER
 *
 * Every read of enquiry data goes through here, and every function authorises
 * before it touches a record.
 *
 * WHY THIS EXISTS RATHER THAN A LAYOUT CHECK
 *
 * A Next.js layout that refuses to render `children` does not stop the page
 * component running. The page still renders and its output is still
 * serialized into the RSC payload sent to the browser — so a layout-only gate
 * shows a denial screen while shipping the data behind it. That was verified
 * against a real build, not assumed.
 *
 * So authorisation lives next to the data. The pages check too, so the denied
 * payload contains a denial rather than a page's worth of records; this layer
 * is what makes a forgotten page check harmless instead of a breach.
 *
 * `cache` de-duplicates the access check within a request, so a page loading
 * three things resolves it once.
 */

const resolveAccess = cache(getAdminAccess);

/** Throws unless the caller is an authorised staff member. */
async function authorise(): Promise<void> {
  const access = await resolveAccess();
  if (!access.allowed) await requireAdminAccess();
}

export async function getLeadsForAdmin(): Promise<LeadRecord[]> {
  await authorise();
  return listLeads();
}

export async function getLeadForAdmin(
  id: string,
): Promise<LeadRecord | undefined> {
  await authorise();
  return getLead(id);
}

export async function getLeadNotesForAdmin(
  leadId: string,
): Promise<LeadNoteRecord[]> {
  await authorise();
  return getLeadNotes(leadId);
}

export async function getLeadStatusHistoryForAdmin(
  leadId: string,
): Promise<LeadStatusChange[]> {
  await authorise();
  return getLeadStatusHistory(leadId);
}

export async function getAppointmentsForAdmin(): Promise<AppointmentRecord[]> {
  await authorise();
  return listAppointments();
}

export async function getContactSubmissionsForAdmin(): Promise<
  ContactRecord[]
> {
  await authorise();
  return listContactSubmissions();
}

/** Re-exported so pages resolve access through the same cached call. */
export { resolveAccess as getCachedAdminAccess };
