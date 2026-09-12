"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminAccess } from "@/lib/admin/access";
import {
  addLeadNote,
  assignLead,
  setContactHandled,
  setLeadFollowUp,
  updateAppointmentStatus,
  updateLeadStatus,
} from "@/lib/server/crm";

/**
 * Admin mutations.
 *
 * EVERY action calls `requireAdminAccess()` first. Server actions are
 * reachable by direct POST, not only through the forms that render them, so
 * the gate in the layout protects the page but proves nothing about the
 * request that arrives here.
 *
 * Inputs are validated with Zod for the same reason: the select element that
 * offered three statuses is not evidence that the submitted value is one of
 * them.
 *
 * Actions return a result object rather than throwing, so the UI can show a
 * message instead of an error page. `requireAdminAccess` still throws — an
 * unauthorised caller gets nothing, not a polite explanation.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Record ids are always uuids — `randomUUID()` in the in-memory store, uuid
 * columns in Postgres. Validating the shape rather than just the length keeps
 * anything path-like out of the `revalidatePath` calls below.
 */
const uuid = z.uuid();

const leadStatusValues = [
  "NEW",
  "CONTACTED",
  "CONSULTATION_BOOKED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
] as const;

const appointmentStatusValues = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

function failed(error: unknown, fallback: string): ActionResult {
  console.error("[admin:action]", error instanceof Error ? error.message : error);
  return { ok: false, error: fallback };
}

/* -------------------------------------------------------------------------- */

const changeStatusSchema = z.object({
  leadId: uuid,
  status: z.enum(leadStatusValues),
});

export async function changeLeadStatus(
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireAdminAccess();

  const parsed = changeStatusSchema.safeParse({
    leadId: formData.get("leadId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, error: "That status is not valid." };

  try {
    await updateLeadStatus(parsed.data.leadId, parsed.data.status, actor.id);
    revalidatePath(`/admin/leads/${parsed.data.leadId}`);
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return failed(error, "We couldn't update the status. Please try again.");
  }
}

const addNoteSchema = z.object({
  leadId: uuid,
  body: z
    .string()
    .trim()
    .min(1, "Write a note first")
    .max(4000, "Please keep the note under 4,000 characters"),
});

export async function createLeadNote(
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireAdminAccess();

  const parsed = addNoteSchema.safeParse({
    leadId: formData.get("leadId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "That note is not valid.",
    };
  }

  try {
    await addLeadNote(parsed.data.leadId, parsed.data.body, {
      id: actor.id,
      name: actor.name,
    });
    revalidatePath(`/admin/leads/${parsed.data.leadId}`);
    return { ok: true };
  } catch (error) {
    return failed(error, "We couldn't save that note. Please try again.");
  }
}

const followUpSchema = z.object({
  leadId: uuid,
  // An empty string clears the date; anything else must be a real date.
  followUpAt: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Enter a valid date",
    ),
});

export async function changeLeadFollowUp(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminAccess();

  const parsed = followUpSchema.safeParse({
    leadId: formData.get("leadId"),
    followUpAt: formData.get("followUpAt"),
  });
  if (!parsed.success) return { ok: false, error: "Enter a valid date." };

  try {
    await setLeadFollowUp(
      parsed.data.leadId,
      parsed.data.followUpAt === ""
        ? null
        : new Date(`${parsed.data.followUpAt}T09:00:00Z`).toISOString(),
    );
    revalidatePath(`/admin/leads/${parsed.data.leadId}`);
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (error) {
    return failed(error, "We couldn't set that follow-up date.");
  }
}

const assignSchema = z.object({
  leadId: uuid,
  assigneeId: z.string().trim().max(64),
});

export async function changeLeadAssignee(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminAccess();

  const parsed = assignSchema.safeParse({
    leadId: formData.get("leadId"),
    assigneeId: formData.get("assigneeId"),
  });
  if (!parsed.success) return { ok: false, error: "That assignee is not valid." };

  try {
    await assignLead(
      parsed.data.leadId,
      parsed.data.assigneeId === "" ? null : parsed.data.assigneeId,
    );
    revalidatePath(`/admin/leads/${parsed.data.leadId}`);
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (error) {
    return failed(error, "We couldn't assign that lead.");
  }
}

const appointmentStatusSchema = z.object({
  appointmentId: uuid,
  status: z.enum(appointmentStatusValues),
});

export async function changeAppointmentStatus(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminAccess();

  const parsed = appointmentStatusSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, error: "That status is not valid." };

  try {
    await updateAppointmentStatus(
      parsed.data.appointmentId,
      parsed.data.status,
    );
    revalidatePath("/admin/appointments");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return failed(error, "We couldn't update that appointment.");
  }
}

const contactHandledSchema = z.object({
  submissionId: uuid,
  isHandled: z.enum(["true", "false"]),
});

export async function changeContactHandled(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminAccess();

  const parsed = contactHandledSchema.safeParse({
    submissionId: formData.get("submissionId"),
    isHandled: formData.get("isHandled"),
  });
  if (!parsed.success) return { ok: false, error: "That change is not valid." };

  try {
    await setContactHandled(
      parsed.data.submissionId,
      parsed.data.isHandled === "true",
    );
    revalidatePath("/admin/enquiries");
    return { ok: true };
  } catch (error) {
    return failed(error, "We couldn't update that enquiry.");
  }
}
