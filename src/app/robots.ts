import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes and the future admin and client portal areas must never
        // be crawled. Disallow is a crawling instruction, not access control —
        // those areas are protected server-side regardless.
        disallow: ["/api/", "/admin", "/client-portal", "/login"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
