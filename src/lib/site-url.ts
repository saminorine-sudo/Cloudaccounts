/**
 * Resolves the canonical origin of this deployment.
 *
 * `metadataBase` in the root layout is built from this, and `new URL()` throws
 * on anything that is not a valid absolute URL — so a bad value here does not
 * degrade a canonical tag, it fails the build. That is worth being careful
 * about, because the most likely bad value is not a typo: adding an
 * environment variable in a hosting dashboard and saving it before filling in
 * the value leaves an empty string, and `??` does not treat that as absent.
 *
 * Hence: trim, reject anything that will not parse, and fall through.
 *
 * Every variable consulted is `NEXT_PUBLIC_`, deliberately. A server-only
 * variable would be inlined as `undefined` in the browser bundle, so the
 * server and the client would resolve different origins and any markup built
 * from this would mismatch on hydration.
 */

/** The last resort. Obviously a placeholder, which is the point. */
const FALLBACK_URL = "https://www.cloudaccounts.example";

function normalise(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  // Vercel supplies bare hostnames, with no scheme — but only a value with no
  // scheme at all may have one prepended. Testing for `https?` alone would
  // turn "ftp://example.com" into "https://ftp://example.com", which parses
  // perfectly well as the host "ftp" and yields a silently wrong origin.
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  const withScheme = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    // No trailing slash: every consumer appends a path beginning with one.
    return parsed.origin;
  } catch {
    return null;
  }
}

export function resolveSiteUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  return (
    // An explicit setting always wins.
    normalise(env.NEXT_PUBLIC_SITE_URL) ??
    // The project's stable production domain, set by Vercel.
    normalise(env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ??
    // This specific deployment. Right for previews, wrong for production —
    // which is why it sits below the production domain rather than above it.
    normalise(env.NEXT_PUBLIC_VERCEL_URL) ??
    FALLBACK_URL
  );
}

export const SITE_URL_FALLBACK = FALLBACK_URL;
