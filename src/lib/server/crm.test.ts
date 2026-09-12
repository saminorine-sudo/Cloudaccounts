import { beforeEach, describe, expect, it } from "vitest";

import {
  addLeadNote,
  getLead,
  getLeadNotes,
  getLeadStatusHistory,
  setLeadFollowUp,
  updateLeadStatus,
} from "./crm";
import { createLead, memoryStore } from "./submissions";
import type { LeadInput } from "@/lib/validation/schemas";

/**
 * In-memory CRM behaviour.
 *
 * These assert that the fallback store behaves the same way the database
 * does. Postgres records lead status transitions with a trigger (covered by
 * `supabase/tests/01-security.sql`); the in-memory path has to write those
 * entries itself, and the two must not drift — otherwise the activity
 * timeline looks different depending on whether a database is connected.
 */

const baseLead: LeadInput = {
  firstName: "Sarah",
  lastName: "Mitchell",
  email: "sarah@example.com",
  phone: "",
  businessName: "Mitchell Consulting",
  businessType: "limited-company",
  turnover: "250k-500k",
  services: ["accounting"],
  message: "Hello",
  preferredContact: "email",
  consent: true,
  source: "test",
};

function resetStore(): void {
  memoryStore.leads.length = 0;
  memoryStore.leadNotes.length = 0;
  memoryStore.leadStatusHistory.length = 0;
  memoryStore.contactSubmissions.length = 0;
  memoryStore.appointments.length = 0;
}

beforeEach(resetStore);

describe("lead status history", () => {
  it("records the opening status when a lead is created", async () => {
    const lead = await createLead(baseLead);
    const history = await getLeadStatusHistory(lead.id);

    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBeNull();
    expect(history[0].toStatus).toBe("NEW");
  });

  it("records each real transition", async () => {
    const lead = await createLead(baseLead);

    await updateLeadStatus(lead.id, "CONTACTED", null);
    await updateLeadStatus(lead.id, "WON", null);

    const history = await getLeadStatusHistory(lead.id);
    expect(history).toHaveLength(3);
    // Newest first, matching the database ordering.
    expect(history[0].fromStatus).toBe("CONTACTED");
    expect(history[0].toStatus).toBe("WON");
  });

  it("ignores a no-op status update", async () => {
    const lead = await createLead(baseLead);

    await updateLeadStatus(lead.id, "CONTACTED", null);
    await updateLeadStatus(lead.id, "CONTACTED", null);

    expect(await getLeadStatusHistory(lead.id)).toHaveLength(2);
  });

  it("updates the lead itself", async () => {
    const lead = await createLead(baseLead);
    await updateLeadStatus(lead.id, "PROPOSAL_SENT", null);

    expect((await getLead(lead.id))?.status).toBe("PROPOSAL_SENT");
  });

  it("keeps each lead's history separate", async () => {
    const first = await createLead(baseLead);
    const second = await createLead({ ...baseLead, email: "other@example.com" });

    await updateLeadStatus(first.id, "WON", null);

    expect(await getLeadStatusHistory(first.id)).toHaveLength(2);
    expect(await getLeadStatusHistory(second.id)).toHaveLength(1);
  });

  it("rejects an unknown lead rather than silently doing nothing", async () => {
    await expect(
      updateLeadStatus("does-not-exist", "WON", null),
    ).rejects.toThrow("Lead not found");
  });
});

describe("lead notes", () => {
  it("stores a note against the lead", async () => {
    const lead = await createLead(baseLead);
    await addLeadNote(lead.id, "Called and left a voicemail.", {
      id: "actor-1",
      name: "Elena Marsh",
    });

    const notes = await getLeadNotes(lead.id);
    expect(notes).toHaveLength(1);
    expect(notes[0].body).toBe("Called and left a voicemail.");
    expect(notes[0].authorName).toBe("Elena Marsh");
  });

  it("returns notes newest first", async () => {
    const lead = await createLead(baseLead);
    await addLeadNote(lead.id, "First", null);
    // Timestamps come from the clock, so force a distinct one.
    await new Promise((resolve) => setTimeout(resolve, 5));
    await addLeadNote(lead.id, "Second", null);

    const notes = await getLeadNotes(lead.id);
    expect(notes[0].body).toBe("Second");
  });

  it("does not leak notes between leads", async () => {
    const first = await createLead(baseLead);
    const second = await createLead({ ...baseLead, email: "other@example.com" });

    await addLeadNote(first.id, "Private to the first lead", null);

    expect(await getLeadNotes(second.id)).toHaveLength(0);
  });
});

describe("follow-up dates", () => {
  it("sets and clears the follow-up date", async () => {
    const lead = await createLead(baseLead);

    await setLeadFollowUp(lead.id, "2026-10-15T09:00:00.000Z");
    expect((await getLead(lead.id))?.followUpAt).toBe(
      "2026-10-15T09:00:00.000Z",
    );

    await setLeadFollowUp(lead.id, null);
    expect((await getLead(lead.id))?.followUpAt).toBeNull();
  });
});

describe("the store survives module boundaries", () => {
  /**
   * The in-memory store lives on `globalThis` because route handlers and
   * pages can be instantiated from separate module instances — a plain
   * module-scoped array meant a submitted lead never reached the admin. This
   * asserts the state really is shared rather than per-import.
   */
  it("is reachable through the global registry", async () => {
    const lead = await createLead(baseLead);

    const shared = (
      globalThis as typeof globalThis & {
        [key: symbol]: { leads: { id: string }[] } | undefined;
      }
    )[Symbol.for("cloudaccounts.memoryStore")];

    expect(shared).toBeDefined();
    expect(shared?.leads.some((entry) => entry.id === lead.id)).toBe(true);
  });
});
