import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";

/**
 * Cookie-bound Supabase client for the signed-in user.
 *
 * This is the third trust level described in `clients.ts`: unlike the
 * anonymous client it carries the caller's session, and unlike the
 * service-role client it is fully subject to Row Level Security. Every read
 * through it is the database's decision, not the application's.
 *
 * Reading cookies opts the route into dynamic rendering, which is why the
 * public pages deliberately use the cookie-free client instead. Everything
 * under `/admin` is already `force-dynamic`, so nothing is lost there.
 */
export async function sessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Check isSupabaseConfigured() before calling sessionClient().",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The middleware refreshes the
          // session on every request, so a failure here is expected and
          // harmless rather than something to surface.
        }
      },
    },
  });
}

/**
 * The authenticated user, or null.
 *
 * Uses `getUser()`, NOT `getSession()`. `getSession()` decodes whatever JWT is
 * in the cookie and returns it without checking the signature — a forged or
 * expired cookie reads as a valid session. `getUser()` asks Supabase to verify
 * the token and is the only one of the two safe to make a decision on.
 */
export async function authenticatedUser() {
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
