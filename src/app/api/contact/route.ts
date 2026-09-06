import {
  adminContactEmail,
  contactAcknowledgementEmail,
  dispatchWebhook,
  sendEmail,
} from "@/lib/server/notifications";
import {
  checkRateLimit,
  clientIp,
  detectSpam,
  jsonResponse,
  readJsonBody,
} from "@/lib/server/security";
import { createContactSubmission } from "@/lib/server/submissions";
import { contactSchema, fieldErrors } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`contact:${ip}`, RATE_LIMIT);

  if (!limit.allowed) {
    return jsonResponse(
      {
        ok: false,
        error:
          "Too many messages from this connection. Please try again shortly, or call us instead.",
      },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return jsonResponse({ ok: false, error: body.error }, { status: body.status });
  }

  const payload = body.data as Record<string, unknown>;

  // Validation runs before the spam heuristics — see `detectSpam`.
  const parsed = contactSchema.safeParse(payload);
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

  const spam = detectSpam(payload);
  if (spam.isSpam) {
    console.info(`[contact:discarded] reason=${spam.reason}`);
    return jsonResponse({ ok: true, discarded: true });
  }

  try {
    const submission = await createContactSubmission(parsed.data);

    await Promise.allSettled([
      sendEmail(adminContactEmail(submission)),
      sendEmail(contactAcknowledgementEmail(submission)),
      dispatchWebhook("contact.created", {
        id: submission.id,
        createdAt: submission.createdAt,
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        subject: submission.subject,
      }),
    ]);

    return jsonResponse({ ok: true, id: submission.id }, { status: 201 });
  } catch (error) {
    console.error(
      "[contact:error]",
      error instanceof Error ? error.message : "unknown",
    );
    return jsonResponse(
      {
        ok: false,
        error:
          "We couldn't send your message. Please try again, or email us directly.",
      },
      { status: 500 },
    );
  }
}
