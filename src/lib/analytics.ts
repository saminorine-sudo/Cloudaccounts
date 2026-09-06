"use client";

import { hasConsent } from "@/lib/consent";

/**
 * Analytics event layer.
 *
 * Provider-agnostic: events are pushed to `window.dataLayer`, which GA4 via
 * Google Tag Manager, Plausible or anything else can consume. Swapping
 * provider does not mean rewriting call sites.
 *
 * Two rules are enforced here rather than left to the caller:
 *
 *  1. Nothing is sent without analytics consent.
 *  2. No financial or personal values are ever sent. Calculator events record
 *     that a calculation happened and which calculator it was — never the
 *     profit, salary or turnover the user typed. Form events record the form
 *     and the outcome, never the field values. Sending a client's financial
 *     data to a third-party analytics provider would be a serious problem
 *     regardless of consent, so the allowed shape is fixed in the types.
 */

type AllowedValue = string | number | boolean;

export type AnalyticsEvent =
  | { name: "cta_click"; target: string; location: string }
  | { name: "phone_click"; location: string }
  | { name: "email_click"; location: string }
  | { name: "calculator_used"; calculator: string }
  | { name: "lead_submitted"; source: string }
  | { name: "contact_submitted"; source: string }
  | { name: "booking_submitted"; consultationType: string }
  | { name: "form_error"; form: string }
  | { name: "consent_updated"; analytics: boolean; marketing: boolean };

declare global {
  interface Window {
    dataLayer?: Record<string, AllowedValue>[];
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  // Consent decisions themselves must be recordable, since that event is what
  // tells the tag manager the consent state has changed.
  if (event.name !== "consent_updated" && !hasConsent("analytics")) return;

  const { name, ...params } = event;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params } as Record<
    string,
    AllowedValue
  >);
}

/** Attribute hook used by the delegated click listener in AnalyticsListener. */
export const ANALYTICS_ATTRIBUTE = "data-analytics";
