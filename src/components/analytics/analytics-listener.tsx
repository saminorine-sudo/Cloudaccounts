"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";

/**
 * Delegated click tracking.
 *
 * One listener at the document root reads `data-analytics` off the nearest
 * ancestor, so CTAs opt in with an attribute instead of every button needing
 * its own handler. `tel:` and `mailto:` links are recognised automatically.
 *
 * Consent is enforced inside `track`, so this listener can run unconditionally
 * without sending anything before the user has decided.
 */
export function AnalyticsListener() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>("[data-analytics], a[href]");
      if (!element) return;

      const label = element.getAttribute("data-analytics");
      const href = element.getAttribute("href") ?? "";

      if (href.startsWith("tel:")) {
        track({ name: "phone_click", location: label ?? "link" });
        return;
      }
      if (href.startsWith("mailto:")) {
        track({ name: "email_click", location: label ?? "link" });
        return;
      }
      if (label) {
        track({
          name: "cta_click",
          target: label,
          location: window.location.pathname,
        });
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
