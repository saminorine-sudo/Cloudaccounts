import type { ConsultationType } from "@/types/content";

/**
 * Consultation availability.
 *
 * Pure functions over the consultation type's configured weekdays and slot
 * times, so the same rules run in the browser (to render the picker) and on
 * the server (to authorise the submission). The server never trusts the
 * client's choice of slot — `isSlotOffered` is re-checked on POST.
 *
 * INTEGRATION NOTE: this is a deliberately simple fallback, not a calendar
 * system. When a booking provider (Cal.com, Calendly, Google Calendar) is
 * connected, `availableSlotsFor` becomes a call to that provider's free/busy
 * API and this rule set stays as the fallback. The spec is explicit that we
 * should integrate rather than build a calendar, so nothing here should grow
 * into one.
 *
 * All dates are handled in UTC to keep server and client rendering identical.
 * Slot times are London local time and are labelled as such in the UI.
 */

/** Earliest bookable day, in days from today. Gives the team lead time. */
export const LEAD_TIME_DAYS = 1;

/** How far ahead the picker offers dates. */
export const BOOKING_WINDOW_DAYS = 21;

function startOfUtcDay(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fromIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/**
 * Bookable dates for a consultation type.
 *
 * `today` is injected rather than read from the clock so the function stays
 * pure and testable.
 */
export function availableDates(
  type: ConsultationType,
  today: Date = new Date(),
): Date[] {
  const start = startOfUtcDay(today);
  const dates: Date[] = [];

  for (
    let offset = LEAD_TIME_DAYS;
    offset <= LEAD_TIME_DAYS + BOOKING_WINDOW_DAYS;
    offset += 1
  ) {
    const candidate = new Date(start);
    candidate.setUTCDate(candidate.getUTCDate() + offset);

    // getUTCDay: 0 = Sunday … 6 = Saturday. Config uses 1 = Monday … 5 = Friday.
    if (type.availableWeekdays.includes(candidate.getUTCDay())) {
      dates.push(candidate);
    }
  }

  return dates;
}

export function availableSlotsFor(
  type: ConsultationType,
  isoDate: string,
  today: Date = new Date(),
): string[] {
  const isOffered = availableDates(type, today).some(
    (date) => toIsoDate(date) === isoDate,
  );
  return isOffered ? [...type.slotTimes] : [];
}

/** Server-side authorisation check for a submitted slot. */
export function isSlotOffered(
  type: ConsultationType,
  isoDate: string,
  time: string,
  today: Date = new Date(),
): boolean {
  return availableSlotsFor(type, isoDate, today).includes(time);
}

/** "2:30pm" from "14:30" — UK convention, no leading zero. */
export function formatSlotTime(time: string): string {
  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);
  const period = hour < 12 ? "am" : "pm";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === "00"
    ? `${displayHour}${period}`
    : `${displayHour}:${minute}${period}`;
}
