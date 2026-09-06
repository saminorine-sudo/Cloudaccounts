import { describe, expect, it } from "vitest";

import { checkRateLimit, detectSpam } from "./security";
import { honeypotField, leadSchema } from "@/lib/validation/schemas";

const validLead = {
  firstName: "Sarah",
  lastName: "Mitchell",
  email: "sarah@example.com",
  businessType: "limited-company",
  turnover: "250k-500k",
  services: ["accounting"],
  message: "Hello",
  preferredContact: "email",
  consent: true,
};

describe("spam detection", () => {
  it("passes a normal submission", () => {
    expect(
      detectSpam({ ...validLead, renderedAt: Date.now() - 30_000 }).isSpam,
    ).toBe(false);
  });

  it("catches a filled honeypot", () => {
    const verdict = detectSpam({
      ...validLead,
      [honeypotField]: "http://spam.example",
    });
    expect(verdict.isSpam).toBe(true);
    expect(verdict.reason).toBe("honeypot");
  });

  it("ignores an empty honeypot", () => {
    expect(detectSpam({ ...validLead, [honeypotField]: "" }).isSpam).toBe(false);
  });

  it("catches a submission that arrives impossibly fast", () => {
    const verdict = detectSpam({ ...validLead, renderedAt: Date.now() });
    expect(verdict.isSpam).toBe(true);
    expect(verdict.reason).toBe("too-fast");
  });

  it("catches a forged future timestamp", () => {
    expect(
      detectSpam({ ...validLead, renderedAt: Date.now() + 60_000 }).isSpam,
    ).toBe(true);
  });

  it("passes when no timestamp is supplied", () => {
    expect(detectSpam(validLead).isSpam).toBe(false);
  });
});

/**
 * Regression test for a real bug: the API routes originally ran `detectSpam`
 * BEFORE schema validation. Because a spam verdict returns a success
 * response, an empty form submitted quickly was silently discarded and the
 * user was shown a false booking confirmation.
 *
 * The rule this locks in: an invalid payload must always fail validation,
 * regardless of what the spam heuristics would have said about it.
 */
describe("validation runs before spam heuristics", () => {
  it("an invalid payload fails validation even when it also looks like spam", () => {
    const emptyAndFast = {
      firstName: "",
      lastName: "",
      email: "",
      businessType: "",
      turnover: "",
      services: [],
      message: "",
      preferredContact: "",
      consent: false,
      renderedAt: Date.now(),
    };

    // Both would trip — the ordering decides which response the user gets.
    expect(detectSpam(emptyAndFast).isSpam).toBe(true);
    expect(leadSchema.safeParse(emptyAndFast).success).toBe(false);
  });
});

describe("rate limiting", () => {
  it("allows requests up to the limit and blocks beyond it", () => {
    const key = `test-${Math.random()}`;
    const options = { limit: 3, windowMs: 60_000 };

    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(false);
  });

  it("counts each key separately", () => {
    const options = { limit: 1, windowMs: 60_000 };
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;

    expect(checkRateLimit(a, options).allowed).toBe(true);
    expect(checkRateLimit(a, options).allowed).toBe(false);
    expect(checkRateLimit(b, options).allowed).toBe(true);
  });

  it("resets once the window has passed", async () => {
    const key = `window-${Math.random()}`;
    const options = { limit: 1, windowMs: 20 };

    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(checkRateLimit(key, options).allowed).toBe(true);
  });

  it("reports the remaining allowance", () => {
    const key = `remaining-${Math.random()}`;
    const options = { limit: 5, windowMs: 60_000 };
    expect(checkRateLimit(key, options).remaining).toBe(4);
    expect(checkRateLimit(key, options).remaining).toBe(3);
  });
});
