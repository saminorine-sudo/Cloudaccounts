import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/**
 * Supabase clients.
 *
 * Three of them, because they have genuinely different trust levels and
 * mixing them up is how a service-role key ends up in a browser bundle.
 *
 *   publicClient   anon key, no cookies. Public content reads.
 *   adminClient    service-role key. Server-only writes. Bypasses RLS.
 *   (server-side authenticated client lands with the admin area — see below.)
 *
 * Why the public client carries no cookies: reading cookies opts a route into
 * dynamic rendering, which would turn every statically generated marketing
 * page into a per-request render. Public content is the same for everyone, so
 * it is fetched anonymously and the pages stay prerendered.
 */

export type Db = SupabaseClient<Database>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

/**
 * Whether a Supabase project is configured.
 *
 * Until it is, the content repository falls back to the local content modules
 * and the submission store keeps records in memory, so the site runs with no
 * database at all. That is a development convenience, not a production mode —
 * `assertProductionConfig` below makes sure it cannot ship silently.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function canWriteToSupabase(): boolean {
  return Boolean(url && serviceRoleKey);
}

let cachedPublicClient: Db | null = null;
let cachedAdminClient: Db | null = null;

/**
 * Anonymous client for public content. Subject to RLS, so it can only ever
 * see rows the read policies expose — published posts, active services and so
 * on. It is safe for this key to be public precisely because of that.
 */
export function publicClient(): Db {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Check isSupabaseConfigured() before calling publicClient().",
    );
  }

  cachedPublicClient ??= createClient<Database>(url, anonKey, {
    auth: {
      // No session to persist: this client is never a signed-in user, and
      // storing one would leak state between requests on the server.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedPublicClient;
}

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * Only for server-side writes that have already been validated and
 * authorised by the calling route — form submissions, specifically. Never
 * import this from a client component, and never expose its results without
 * deciding who is allowed to see them, because the database will not decide
 * for you here.
 */
export function adminClient(): Db {
  if (typeof window !== "undefined") {
    throw new Error("adminClient() must never be called in the browser.");
  }

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase service role is not configured. Check canWriteToSupabase() first.",
    );
  }

  cachedAdminClient ??= createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedAdminClient;
}

/**
 * Refuses to start a production server that is silently running on fallbacks.
 *
 * The in-memory store loses every enquiry on restart. In development that is
 * fine and obvious; in production it would look like the site is working
 * while quietly dropping business. Failing loudly at startup is the only
 * version of this that cannot go unnoticed.
 */
export function assertProductionConfig(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.ALLOW_UNCONFIGURED_PRODUCTION === "true") return;

  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Supabase is not configured in production. Missing: ${missing.join(", ")}. ` +
        "Form submissions would be held in memory and lost on restart. " +
        "Set these variables, or set ALLOW_UNCONFIGURED_PRODUCTION=true to " +
        "deploy a content-only preview deliberately.",
    );
  }
}
