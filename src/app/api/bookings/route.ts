import { isSlotOffered } from "@/lib/booking/availability";
import { getConsultationTypeBySlug } from "@/lib/content";
import { formatDate } from "@/lib/format";
import {
  adminBookingEmail,
  bookingConfirmationEmail,
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
import {
  createAppointment,
  isSlotTaken,
  SlotUnavailableError,
} from "@/lib/server/submissions";
import { bookingSchema, fieldErrors } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkRateLimit(`bookings:${ip}`, RATE_LIMIT);

  if (!limit.allowed) {
    return jsonResponse(
      {
        ok: false,
        error:
          "Too many booking attempts from this connection. Please try again shortly, or call us to book.",
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
  const parsed = bookingSchema.safeParse(payload);
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
    console.info(`[booking:discarded] reason=${spam.reason}`);
    return jsonResponse({ ok: true, discarded: true });
  }

  const input = parsed.data;

  const consultationType = await getConsultationTypeBySlug(
    input.consultationTypeSlug,
  );
  if (!consultationType) {
    return jsonResponse(
      { ok: false, error: "That consultation type is no longer available." },
      { status: 422 },
    );
  }

  // The client picked the slot, but the server decides whether it exists.
  // Without this, a crafted request could book any date and time at all.
  if (!isSlotOffered(consultationType, input.date, input.time)) {
    return jsonResponse(
      {
        ok: false,
        error:
          "That time is no longer available. Please choose another slot.",
        fields: { time: "Not available" },
      },
      { status: 409 },
    );
  }

  if (await isSlotTaken(consultationType.slug, input.date, input.time)) {
    return jsonResponse(
      {
        ok: false,
        error: "That slot has just been taken. Please choose another time.",
        fields: { time: "Already booked" },
      },
      { status: 409 },
    );
  }

  try {
    const appointment = await createAppointment(input);
    const dateLabel = formatDate(appointment.date);

    await Promise.allSettled([
      sendEmail(
        adminBookingEmail({
          ...appointment,
          consultationName: consultationType.name,
          dateLabel,
        }),
      ),
      sendEmail(
        bookingConfirmationEmail({
          firstName: appointment.firstName,
          email: appointment.email,
          consultationName: consultationType.name,
          dateLabel,
          time: appointment.time,
          durationMinutes: consultationType.durationMinutes,
          mode: consultationType.mode,
        }),
      ),
      dispatchWebhook("appointment.created", {
        id: appointment.id,
        createdAt: appointment.createdAt,
        consultationType: consultationType.slug,
        consultationName: consultationType.name,
        durationMinutes: consultationType.durationMinutes,
        date: appointment.date,
        time: appointment.time,
        firstName: appointment.firstName,
        lastName: appointment.lastName,
        email: appointment.email,
        phone: appointment.phone,
        businessName: appointment.businessName,
        status: appointment.status,
      }),
    ]);

    return jsonResponse(
      { ok: true, id: appointment.id, status: appointment.status },
      { status: 201 },
    );
  } catch (error) {
    // Two people can pass the availability check above at the same moment.
    // The database's unique index decides which one actually got the slot,
    // and the loser is told plainly rather than shown a server error.
    if (error instanceof SlotUnavailableError) {
      return jsonResponse(
        {
          ok: false,
          error: "That slot has just been taken. Please choose another time.",
          fields: { time: "Already booked" },
        },
        { status: 409 },
      );
    }

    console.error(
      "[booking:error]",
      error instanceof Error ? error.message : "unknown",
    );
    return jsonResponse(
      {
        ok: false,
        error:
          "We couldn't complete your booking. Please try again, or call us and we'll book you in.",
      },
      { status: 500 },
    );
  }
}
