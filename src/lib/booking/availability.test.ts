import { describe, expect, it } from "vitest";

import {
  availableDates,
  availableSlotsFor,
  BOOKING_WINDOW_DAYS,
  formatSlotTime,
  isSlotOffered,
  LEAD_TIME_DAYS,
  toIsoDate,
} from "./availability";
import type { ConsultationType } from "@/types/content";

const weekdayType: ConsultationType = {
  isDemo: true,
  id: "test",
  slug: "free-consultation",
  name: "Free Consultation",
  description: "",
  durationMinutes: 30,
  mode: "Video call",
  priceLabel: "Free",
  availableWeekdays: [1, 2, 3, 4, 5],
  slotTimes: ["09:00", "14:30"],
  displayOrder: 1,
  isActive: true,
};

const midweekOnly: ConsultationType = {
  ...weekdayType,
  slug: "midweek",
  availableWeekdays: [2, 3, 4],
};

// A Wednesday, so the weekday arithmetic is unambiguous.
const wednesday = new Date("2026-09-09T00:00:00.000Z");

describe("available dates", () => {
  it("never offers today or the past", () => {
    const dates = availableDates(weekdayType, wednesday);
    for (const date of dates) {
      expect(date.getTime()).toBeGreaterThan(wednesday.getTime());
    }
  });

  it("respects the lead time", () => {
    const [first] = availableDates(weekdayType, wednesday);
    const earliest = new Date(wednesday);
    earliest.setUTCDate(earliest.getUTCDate() + LEAD_TIME_DAYS);
    expect(first.getTime()).toBeGreaterThanOrEqual(earliest.getTime());
  });

  it("stays inside the booking window", () => {
    const dates = availableDates(weekdayType, wednesday);
    const latest = new Date(wednesday);
    latest.setUTCDate(latest.getUTCDate() + LEAD_TIME_DAYS + BOOKING_WINDOW_DAYS);
    for (const date of dates) {
      expect(date.getTime()).toBeLessThanOrEqual(latest.getTime());
    }
  });

  it("excludes weekends for a weekday-only consultation", () => {
    for (const date of availableDates(weekdayType, wednesday)) {
      expect([1, 2, 3, 4, 5]).toContain(date.getUTCDay());
    }
  });

  it("honours a narrower weekday configuration", () => {
    const days = availableDates(midweekOnly, wednesday).map((d) =>
      d.getUTCDay(),
    );
    expect(new Set(days)).toEqual(new Set([2, 3, 4]));
  });

  it("returns nothing when no weekdays are configured", () => {
    expect(
      availableDates({ ...weekdayType, availableWeekdays: [] }, wednesday),
    ).toEqual([]);
  });
});

describe("slot authorisation", () => {
  it("offers the configured times on an available date", () => {
    const [first] = availableDates(weekdayType, wednesday);
    expect(availableSlotsFor(weekdayType, toIsoDate(first), wednesday)).toEqual([
      "09:00",
      "14:30",
    ]);
  });

  it("offers nothing on a date outside the window", () => {
    expect(availableSlotsFor(weekdayType, "2027-12-25", wednesday)).toEqual([]);
  });

  it("accepts a slot that is genuinely offered", () => {
    const [first] = availableDates(weekdayType, wednesday);
    expect(
      isSlotOffered(weekdayType, toIsoDate(first), "09:00", wednesday),
    ).toBe(true);
  });

  it("rejects a time that is not on the list", () => {
    const [first] = availableDates(weekdayType, wednesday);
    expect(
      isSlotOffered(weekdayType, toIsoDate(first), "03:00", wednesday),
    ).toBe(false);
  });

  it("rejects a weekend date even with a valid time", () => {
    // 2026-09-13 is a Sunday.
    expect(isSlotOffered(weekdayType, "2026-09-13", "09:00", wednesday)).toBe(
      false,
    );
  });

  it("rejects a date in the past", () => {
    expect(isSlotOffered(weekdayType, "2026-09-08", "09:00", wednesday)).toBe(
      false,
    );
  });
});

describe("slot time formatting", () => {
  it("uses UK 12-hour conventions", () => {
    expect(formatSlotTime("09:00")).toBe("9am");
    expect(formatSlotTime("09:30")).toBe("9:30am");
    expect(formatSlotTime("12:00")).toBe("12pm");
    expect(formatSlotTime("14:30")).toBe("2:30pm");
    expect(formatSlotTime("17:00")).toBe("5pm");
  });
});
