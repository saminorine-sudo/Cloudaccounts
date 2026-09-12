import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * ON THE SCRIPT-SRC TRADE-OFF, STATED PLAINLY
 *
 * A strict `script-src` needs a per-request nonce, and a nonce requires
 * dynamic rendering — it would turn every statically prerendered marketing
 * page into a per-request render. That is a real cost for very little gain
 * here: this application has no HTML injection surface. Content is stored as
 * typed blocks and rendered through React, which escapes everything, and the
 * only `dangerouslySetInnerHTML` in the codebase emits JSON-LD that is
 * serialised with `<` escaped.
 *
 * So `script-src` allows inline scripts, which Next.js needs for hydration,
 * and the CSP earns its place through the other directives instead:
 *
 *   frame-ancestors  blocks clickjacking
 *   form-action      stops an injected form posting enquiry data elsewhere
 *   base-uri         blocks <base> hijacking of every relative URL
 *   object-src       blocks plugin-based injection
 *   connect-src      limits where the page may send data
 *
 * The upgrade path, if a strict script-src is ever wanted: add a proxy that
 * mints a nonce and apply it to `/admin` only. Those routes are already
 * `force-dynamic`, so nothing static is lost.
 */

// When Supabase is configured the browser may eventually talk to it directly
// (auth, realtime). Allowing exactly that origin keeps connect-src closed to
// everywhere else.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

/**
 * React uses `eval` in development for debugging features — reconstructing
 * server-side error stacks in the browser, for one. Production never does, so
 * the allowance is scoped to development rather than shipped.
 */
const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  // See the note above. Inline is required by Next.js; the risk it would
  // normally cover is closed off at the rendering layer instead.
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  // Tailwind and Next emit inline styles.
  "style-src 'self' 'unsafe-inline'",
  // Fonts are self-hosted by next/font, so no CDN needs allowing.
  "font-src 'self'",
  "img-src 'self' data: blob:",
  [
    "connect-src 'self'",
    supabaseOrigin,
    // Supabase realtime uses websockets on the same host.
    supabaseOrigin?.replace(/^https:/, "wss:"),
  ]
    .filter(Boolean)
    .join(" "),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Legacy equivalent of frame-ancestors, for browsers that predate it.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    // Nothing here needs any of these, so none are granted.
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
  {
    // No `preload`: that is a one-way commitment made on the HSTS preload
    // list, and it is the site owner's decision rather than a default.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Advertising the framework and version only helps someone matching known
  // vulnerabilities against it.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Enquiry data must never sit in a shared cache, and the admin is
        // already `force-dynamic` — this closes the CDN side too.
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
