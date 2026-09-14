"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { safeRedirectTarget } from "@/lib/admin/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/clients";
import { sessionClient } from "@/lib/supabase/server";
import { checkRateLimit, clientIp } from "@/lib/server/security";

export type SignInResult = { ok: false; error: string };

/**
 * One message for every failure.
 *
 * Distinguishing "no such account" from "wrong password" turns the form into
 * an account enumerator: an attacker learns which addresses are registered by
 * reading the error. The same text covers a wrong password, an unknown
 * address, an unconfirmed account and a client without staff access.
 */
const GENERIC_FAILURE =
  "Those details were not recognised, or that account cannot use the admin area.";

const credentials = z.object({
  email: z.email().max(254),
  // No complexity rules here on purpose: the password is checked against what
  // Supabase already stored, and imposing a shape at sign-in would only lock
  // out accounts whose passwords predate the rule. Strength belongs at the
  // point a password is chosen.
  password: z.string().min(1).max(256),
});

export async function signIn(formData: FormData): Promise<SignInResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Authentication is not configured on this deployment.",
    };
  }

  // Rate limited by IP. The limiter is per-instance (see security.ts), so this
  // raises the cost of guessing rather than eliminating it; Supabase applies
  // its own limits behind this.
  const requestHeaders = await headers();
  const ip = clientIp(new Request("https://local", { headers: requestHeaders }));
  const limit = checkRateLimit(`signin:${ip}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!limit.allowed) {
    return {
      ok: false,
      error: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.`,
    };
  }

  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { ok: false, error: GENERIC_FAILURE };

  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) return { ok: false, error: GENERIC_FAILURE };

  // Authenticated is not authorised. Every signup becomes a CLIENT, so a
  // client's own valid credentials would otherwise open a session here. Read
  // the role and end the session immediately if it is not staff — leaving one
  // behind would let them straight into the portal routes later.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  const staffRoles = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "STAFF"];
  if (!profile?.is_active || !staffRoles.includes(profile.role)) {
    await supabase.auth.signOut();
    return { ok: false, error: GENERIC_FAILURE };
  }

  redirect(safeRedirectTarget(formData.get("next")));
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await sessionClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
