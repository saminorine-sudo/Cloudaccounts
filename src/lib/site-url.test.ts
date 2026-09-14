import { describe, expect, it } from "vitest";

import { resolveSiteUrl, SITE_URL_FALLBACK } from "./site-url";

/**
 * Canonical origin resolution.
 *
 * This feeds `metadataBase`, which is built with `new URL()` — so an invalid
 * value does not produce a wrong canonical tag, it fails the build outright.
 * Every case below therefore has to return something `new URL()` accepts.
 */
describe("resolveSiteUrl", () => {
  it("uses an explicit site URL", () => {
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.example.com" }),
    ).toBe("https://www.example.com");
  });

  it("strips a trailing slash", () => {
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.example.com/" }),
    ).toBe("https://www.example.com");
  });

  /**
   * The case that broke a real deployment: adding the key in a hosting
   * dashboard and saving before filling in the value. `??` keeps the empty
   * string, and `new URL("")` throws.
   */
  it("treats an empty value as absent", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" })).toBe(
      SITE_URL_FALLBACK,
    );
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "   " })).toBe(
      SITE_URL_FALLBACK,
    );
  });

  it("falls back when nothing is set", () => {
    expect(resolveSiteUrl({})).toBe(SITE_URL_FALLBACK);
  });

  it("falls back rather than passing through something unparseable", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" })).toBe(
      SITE_URL_FALLBACK,
    );
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "://broken" })).toBe(
      SITE_URL_FALLBACK,
    );
  });

  /** A `javascript:` origin in a canonical tag would be an injection route. */
  it("rejects a non-http protocol", () => {
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" }),
    ).toBe(SITE_URL_FALLBACK);
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "ftp://example.com" })).toBe(
      SITE_URL_FALLBACK,
    );
  });

  it("adds a scheme to the bare hostname Vercel supplies", () => {
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_VERCEL_URL: "cloudaccounts.vercel.app" }),
    ).toBe("https://cloudaccounts.vercel.app");
  });

  /**
   * Order matters: the per-deployment URL is right for a preview and wrong
   * for production, so the stable production domain has to win.
   */
  it("prefers the production domain over the deployment URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "cloudaccounts.com",
        NEXT_PUBLIC_VERCEL_URL: "cloudaccounts-abc123.vercel.app",
      }),
    ).toBe("https://cloudaccounts.com");
  });

  it("prefers an explicit setting over anything the platform supplies", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://www.cloudaccounts.com",
        NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "cloudaccounts.vercel.app",
      }),
    ).toBe("https://www.cloudaccounts.com");
  });

  it("skips an empty explicit value and uses the platform's", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "",
        NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "cloudaccounts.vercel.app",
      }),
    ).toBe("https://cloudaccounts.vercel.app");
  });

  it("always returns something new URL() accepts", () => {
    const inputs = ["", "   ", "not a url", "javascript:x", undefined];
    for (const value of inputs) {
      expect(() => new URL(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: value }))).not.toThrow();
    }
  });
});
