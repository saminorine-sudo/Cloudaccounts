import { z } from "zod";

import {
  businessTypes,
  contactMethods,
  honeypotField,
  serviceOptions,
  turnoverBands,
} from "./options";

// Re-exported so server code has a single import for schemas and options.
// Client components must import from "./options" directly — importing this
// module drags Zod into the browser bundle.
export {
  businessTypes,
  contactMethods,
  honeypotField,
  serviceOptions,
  turnoverBands,
};

/**
 * Validation schemas.
 *
 * The same schema runs on the client (for immediate feedback) and on the
 * server (as the actual trust boundary). Client-side validation is a
 * convenience; the server never assumes it ran.
 *
 * Every string field is bounded. Unbounded text fields are how a form becomes
 * a storage-exhaustion vector, and length limits also keep the data usable in
 * an admin table later.
 */

/**
 * Collapses anything that is not a single line of text.
 *
 * Several of these fields end up in an email Subject — "New enquiry — {name}",
 * "Contact form — {subject}". A value carrying a carriage return is header
 * injection waiting for a mail transport that concatenates rather than
 * encodes. The transactional provider in use takes JSON and encodes headers
 * itself, so this is defence in depth rather than the only guard, but a
 * newline in a name field is invalid input regardless.
 */
const singleLine = (value: string) =>
  value.replace(/\p{Cc}+/gu, " ").replace(/\s{2,}/g, " ").trim();

const name = z
  .string()
  .transform(singleLine)
  .pipe(
    z
      .string()
      .min(1, "Required")
      .max(80, "Please keep this under 80 characters"),
  );

const email = z
  .string()
  .trim()
  .min(1, "Required")
  .max(254, "That email address is too long")
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

/**
 * UK-tolerant phone validation.
 *
 * Deliberately permissive about spacing, dashes, brackets and a leading +44,
 * because rejecting a number a person actually has is worse than accepting a
 * slightly odd format. It checks the digit count rather than pattern-matching
 * a format.
 */
const phoneOptional = z
  .string()
  .trim()
  .max(30, "That phone number is too long")
  .refine(
    (value) => value === "" || /^[\d\s()+\-.]{7,30}$/.test(value),
    "Enter a valid phone number",
  )
  .refine((value) => {
    if (value === "") return true;
    const digits = value.replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15;
  }, "Enter a valid phone number")
  .optional()
  .or(z.literal(""));

const message = z
  .string()
  .trim()
  .max(4000, "Please keep your message under 4,000 characters");

const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((option) => option.value) as [string, ...string[]];

const honeypot = z
  .string()
  .max(200)
  .optional()
  .or(z.literal("")),
  /** Milliseconds since the form was rendered — used to reject instant posts. */
  renderedAt = z.coerce.number().int().nonnegative().optional();

export const leadSchema = z.object({
  firstName: name,
  lastName: name,
  email,
  phone: phoneOptional,
  businessName: z
    .string()
    .transform(singleLine)
    .pipe(z.string().max(120, "Please keep this under 120 characters"))
    .optional()
    .or(z.literal("")),
  businessType: z.enum(values(businessTypes), {
    message: "Select your business type",
  }),
  turnover: z.enum(values(turnoverBands), {
    message: "Select an estimated turnover",
  }),
  services: z
    .array(z.enum(values(serviceOptions)))
    .min(1, "Select at least one service")
    .max(serviceOptions.length),
  message,
  preferredContact: z.enum(values(contactMethods), {
    message: "Select a preferred contact method",
  }),
  consent: z.literal(true, {
    message: "Please confirm you are happy for us to contact you",
  }),
  /** Where the enquiry came from, e.g. a pricing plan slug. */
  source: z.string().trim().max(60).optional().or(z.literal("")),
  [honeypotField]: honeypot,
  renderedAt,
});

export type LeadInput = z.infer<typeof leadSchema>;

export const contactSchema = z.object({
  name,
  email,
  phone: phoneOptional,
  subject: z
    .string()
    .transform(singleLine)
    .pipe(
      z
        .string()
        .min(1, "Required")
        .max(140, "Please keep this under 140 characters"),
    ),
  message: message.min(10, "Please give us a little more detail"),
  consent: z.literal(true, {
    message: "Please confirm you are happy for us to contact you",
  }),
  [honeypotField]: honeypot,
  renderedAt,
});

export type ContactInput = z.infer<typeof contactSchema>;

export const bookingSchema = z.object({
  consultationTypeSlug: z.string().trim().min(1).max(60),
  /** ISO date, YYYY-MM-DD. */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a date")
    .refine((value) => {
      const parsed = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) return false;
      // Never accept a booking in the past, whatever the client sent.
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      return parsed.getTime() >= today.getTime();
    }, "Choose a date in the future"),
  /** 24-hour HH:mm. */
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Select a time"),
  firstName: name,
  lastName: name,
  email,
  phone: phoneOptional,
  businessName: z
    .string()
    .transform(singleLine)
    .pipe(z.string().max(120))
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(2000, "Please keep your notes under 2,000 characters")
    .optional()
    .or(z.literal("")),
  consent: z.literal(true, {
    message: "Please confirm you are happy for us to contact you",
  }),
  [honeypotField]: honeypot,
  renderedAt,
});

export type BookingInput = z.infer<typeof bookingSchema>;

/** Flattens Zod issues into a `{ field: message }` map for the form UI. */
export function fieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}
