import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/clients";
import type { UserRole } from "@/lib/supabase/database.types";
import { sessionClient } from "@/lib/supabase/server";

/**
 * ADMIN ACCESS GATE — fail closed.
 *
 * There is no state in which a deployed site serves an unauthenticated admin
 * area.
 *
 *   Supabase configured      → requires a signed-in account whose profile
 *                              carries a staff role and is active.
 *   Not configured, prod     → denied.
 *   Not configured, dev      → denied UNLESS ADMIN_DEV_PREVIEW=true, which
 *                              exists purely so the screens can be built and
 *                              tested against the in-memory store.
 *
 * The preview needs two independent conditions — a non-production build AND
 * an explicit opt-in — so that neither a stray NODE_ENV nor a leftover env
 * var alone can open it.
 *
 * IMPORTANT: every server action must call `requireAdminAccess` itself.
 * Server actions are reachable by direct POST, not only through the UI, so a
 * check in the layout protects the page but not the mutation behind it.
 */

export type StaffRole = Extract<
  UserRole,
  "SUPER_ADMIN" | "ADMIN" | "ACCOUNTANT" | "STAFF"
>;

export type AdminActor = {
  id: string;
  name: string;
  role: StaffRole;
};

export type AdminDenialReason =
  | "auth-not-configured"
  | "preview-disabled"
  | "not-signed-in"
  | "insufficient-role";

export type AdminAccess =
  | { allowed: true; mode: "authenticated"; actor: AdminActor }
  | { allowed: true; mode: "dev-preview"; actor: AdminActor }
  | { allowed: false; reason: AdminDenialReason };

/** The stand-in actor for the development preview. Never a real person. */
const PREVIEW_ACTOR: AdminActor = {
  id: "dev-preview",
  name: "Development preview",
  role: "SUPER_ADMIN",
};

function devPreviewEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_DEV_PREVIEW === "true"
  );
}

const STAFF_ROLES: readonly UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "ACCOUNTANT",
  "STAFF",
];

const isStaffRole = (role: UserRole): role is StaffRole =>
  STAFF_ROLES.includes(role);

/**
 * Resolves the signed-in staff member.
 *
 * Three outcomes, kept distinct because they mean different things to the
 * person looking at the screen: no session at all, a session belonging to
 * someone without staff access, or a staff member.
 *
 * The role is read from the database on every request rather than from
 * anything in the token. A JWT is issued once and stays valid until it
 * expires, so a role baked into it would keep working after the role was
 * revoked. The profile read goes through the session client, so RLS decides
 * what is visible — and an inactive account resolves to no role at all,
 * because `current_user_role()` filters on `is_active`.
 */
async function currentStaffUser(): Promise<
  | { status: "anonymous" }
  | { status: "not-staff" }
  | { status: "staff"; actor: AdminActor }
> {
  const supabase = await sessionClient();

  // getUser(), never getSession(): only this one verifies the token.
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return { status: "anonymous" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .eq("id", auth.user.id)
    .maybeSingle();

  // A missing profile is not a reason to let someone in. The signup trigger
  // creates one for every user, so its absence means something is wrong.
  if (profileError || !profile) return { status: "not-staff" };
  if (!profile.is_active) return { status: "not-staff" };
  if (!isStaffRole(profile.role)) return { status: "not-staff" };

  return {
    status: "staff",
    actor: {
      id: profile.id,
      name: profile.full_name?.trim() || profile.email || "Staff member",
      role: profile.role,
    },
  };
}

export async function getAdminAccess(): Promise<AdminAccess> {
  if (isSupabaseConfigured()) {
    const result = await currentStaffUser();
    if (result.status === "anonymous") {
      return { allowed: false, reason: "not-signed-in" };
    }
    if (result.status === "not-staff") {
      return { allowed: false, reason: "insufficient-role" };
    }
    return { allowed: true, mode: "authenticated", actor: result.actor };
  }

  if (devPreviewEnabled()) {
    return { allowed: true, mode: "dev-preview", actor: PREVIEW_ACTOR };
  }

  return {
    allowed: false,
    reason:
      process.env.NODE_ENV === "production"
        ? "auth-not-configured"
        : "preview-disabled",
  };
}

/** Thrown by `requireAdminAccess`. Never carries detail to the client. */
export class AdminAccessError extends Error {
  readonly reason: AdminDenialReason;

  constructor(reason: AdminDenialReason) {
    super("Not authorised");
    this.name = "AdminAccessError";
    this.reason = reason;
  }
}

/**
 * Authorises a mutation. Call this first in every server action — the page
 * that rendered the form is not evidence that this request came from it.
 */
export async function requireAdminAccess(): Promise<AdminActor> {
  const access = await getAdminAccess();
  if (!access.allowed) throw new AdminAccessError(access.reason);
  return access.actor;
}

export const denialMessages: Record<
  AdminDenialReason,
  { title: string; body: string }
> = {
  "auth-not-configured": {
    title: "Administration is unavailable",
    body: "This deployment has no authentication configured, so the admin area cannot be opened. Connect Supabase and sign in.",
  },
  "not-signed-in": {
    title: "Sign-in required",
    body: "The admin area needs a signed-in staff account.",
  },
  "insufficient-role": {
    title: "You don't have access",
    body: "Your account does not have permission to use the admin area. Ask an administrator if you think this is wrong.",
  },
  "preview-disabled": {
    title: "Admin preview is off",
    body: "Set ADMIN_DEV_PREVIEW=true in .env.local to open the admin area against the local in-memory store while sign-in is being built.",
  },
};
