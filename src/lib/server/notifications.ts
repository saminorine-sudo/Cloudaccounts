import "server-only";

import { siteSettings } from "@/content/site";

/**
 * Outbound notifications: transactional email and automation webhooks.
 *
 * Both are provider-agnostic. Email goes through `sendEmail`, which logs in
 * development and posts to a transactional provider when credentials are
 * configured. Automation goes through `dispatchWebhook`, which is the n8n
 * integration point.
 *
 * Nothing here throws into the request path. A failed notification must never
 * cost the user their submission — the record is already stored by the time
 * these run, so failures are logged and swallowed.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  /** Plain text only. No user input is ever interpolated into HTML here. */
  text: string;
  replyTo?: string;
};

const EMAIL_FROM = process.env.EMAIL_FROM ?? "no-reply@cloudaccounts.example";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? siteSettings.contact.email;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  // No provider configured: log the intent so the flow is verifiable in
  // development without silently pretending mail was sent.
  if (!RESEND_API_KEY) {
    console.info(
      `[email:not-configured] to=${message.to} subject="${message.subject}"`,
    );
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      // Log the status only. The body can echo recipient details, and those
      // do not belong in application logs.
      console.error(`[email:failed] status=${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email:error]", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Posts an event to the automation webhook (n8n).
 *
 * Payloads carry an event name and the stored record's id plus the fields an
 * automation needs to route and personalise. A shared secret is sent in a
 * header so the receiving workflow can verify the call came from this app.
 */
export type WebhookEvent =
  | "lead.created"
  | "contact.created"
  | "appointment.created";

export async function dispatchWebhook(
  event: WebhookEvent,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET
          ? { "x-cloudaccounts-signature": process.env.N8N_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({
        event,
        sentAt: new Date().toISOString(),
        data: payload,
      }),
    });

    if (!response.ok) {
      console.error(`[webhook:failed] event=${event} status=${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      `[webhook:error] event=${event}`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Message templates                                                          */
/* -------------------------------------------------------------------------- */

export function adminLeadEmail(lead: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  businessType: string;
  turnover: string;
  services: string[];
  preferredContact: string;
  message: string;
  source: string;
}): EmailMessage {
  return {
    to: ADMIN_EMAIL,
    replyTo: lead.email,
    subject: `New enquiry — ${lead.firstName} ${lead.lastName}`,
    text: [
      `New enquiry received.`,
      ``,
      `Name: ${lead.firstName} ${lead.lastName}`,
      `Email: ${lead.email}`,
      `Phone: ${lead.phone ?? "Not provided"}`,
      `Business: ${lead.businessName ?? "Not provided"}`,
      `Business type: ${lead.businessType}`,
      `Turnover: ${lead.turnover}`,
      `Services: ${lead.services.join(", ")}`,
      `Preferred contact: ${lead.preferredContact}`,
      `Source: ${lead.source}`,
      ``,
      `Message:`,
      lead.message || "(none)",
      ``,
      `Reference: ${lead.id}`,
    ].join("\n"),
  };
}

export function leadAcknowledgementEmail(lead: {
  firstName: string;
  email: string;
}): EmailMessage {
  return {
    to: lead.email,
    subject: "We've received your enquiry — CloudAccounts",
    text: [
      `Hi ${lead.firstName},`,
      ``,
      `Thanks for getting in touch with CloudAccounts. We've received your enquiry and one of our accountants will come back to you within one working day.`,
      ``,
      `If it's easier to talk it through, you can book a free 30-minute consultation at a time that suits you:`,
      `${siteSettings.url}/book-consultation`,
      ``,
      `Kind regards,`,
      `The CloudAccounts team`,
      `${siteSettings.contact.phone}`,
    ].join("\n"),
  };
}

export function contactAcknowledgementEmail(contact: {
  name: string;
  email: string;
  subject: string;
}): EmailMessage {
  return {
    to: contact.email,
    subject: "Thanks for contacting CloudAccounts",
    text: [
      `Hi ${contact.name},`,
      ``,
      `Thanks for your message about "${contact.subject}". We've received it and will reply within one working day.`,
      ``,
      `Kind regards,`,
      `The CloudAccounts team`,
      `${siteSettings.contact.phone}`,
    ].join("\n"),
  };
}

export function adminContactEmail(contact: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
}): EmailMessage {
  return {
    to: ADMIN_EMAIL,
    replyTo: contact.email,
    subject: `Contact form — ${contact.subject}`,
    text: [
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone ?? "Not provided"}`,
      `Subject: ${contact.subject}`,
      ``,
      `Message:`,
      contact.message,
      ``,
      `Reference: ${contact.id}`,
    ].join("\n"),
  };
}

export function bookingConfirmationEmail(booking: {
  firstName: string;
  email: string;
  consultationName: string;
  dateLabel: string;
  time: string;
  durationMinutes: number;
  mode: string;
}): EmailMessage {
  return {
    to: booking.email,
    subject: `Your consultation request — ${booking.dateLabel} at ${booking.time}`,
    text: [
      `Hi ${booking.firstName},`,
      ``,
      `Thanks for requesting a consultation with CloudAccounts.`,
      ``,
      `What: ${booking.consultationName} (${booking.durationMinutes} minutes, ${booking.mode})`,
      `When: ${booking.dateLabel} at ${booking.time} (UK time)`,
      ``,
      `We'll confirm this slot by email shortly. If the time no longer works, just reply to this message and we'll rearrange.`,
      ``,
      `Kind regards,`,
      `The CloudAccounts team`,
      `${siteSettings.contact.phone}`,
    ].join("\n"),
  };
}

export function adminBookingEmail(booking: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  consultationName: string;
  dateLabel: string;
  time: string;
  notes: string | null;
}): EmailMessage {
  return {
    to: ADMIN_EMAIL,
    replyTo: booking.email,
    subject: `New booking — ${booking.firstName} ${booking.lastName}, ${booking.dateLabel} ${booking.time}`,
    text: [
      `New consultation request.`,
      ``,
      `Type: ${booking.consultationName}`,
      `When: ${booking.dateLabel} at ${booking.time}`,
      ``,
      `Name: ${booking.firstName} ${booking.lastName}`,
      `Email: ${booking.email}`,
      `Phone: ${booking.phone ?? "Not provided"}`,
      `Business: ${booking.businessName ?? "Not provided"}`,
      ``,
      `Notes:`,
      booking.notes ?? "(none)",
      ``,
      `Reference: ${booking.id}`,
    ].join("\n"),
  };
}
