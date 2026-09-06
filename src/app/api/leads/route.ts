import {
  adminLeadEmail,
  dispatchWebhook,
  leadAcknowledgementEmail,
  sendEmail,
} from "@/lib/server/notifications";
import {
  checkRateLimit,
  clientIp,
  detectSpam,
  jsonResponse,
  readJsonBody,
} from "@/lib/server/security";
import { createLead } from "@/lib/server/submissions";
import { fieldErrors, leadSchema } from "@/lib/validation/schemas";

/** Never prerender or cache a mutation endpoint. */
export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`leads:${ip}`, RATE_LIMIT);

  if (!limit.allowed) {
    return jsonResponse(
      {
        ok: false,
        error:
          "Too many submissions from this connection. Please try again shortly, or call us instead.",
      },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return jsonResponse({ ok: false, error: body.error }, { status: body.status });
  }

  const payload = body.data as Record<string, unknown>;

  // Validate before the spam heuristics. A spam verdict returns a success
  // response, so checking it first would hide real validation errors from a
  // genuine user behind a false confirmation.
  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        error: "Please check the highlighted fields and try again.",
        fields: fieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  // Spam gets a success response and nothing else. Telling a bot it was
  // detected only helps it adapt.
  const spam = detectSpam(payload);
  if (spam.isSpam) {
    console.info(`[lead:discarded] reason=${spam.reason}`);
    return jsonResponse({ ok: true, discarded: true });
  }

  try {
    const lead = await createLead(parsed.data);

    // Notifications run after the record is stored, so a mail or automation
    // outage can never lose an enquiry.
    await Promise.allSettled([
      sendEmail(adminLeadEmail(lead)),
      sendEmail(leadAcknowledgementEmail(lead)),
      dispatchWebhook("lead.created", {
        id: lead.id,
        createdAt: lead.createdAt,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        businessName: lead.businessName,
        businessType: lead.businessType,
        turnover: lead.turnover,
        services: lead.services,
        preferredContact: lead.preferredContact,
        source: lead.source,
        status: lead.status,
      }),
    ]);

    return jsonResponse({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    // Log the failure, not the payload — it contains personal data.
    console.error(
      "[lead:error]",
      error instanceof Error ? error.message : "unknown",
    );
    return jsonResponse(
      {
        ok: false,
        error:
          "We couldn't submit your enquiry. Please try again, or call us and we'll take the details over the phone.",
      },
      { status: 500 },
    );
  }
}
