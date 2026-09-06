/**
 * Test stub for the `server-only` package.
 *
 * `server-only` deliberately throws when imported outside a React Server
 * Component. Vitest has no RSC boundary, so importing a server module in a
 * unit test would fail on the guard rather than the code under test. Next
 * still enforces the real guard at build time.
 */
export {};
