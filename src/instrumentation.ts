/**
 * Server startup checks.
 *
 * `register` runs once per server instance, before any request is handled.
 */
export async function register(): Promise<void> {
  // Only the Node.js runtime has the server-side environment; the edge
  // runtime copy of this module would be checking variables it cannot use.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // `next build` also runs this hook. Failing there would stop anyone
  // building the site without a database, which is a supported development
  // state — the check belongs to running a server, not compiling one.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { assertProductionConfig, isSupabaseConfigured } = await import(
    "@/lib/supabase/clients"
  );

  // Throws in production when Supabase is missing, so a deployment cannot
  // quietly run on the in-memory store and drop enquiries on restart.
  assertProductionConfig();

  if (!isSupabaseConfigured()) {
    console.warn(
      "[cloudaccounts] Running without Supabase. Content is served from " +
        "src/content and form submissions are held in memory only — they " +
        "will be lost when the server restarts. See docs/SUPABASE-SETUP.md.",
    );
  }
}
