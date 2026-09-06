import "server-only";

import { honeypotField } from "@/lib/validation/schemas";

/**
 * Request-level protections for public form endpoints.
 */

/* -------------------------------------------------------------------------- */
/* Client identification                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Best-effort client IP.
 *
 * `x-forwarded-for` is only trustworthy behind a proxy that sets it, which is
 * the case on Vercel and most managed platforms. The leftmost entry is used
 * and everything else ignored. This is good enough for rate limiting and must
 * not be treated as identity.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */

type Bucket = { count: number; resetAt: number };

/**
 * In-process fixed-window rate limiter.
 *
 * LIMITATION: this lives in the memory of a single instance. On a serverless
 * platform each instance keeps its own counters, so the effective limit is
 * higher than configured and resets on cold start. It raises the cost of
 * casual abuse but is not a defence against a distributed attack.
 *
 * Before production, back this with a shared store — a Postgres table with a
 * counter, or Upstash Redis — behind the same `checkRateLimit` signature.
 */
const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      allowed: true,
      remaining: options.limit - 1,
      retryAfter: Math.ceil(options.windowMs / 1000),
    };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  return {
    allowed: existing.count <= options.limit,
    remaining: Math.max(0, options.limit - existing.count),
    retryAfter,
  };
}

/* -------------------------------------------------------------------------- */
/* Spam heuristics                                                            */
/* -------------------------------------------------------------------------- */

/** A genuine person cannot complete and submit a form this fast. */
const MIN_FILL_MS = 2_000;

export type SpamVerdict = {
  isSpam: boolean;
  reason?: "honeypot" | "too-fast";
};

/**
 * Cheap, privacy-preserving spam checks that need no third-party service and
 * set no cookies — so they work before any consent decision.
 *
 * A positive verdict should be answered with a normal success response and
 * the submission discarded. Returning an error tells the bot what tripped it.
 *
 * IMPORTANT: run this AFTER schema validation, never before. Because a spam
 * verdict returns a success response, checking it first would swallow a
 * genuinely invalid submission and show the user a false confirmation instead
 * of the field errors they need. Validating first costs a bot nothing it
 * could not learn from a normal typo, and keeps real users correct.
 */
export function detectSpam(payload: Record<string, unknown>): SpamVerdict {
  const honeypotValue = payload[honeypotField];
  if (typeof honeypotValue === "string" && honeypotValue.trim() !== "") {
    return { isSpam: true, reason: "honeypot" };
  }

  const renderedAt = Number(payload.renderedAt);
  if (Number.isFinite(renderedAt) && renderedAt > 0) {
    const elapsed = Date.now() - renderedAt;
    // A negative elapsed time means a forged or skewed timestamp.
    if (elapsed < MIN_FILL_MS) return { isSpam: true, reason: "too-fast" };
  }

  return { isSpam: false };
}

/* -------------------------------------------------------------------------- */
/* JSON responses                                                             */
/* -------------------------------------------------------------------------- */

export function jsonResponse(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> },
): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json",
      // Form endpoints must never be cached by a CDN or the browser.
      "cache-control": "no-store",
      ...init?.headers,
    },
  });
}

/** Rejects payloads too large to be a legitimate form submission. */
export const MAX_BODY_BYTES = 32 * 1024;

export async function readJsonBody(
  request: Request,
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; error: string }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { ok: false, status: 415, error: "Expected application/json" };
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Request body too large" };
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Request body too large" };
  }

  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON" };
  }
}
