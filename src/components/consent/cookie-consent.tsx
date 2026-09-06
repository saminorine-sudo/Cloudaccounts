"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { track } from "@/lib/analytics";
import {
  consentCategories,
  consentServerSnapshot,
  consentSnapshot,
  defaultConsent,
  parseConsent,
  subscribeConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

const OPEN_PREFERENCES_EVENT = "ca:open-cookie-preferences";

/** Lets any link on the site reopen the preferences panel. */
export function openCookiePreferences(): void {
  window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT));
}

/**
 * Cookie consent banner and preference panel.
 *
 * Accept and reject carry equal visual weight, which is what the ICO expects —
 * a prominent "Accept all" beside a buried "Reject" is not a free choice.
 * Nothing optional loads until a decision is recorded.
 */
export function CookieConsent() {
  // The cookie is the source of truth, read through an external store rather
  // than copied into state — so the banner never renders a stale decision and
  // every consumer stays in step when the preference changes.
  const rawConsent = useSyncExternalStore(
    subscribeConsent,
    consentSnapshot,
    consentServerSnapshot,
  );
  const state = useMemo<ConsentState | null>(
    () => parseConsent(rawConsent ?? undefined),
    [rawConsent],
  );

  const [showPreferences, setShowPreferences] = useState(false);
  // Null means "follow the saved consent"; a value means the user is
  // mid-edit. Deriving the draft avoids syncing it from an effect.
  const [draftOverride, setDraftOverride] = useState<{
    analytics: boolean;
    marketing: boolean;
  } | null>(null);

  const draft = draftOverride ?? {
    analytics: state?.analytics ?? false,
    marketing: state?.marketing ?? false,
  };

  useEffect(() => {
    const onOpen = () => {
      setDraftOverride(null);
      setShowPreferences(true);
    };
    window.addEventListener(OPEN_PREFERENCES_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, onOpen);
  }, []);

  const save = useCallback((analytics: boolean, marketing: boolean) => {
    writeConsent({ ...defaultConsent(), analytics, marketing });
    setDraftOverride(null);
    setShowPreferences(false);
    track({ name: "consent_updated", analytics, marketing });
  }, []);

  // Hydration note: the server always renders "undecided", so the banner is
  // hidden until the client snapshot arrives. That is the safe direction —
  // it can never flash a consent state the user has not chosen.
  if (state !== null && !showPreferences) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-60 p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-card bg-white shadow-pop ring-1 ring-line">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:inline-flex">
              <Icon name="shield" className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h2
                id="cookie-consent-title"
                className="text-base font-semibold text-ink"
              >
                Cookies on this site
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                We use strictly necessary cookies to make the site work. We
                would also like to set optional cookies to understand how the
                site is used. Optional cookies are off until you turn them on,
                and you can change your choice at any time.{" "}
                <a
                  href="/cookie-policy"
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  Read our cookie policy
                </a>
                .
              </p>
            </div>
          </div>

          {showPreferences ? (
            <ul className="mt-5 divide-y divide-line rounded-xl ring-1 ring-line">
              {consentCategories.map((category) => {
                const isRequired = category.required;
                const checked = isRequired
                  ? true
                  : draft[category.key as "analytics" | "marketing"];

                return (
                  <li
                    key={category.key}
                    className="flex items-start gap-3 p-4"
                  >
                    <input
                      id={`consent-${category.key}`}
                      type="checkbox"
                      checked={checked}
                      disabled={isRequired}
                      onChange={(event) =>
                        setDraftOverride({
                          ...draft,
                          [category.key]: event.target.checked,
                        })
                      }
                      className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded border-2 border-slate-300 accent-brand-700 disabled:opacity-60"
                    />
                    <div>
                      <label
                        htmlFor={`consent-${category.key}`}
                        className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink"
                      >
                        {category.name}
                        {isRequired ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.6875rem] font-medium text-muted">
                            Always on
                          </span>
                        ) : null}
                      </label>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {category.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div
            className={cn(
              "mt-5 flex flex-col gap-2.5 sm:flex-row",
              showPreferences ? "sm:justify-end" : "sm:justify-between",
            )}
          >
            {!showPreferences ? (
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="self-start text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800 sm:self-center"
              >
                Manage preferences
              </button>
            ) : null}

            <div className="flex flex-col gap-2.5 sm:flex-row">
              {showPreferences ? (
                <Button
                  variant="secondary"
                  onClick={() => save(draft.analytics, draft.marketing)}
                >
                  Save preferences
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => save(false, false)}>
                Reject optional
              </Button>
              <Button onClick={() => save(true, true)}>Accept all</Button>
            </div>
          </div>

          {state ? (
            <p className="mt-4 text-xs text-muted">
              Current setting: analytics{" "}
              <strong className="font-medium text-ink-soft">
                {state.analytics ? "on" : "off"}
              </strong>
              , marketing{" "}
              <strong className="font-medium text-ink-soft">
                {state.marketing ? "on" : "off"}
              </strong>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Footer/legal-page link that reopens the preference panel. */
export function CookiePreferencesLink({
  className,
  children = "Cookie preferences",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={cn(
        "text-brand-700 underline underline-offset-2 hover:text-brand-800",
        className,
      )}
    >
      {children}
    </button>
  );
}
