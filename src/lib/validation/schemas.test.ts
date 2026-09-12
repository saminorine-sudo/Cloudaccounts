import { describe, expect, it } from "vitest";

import {
  bookingSchema,
  contactSchema,
  fieldErrors,
  leadSchema,
} from "./schemas";

const validLead = {
  firstName: "Sarah",
  lastName: "Mitchell",
  email: "sarah@example.com",
  phone: "020 7946 0958",
  businessName: "Mitchell Consulting",
  businessType: "limited-company",
  turnover: "250k-500k",
  services: ["accounting", "vat"],
  message: "Looking to switch accountants.",
  preferredContact: "email",
  consent: true,
};

const tomorrow = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  return date.toISOString().slice(0, 10);
};

const validBooking = {
  consultationTypeSlug: "free-consultation",
  date: tomorrow(),
  time: "10:00",
  firstName: "Sarah",
  lastName: "Mitchell",
  email: "sarah@example.com",
  consent: true,
};

describe("lead schema", () => {
  it("accepts a complete enquiry", () => {
    expect(leadSchema.safeParse(validLead).success).toBe(true);
  });

  it("normalises the email address to lower case", () => {
    const parsed = leadSchema.parse({
      ...validLead,
      email: "  SARAH@Example.COM  ",
    });
    expect(parsed.email).toBe("sarah@example.com");
  });

  it("requires consent to be explicitly given", () => {
    const result = leadSchema.safeParse({ ...validLead, consent: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).consent).toBeTruthy();
    }
  });

  it("requires at least one service", () => {
    const result = leadSchema.safeParse({ ...validLead, services: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown business type", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      businessType: "megacorp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown service, so the options list is authoritative", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      services: ["accounting", "not-a-real-service"],
    });
    expect(result.success).toBe(false);
  });

  it("treats the phone number as optional", () => {
    expect(leadSchema.safeParse({ ...validLead, phone: "" }).success).toBe(true);
  });

  it("accepts common UK phone formats", () => {
    for (const phone of [
      "020 7946 0958",
      "+44 20 7946 0958",
      "07700 900123",
      "(020) 7946-0958",
    ]) {
      expect(leadSchema.safeParse({ ...validLead, phone }).success).toBe(true);
    }
  });

  it("rejects a phone number with too few digits", () => {
    expect(leadSchema.safeParse({ ...validLead, phone: "12345" }).success).toBe(
      false,
    );
  });

  it("bounds the message length", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      message: "x".repeat(4001),
    });
    expect(result.success).toBe(false);
  });

  it("reports every invalid field at once", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      email: "nope",
      services: [],
      consent: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(Object.keys(errors).sort()).toEqual([
        "consent",
        "email",
        "services",
      ]);
    }
  });
});

describe("single-line sanitising", () => {
  /**
   * Names and subjects are interpolated into email Subject headers. A value
   * carrying a carriage return is classic header-injection input, so it must
   * never survive validation intact.
   */
  it("strips newlines from a name", () => {
    const parsed = leadSchema.parse({
      ...validLead,
      firstName: "Sarah\r\nBcc: victim@example.com",
    });
    expect(parsed.firstName).not.toMatch(/[\r\n]/);
    expect(parsed.firstName).toBe("Sarah Bcc: victim@example.com");
  });

  it("strips a newline from a contact subject", () => {
    const parsed = contactSchema.parse({
      name: "Tom",
      email: "tom@example.com",
      subject: "Question\nBcc: victim@example.com",
      message: "When do I need to register for VAT?",
      consent: true,
    });
    expect(parsed.subject).not.toMatch(/[\r\n]/);
  });

  it("strips other control characters", () => {
    const parsed = leadSchema.parse({
      ...validLead,
      lastName: "Mit\u0000chell\u007f",
    });
    expect(parsed.lastName).toBe("Mit chell");
  });

  it("collapses runs of whitespace rather than leaving gaps", () => {
    const parsed = leadSchema.parse({ ...validLead, firstName: "  Sarah   Jane  " });
    expect(parsed.firstName).toBe("Sarah Jane");
  });

  it("still rejects a value that is only control characters", () => {
    const result = leadSchema.safeParse({ ...validLead, firstName: "\r\n\t" });
    expect(result.success).toBe(false);
  });

  it("leaves ordinary values untouched", () => {
    const parsed = leadSchema.parse({ ...validLead, firstName: "Sarah-Jane" });
    expect(parsed.firstName).toBe("Sarah-Jane");
  });
});

describe("contact schema", () => {
  const valid = {
    name: "Tom Bradley",
    email: "tom@example.com",
    subject: "VAT question",
    message: "When do I need to register for VAT?",
    consent: true,
  };

  it("accepts a complete message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a message of reasonable length", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(
      false,
    );
  });

  it("requires a subject", () => {
    expect(contactSchema.safeParse({ ...valid, subject: "" }).success).toBe(
      false,
    );
  });
});

describe("booking schema", () => {
  it("accepts a valid future booking", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it("rejects a date in the past", () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      date: "2020-01-06",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).date).toBeTruthy();
    }
  });

  it("rejects a malformed date", () => {
    expect(
      bookingSchema.safeParse({ ...validBooking, date: "06/01/2030" }).success,
    ).toBe(false);
  });

  it("rejects an impossible time", () => {
    for (const time of ["25:00", "10:60", "9:00", "morning"]) {
      expect(bookingSchema.safeParse({ ...validBooking, time }).success).toBe(
        false,
      );
    }
  });

  it("requires consent", () => {
    expect(
      bookingSchema.safeParse({ ...validBooking, consent: false }).success,
    ).toBe(false);
  });
});
