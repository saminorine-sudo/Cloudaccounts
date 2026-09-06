import type { MetadataRoute } from "next";

import {
  getAudiences,
  getBlogPosts,
  getGuides,
  getServices,
} from "@/lib/content";
import { staticSitemapPaths } from "@/lib/navigation";
import { absoluteUrl } from "@/lib/seo";

/**
 * Sitemap built from the same content repository the pages read from, so a
 * new service, audience, article or guide appears automatically rather than
 * needing a second edit here.
 *
 * Filtered listing views (e.g. /resources/blog?category=tax) are excluded —
 * they are near-duplicates of the index and are marked noindex.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, audiences, posts, guides] = await Promise.all([
    getServices(),
    getAudiences(),
    getBlogPosts(),
    getGuides(),
  ]);

  const now = new Date();

  return [
    ...staticSitemapPaths.map((entry) => ({
      url: absoluteUrl(entry.path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: entry.priority,
    })),

    ...services.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    ...audiences.map((audience) => ({
      url: absoluteUrl(`/who-we-help/${audience.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    ...posts.map((post) => ({
      url: absoluteUrl(`/resources/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),

    ...guides.map((guide) => ({
      url: absoluteUrl(`/resources/guides/${guide.slug}`),
      lastModified: new Date(guide.updatedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
