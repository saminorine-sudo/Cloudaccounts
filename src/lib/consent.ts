/**
 * Cookie consent state.
 *
 * UK PECR requires consent before non-essential cookies or similar
 * technologies are set. Nothing optional loads until the user has actively
 * chosen — there is no implied consent from scrolling, and rejecting is as
 * easy as accepting.
 *
 * Preferences are stored in a first-party cookie so the server can read them
 * too. That cookie is itself strictly necessary and does not require consent.
 */

export const CONSENT_COOKIE = "ca_consent";
export const CONSENT_VERSION = 1;
/** Six months, after which consent is asked for again. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182;

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentState = {
  version: number;
  /** Always true — strictly necessary cookies cannot be declined. */
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

export const CONSENT_CHANGE_EVENT = "ca:consent-change";

export const consentCategories: {
  key: ConsentCategory;
  name: string;
  description: string;
  required: boolean;
}[] = [
  {
    key: "necessary",
    name: "Strictly necessary",
    description:
      "Required for the site to work — security, form submission and remembering your cookie choice. These cannot be turned off.",
    required: true,
  },
  {
    key: "analytics",
    name: "Analytics",
    description:
      "Helps us understand which pages and tools people use, so we can improve them. Nothing you enter into a calculator or form is sent to analytics.",
    required: false,
  },
  {
    key: "marketing",
    name: "Marketing",
    description:
      "Used to measure whether advertising leads to enquiries. Off unless you turn it on.",
    required: false,
  },
];

export function defaultConsent(): ConsentState {
  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: false,
    marketing: false,
    decidedAt: new Date().toISOString(),
  };
}

export function parseConsent(raw: string | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      decidedAt:
        typeof parsed.decidedAt === "string"
          ? parsed.decidedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsent(match?.split("=").slice(1).join("="));
}

export function writeConsent(state: ConsentState): void {
  if (typeof document === "undefined") return;

  const value = encodeURIComponent(JSON.stringify(state));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: state }));
}

export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const state = readConsent();
  return state ? Boolean(state[category]) : false;
}

/* -------------------------------------------------------------------------- */
/* External store bindings                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The consent cookie is external state, so components read it through
 * `useSyncExternalStore` rather than copying it into React state in an
 * effect. That avoids a render with the wrong value and keeps every consumer
 * in step when the preference changes.
 *
 * The snapshot is the raw cookie string — a stable primitive. Returning a
 * parsed object here would allocate a new value on every call and loop.
 */
export function subscribeConsent(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
}

export function consentSnapshot(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));
  return match ? match.split("=").slice(1).join("=") : null;
}

/** The server has no cookie access here, so it always renders "undecided". */
export function consentServerSnapshot(): string | null {
  return null;
}
