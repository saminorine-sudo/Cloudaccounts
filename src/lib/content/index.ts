import "server-only";

import { audiences } from "@/content/audiences";
import { blogCategories, blogPosts } from "@/content/blog";
import { caseStudies } from "@/content/case-studies";
import { faqs } from "@/content/faqs";
import { consultationTypes, guides } from "@/content/guides";
import { pricingPlans } from "@/content/pricing";
import { services } from "@/content/services";
import { siteSettings } from "@/content/site";
import { siteStats } from "@/content/stats";
import { teamMembers } from "@/content/team";
import { testimonials } from "@/content/testimonials";
import type {
  Audience,
  BlogCategory,
  BlogPost,
  CaseStudy,
  ConsultationType,
  Faq,
  FaqCategory,
  Guide,
  PricingPlan,
  Service,
  SiteSettings,
  SiteStat,
  TeamMember,
  Testimonial,
} from "@/types/content";

/**
 * CONTENT REPOSITORY — the single seam between the site and its data source.
 *
 * Today every function reads from typed modules in `src/content`. When
 * Supabase is connected, only the bodies below change: each becomes a query
 * against the corresponding table, filtered and ordered the same way. No page
 * or component imports `src/content` directly, so nothing else has to move.
 *
 * Everything is async now precisely so that swap does not ripple outwards.
 *
 * Reference implementation for the Supabase version:
 *
 *   export async function getServices(): Promise<Service[]> {
 *     const supabase = await createServerClient();
 *     const { data, error } = await supabase
 *       .from("services")
 *       .select("*")
 *       .eq("is_active", true)
 *       .order("display_order");
 *     if (error) throw error;
 *     return data.map(toService);
 *   }
 */

const byOrder = <T extends { displayOrder: number }>(a: T, b: T) =>
  a.displayOrder - b.displayOrder;

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettings;
}

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

export async function getServices(): Promise<Service[]> {
  return services.filter((s) => s.isActive).sort(byOrder);
}

export async function getServiceBySlug(
  slug: string,
): Promise<Service | undefined> {
  return services.find((s) => s.slug === slug && s.isActive);
}

/* -------------------------------------------------------------------------- */
/* Audiences                                                                  */
/* -------------------------------------------------------------------------- */

export async function getAudiences(): Promise<Audience[]> {
  return audiences.filter((a) => a.isActive).sort(byOrder);
}

export async function getAudienceBySlug(
  slug: string,
): Promise<Audience | undefined> {
  return audiences.find((a) => a.slug === slug && a.isActive);
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                    */
/* -------------------------------------------------------------------------- */

export async function getPricingPlans(): Promise<PricingPlan[]> {
  return pricingPlans.filter((p) => p.isActive).sort(byOrder);
}

export async function getPricingPlanBySlug(
  slug: string,
): Promise<PricingPlan | undefined> {
  return pricingPlans.find((p) => p.slug === slug && p.isActive);
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export async function getSiteStats(): Promise<SiteStat[]> {
  return [...siteStats].sort(byOrder);
}

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

export async function getTestimonials(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Testimonial[]> {
  let result = [...testimonials].sort(byOrder);
  if (options?.featuredOnly) result = result.filter((t) => t.isFeatured);
  if (options?.limit) result = result.slice(0, options.limit);
  return result;
}

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

export async function getTeamMembers(): Promise<TeamMember[]> {
  return teamMembers.filter((m) => m.isActive).sort(byOrder);
}

export async function getTeamMemberById(
  id: string,
): Promise<TeamMember | undefined> {
  return teamMembers.find((m) => m.id === id);
}

/* -------------------------------------------------------------------------- */
/* Case studies                                                               */
/* -------------------------------------------------------------------------- */

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return caseStudies.filter((c) => c.isPublished).sort(byOrder);
}

/* -------------------------------------------------------------------------- */
/* FAQs                                                                       */
/* -------------------------------------------------------------------------- */

export async function getFaqs(options?: {
  category?: FaqCategory;
  ids?: string[];
  limit?: number;
}): Promise<Faq[]> {
  let result = faqs.filter((f) => f.isPublished);
  if (options?.category)
    result = result.filter((f) => f.category === options.category);
  if (options?.ids) {
    const wanted = new Set(options.ids);
    result = result.filter((f) => wanted.has(f.id));
  }
  result = result.sort(byOrder);
  if (options?.limit) result = result.slice(0, options.limit);
  return result;
}

/* -------------------------------------------------------------------------- */
/* Blog                                                                       */
/* -------------------------------------------------------------------------- */

/** Published-and-not-future — mirrors the query the database layer will run. */
function isLive(post: BlogPost, now: Date): boolean {
  if (post.status !== "published") return false;
  return new Date(post.publishedAt).getTime() <= now.getTime();
}

export async function getBlogPosts(options?: {
  categorySlug?: string;
  limit?: number;
  excludeSlug?: string;
}): Promise<BlogPost[]> {
  const now = new Date();
  let result = blogPosts
    .filter((p) => isLive(p, now))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  if (options?.categorySlug)
    result = result.filter((p) => p.categorySlug === options.categorySlug);
  if (options?.excludeSlug)
    result = result.filter((p) => p.slug !== options.excludeSlug);
  if (options?.limit) result = result.slice(0, options.limit);

  return result;
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const now = new Date();
  return blogPosts.find((p) => p.slug === slug && isLive(p, now));
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return blogCategories;
}

/** Only categories that currently have at least one live post. */
export async function getUsedBlogCategories(): Promise<BlogCategory[]> {
  const posts = await getBlogPosts();
  const used = new Set(posts.map((p) => p.categorySlug));
  return blogCategories.filter((c) => used.has(c.slug));
}

export async function getBlogCategoryBySlug(
  slug: string,
): Promise<BlogCategory | undefined> {
  return blogCategories.find((c) => c.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Guides                                                                     */
/* -------------------------------------------------------------------------- */

export async function getGuides(): Promise<Guide[]> {
  return guides;
}

export async function getGuideBySlug(slug: string): Promise<Guide | undefined> {
  return guides.find((g) => g.slug === slug);
}

/* -------------------------------------------------------------------------- */
/* Consultation types                                                         */
/* -------------------------------------------------------------------------- */

export async function getConsultationTypes(): Promise<ConsultationType[]> {
  return consultationTypes.filter((c) => c.isActive).sort(byOrder);
}

export async function getConsultationTypeBySlug(
  slug: string,
): Promise<ConsultationType | undefined> {
  return consultationTypes.find((c) => c.slug === slug && c.isActive);
}
