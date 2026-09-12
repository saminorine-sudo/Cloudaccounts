import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Access gate tests.
 *
 * `getAdminAccess` reads `process.env` and `isSupabaseConfigured` reads it at
 * module load, so each case re-imports the modules with a fresh environment
 * via `vi.resetModules()`. Without that, the first import would pin the
 * configuration for the whole file.
 */

const ORIGINAL_ENV = { ...process.env };

async function loadAccess(env: Record<string, string | undefined>) {
  vi.resetModules();

  process.env = { ...ORIGINAL_ENV, ...env } as NodeJS.ProcessEnv;
  // Deleting rather than setting undefined: `"undefined"` is a truthy string.
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
  }

  return import("./access");
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  vi.resetModules();
});

const noSupabase = {
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
};

const withSupabase = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
};

describe("admin access gate", () => {
  it("denies in production when nothing is configured", async () => {
    const { getAdminAccess } = await loadAccess({
      ...noSupabase,
      NODE_ENV: "production",
      ADMIN_DEV_PREVIEW: undefined,
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("auth-not-configured");
  });

  /**
   * The important one. The preview flag must not be enough on its own —
   * a stray environment variable in a production deployment would otherwise
   * open the admin area to the world.
   */
  it("denies in production even with the preview flag set", async () => {
    const { getAdminAccess } = await loadAccess({
      ...noSupabase,
      NODE_ENV: "production",
      ADMIN_DEV_PREVIEW: "true",
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
  });

  it("denies in development without the preview flag", async () => {
    const { getAdminAccess } = await loadAccess({
      ...noSupabase,
      NODE_ENV: "development",
      ADMIN_DEV_PREVIEW: undefined,
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("preview-disabled");
  });

  it("treats any value other than 'true' as off", async () => {
    const { getAdminAccess } = await loadAccess({
      ...noSupabase,
      NODE_ENV: "development",
      ADMIN_DEV_PREVIEW: "1",
    });

    expect((await getAdminAccess()).allowed).toBe(false);
  });

  it("allows the preview only in development with the explicit flag", async () => {
    const { getAdminAccess } = await loadAccess({
      ...noSupabase,
      NODE_ENV: "development",
      ADMIN_DEV_PREVIEW: "true",
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(true);
    if (access.allowed) {
      expect(access.mode).toBe("dev-preview");
      expect(access.actor.id).toBe("dev-preview");
    }
  });

  /**
   * Once Supabase is configured the preview is irrelevant: access requires a
   * real session, and sign-in has not been built, so it is closed.
   */
  it("requires a session once Supabase is configured, ignoring the preview flag", async () => {
    const { getAdminAccess } = await loadAccess({
      ...withSupabase,
      NODE_ENV: "development",
      ADMIN_DEV_PREVIEW: "true",
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("not-signed-in");
  });

  it("denies when Supabase is configured in production", async () => {
    const { getAdminAccess } = await loadAccess({
      ...withSupabase,
      NODE_ENV: "production",
      ADMIN_DEV_PREVIEW: undefined,
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("not-signed-in");
  });
});

describe("requireAdminAccess", () => {
  it("throws when access is refused", async () => {
    const { requireAdminAccess, AdminAccessError } = await loadAccess({
      ...noSupabase,
      NODE_ENV: "production",
      ADMIN_DEV_PREVIEW: undefined,
    });

    await expect(requireAdminAccess()).rejects.toBeInstanceOf(AdminAccessError);
  });

  it("never leaks the reason in the thrown message", async () => {
    const { requireAdminAccess } = await loadAccess({
      ...noSupabase,
      NODE_ENV: "production",
      ADMIN_DEV_PREVIEW: undefined,
    });

    await expect(requireAdminAccess()).rejects.toThrow("Not authorised");
  });

  it("returns the actor when access is granted", async () => {
    const { requireAdminAccess } = await loadAccess({
      ...noSupabase,
      NODE_ENV: "development",
      ADMIN_DEV_PREVIEW: "true",
    });

    await expect(requireAdminAccess()).resolves.toMatchObject({
      id: "dev-preview",
      role: "SUPER_ADMIN",
    });
  });
});

describe("denial messages", () => {
  it("covers every denial reason", async () => {
    const { denialMessages } = await loadAccess(noSupabase);

    for (const reason of [
      "auth-not-configured",
      "preview-disabled",
      "not-signed-in",
      "insufficient-role",
    ] as const) {
      expect(denialMessages[reason].title).toBeTruthy();
      expect(denialMessages[reason].body).toBeTruthy();
    }
  });
});
