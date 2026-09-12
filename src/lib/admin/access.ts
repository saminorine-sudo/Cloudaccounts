import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/clients";
import type { UserRole } from "@/lib/supabase/database.types";

/**
 * ADMIN ACCESS GATE — fail closed.
 *
 * Sign-in is not built yet, so this deliberately denies access in every
 * deployable configuration. There is no state in which a deployed site serves
 * an unauthenticated admin area.
 *
 *   Supabase configured      → requires a signed-in staff session. None can
 *                              exist yet, so access is denied.
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

/**
 * Resolves the signed-in staff member.
 *
 * Returns null unconditionally: authentication has not been implemented, so
 * there is no session to read. When Supabase Auth is wired up this reads the
 * cookie-bound server client, loads the caller's profile, and returns it only
 * when `is_staff()` holds. Until then, "no session" is the honest answer and
 * the gate denies on it.
 */
async function currentStaffUser(): Promise<AdminActor | null> {
  return null;
}

export async function getAdminAccess(): Promise<AdminAccess> {
  if (isSupabaseConfigured()) {
    const actor = await currentStaffUser();
    if (!actor) return { allowed: false, reason: "not-signed-in" };
    return { allowed: true, mode: "authenticated", actor };
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
    body: "The admin area needs a signed-in staff account. Sign-in has not been built yet, so this area is closed.",
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
