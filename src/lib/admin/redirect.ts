/**
 * Where to send someone after signing in.
 *
 * Only a path beneath `/admin` is accepted. Taking the raw value would make
 * the sign-in form an open redirect — `?next=https://evil.example` would
 * bounce a freshly authenticated staff member straight off the site, which is
 * a credible phishing route precisely because the link starts on the real
 * domain.
 *
 * Lives here rather than beside the action because a `"use server"` module may
 * only export async functions, and this has no business being a round trip.
 */
export function safeRedirectTarget(next: unknown): string {
  if (typeof next !== "string") return "/admin";
  // Must be a path on this site, beneath /admin.
  if (!next.startsWith("/admin")) return "/admin";
  // `//evil.example` is protocol-relative: absolute, despite the leading slash.
  if (next.startsWith("//")) return "/admin";
  // Backslashes are normalised to slashes by some browsers, so `/admin\\@evil`
  // can escape the prefix check after parsing.
  if (next.includes("\\")) return "/admin";
  // A control character can truncate the header a redirect is written into.
  if (/\p{Cc}/u.test(next)) return "/admin";
  return next;
}
