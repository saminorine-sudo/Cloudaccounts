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

/**
 * A stand-in for the cookie-bound Supabase client.
 *
 * `sessionClient()` calls `cookies()`, which throws outside a request scope,
 * so the gate cannot be exercised without replacing it. Only the two calls
 * the gate makes are modelled: verifying the user, and reading their profile.
 */
function mockSessionClient(options: {
  user: { id: string } | null;
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
    is_active: boolean;
  } | null;
}) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: options.user },
        error: options.user ? null : { message: "no session" },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: options.profile ?? null,
            error: null,
          }),
        }),
      }),
    }),
  };
}

async function loadAccess(
  env: Record<string, string | undefined>,
  session?: Parameters<typeof mockSessionClient>[0],
) {
  vi.resetModules();

  vi.doMock("@/lib/supabase/server", () => ({
    sessionClient: async () => mockSessionClient(session ?? { user: null }),
    authenticatedUser: async () => session?.user ?? null,
  }));

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
   * real session, whatever the flag says.
   */
  it("requires a session once Supabase is configured, ignoring the preview flag", async () => {
    const { getAdminAccess } = await loadAccess(
      {
        ...withSupabase,
        NODE_ENV: "development",
        ADMIN_DEV_PREVIEW: "true",
      },
      { user: null },
    );

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("not-signed-in");
  });

  it("denies an anonymous visitor in production", async () => {
    const { getAdminAccess } = await loadAccess(
      {
        ...withSupabase,
        NODE_ENV: "production",
        ADMIN_DEV_PREVIEW: undefined,
      },
      { user: null },
    );

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("not-signed-in");
  });

  /**
   * The one that matters most. Every signup becomes a CLIENT, so a client's
   * own perfectly valid session must not open the admin area.
   */
  it("refuses a signed-in client", async () => {
    const { getAdminAccess } = await loadAccess(withSupabase, {
      user: { id: "user-1" },
      profile: {
        id: "user-1",
        full_name: "A Client",
        email: "client@example.com",
        role: "CLIENT",
        is_active: true,
      },
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("insufficient-role");
  });

  it("refuses a deactivated staff account", async () => {
    const { getAdminAccess } = await loadAccess(withSupabase, {
      user: { id: "user-2" },
      profile: {
        id: "user-2",
        full_name: "Former Staff",
        email: "former@example.com",
        role: "ADMIN",
        is_active: false,
      },
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(false);
    if (!access.allowed) expect(access.reason).toBe("insufficient-role");
  });

  /** A session without a profile is a broken state, not a free pass. */
  it("refuses a session whose profile is missing", async () => {
    const { getAdminAccess } = await loadAccess(withSupabase, {
      user: { id: "user-3" },
      profile: null,
    });

    expect((await getAdminAccess()).allowed).toBe(false);
  });

  it("admits an active staff account", async () => {
    const { getAdminAccess } = await loadAccess(withSupabase, {
      user: { id: "user-4" },
      profile: {
        id: "user-4",
        full_name: "Real Staff",
        email: "staff@example.com",
        role: "ACCOUNTANT",
        is_active: true,
      },
    });

    const access = await getAdminAccess();
    expect(access.allowed).toBe(true);
    if (access.allowed) {
      expect(access.mode).toBe("authenticated");
      expect(access.actor).toMatchObject({
        id: "user-4",
        name: "Real Staff",
        role: "ACCOUNTANT",
      });
    }
  });

  it("falls back to the email when a profile has no name", async () => {
    const { getAdminAccess } = await loadAccess(withSupabase, {
      user: { id: "user-5" },
      profile: {
        id: "user-5",
        full_name: "   ",
        email: "staff@example.com",
        role: "STAFF",
        is_active: true,
      },
    });

    const access = await getAdminAccess();
    if (access.allowed) expect(access.actor.name).toBe("staff@example.com");
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
