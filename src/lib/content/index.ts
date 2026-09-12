import "server-only";

import { audiences as localAudiences } from "@/content/audiences";
import {
  blogCategories as localBlogCategories,
  blogPosts as localBlogPosts,
} from "@/content/blog";
import { caseStudies as localCaseStudies } from "@/content/case-studies";
import { faqs as localFaqs } from "@/content/faqs";
import {
  consultationTypes as localConsultationTypes,
  guides as localGuides,
} from "@/content/guides";
import { pricingPlans as localPricingPlans } from "@/content/pricing";
import { services as localServices } from "@/content/services";
import { siteSettings as localSiteSettings } from "@/content/site";
import { siteStats as localSiteStats } from "@/content/stats";
import { teamMembers as localTeamMembers } from "@/content/team";
import { testimonials as localTestimonials } from "@/content/testimonials";
import { isSupabaseConfigured, publicClient, type Db } from "@/lib/supabase/clients";
import {
  toAudience,
  toBlogCategory,
  toBlogPost,
  toCaseStudy,
  toConsultationType,
  toFaq,
  toGuide,
  toPricingPlan,
  toService,
  toSiteSettings,
  toSiteStat,
  toTeamMember,
  toTestimonial,
} from "@/lib/supabase/mappers";
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
 * CONTENT REPOSITORY
 *
 * The single seam between the site and its content. Every page reads through
 * these functions; none imports `src/content` directly.
 *
 * Two modes:
 *
 *   Supabase configured   → reads the database through the anonymous client,
 *                           subject to the RLS read policies.
 *   Not configured        → falls back to the typed modules in `src/content`,
 *                           so the site runs fully with no database.
 *
 * The fallback covers "no project yet", NOT "the database is having a bad
 * day". Once configured, a failed query throws rather than quietly serving
 * local demo content — showing placeholder prices during an outage would be
 * far worse than showing an error.
 *
 * Reads are anonymous and cookie-free on purpose, which is what lets the
 * marketing pages stay statically prerendered. Freshness comes from the
 * `revalidate` setting on each page rather than from per-request queries.
 */

const useDatabase = isSupabaseConfigured();

/** Reports which source is live — surfaced in the setup docs and admin later. */
export function contentSource(): "supabase" | "local" {
  return useDatabase ? "supabase" : "local";
}

function fail(table: string, error: { message: string }): never {
  // The message can name columns; it never contains user data.
  throw new Error(`Supabase read failed for "${table}": ${error.message}`);
}

const byOrder = <T extends { displayOrder: number }>(a: T, b: T) =>
  a.displayOrder - b.displayOrder;

/**
 * Small lookup tables are fetched whole and indexed in memory rather than
 * joined per row. At this size that is one query instead of N, and it keeps
 * the typed client away from nested-select generics.
 */
async function keyById(
  db: Db,
  table: "faqs" | "services" | "blog_categories" | "team_members" | "pricing_plans",
  field: "key" | "slug" = "key",
): Promise<Map<string, string>> {
  const { data, error } = await db.from(table).select(`id, ${field}`);
  if (error) fail(table, error);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as unknown as Record<string, string>[]) {
    map.set(row.id, row[field]);
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!useDatabase) return localSiteSettings;

  const { data, error } = await publicClient()
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) fail("site_settings", error);
  // A project whose settings row has not been seeded still needs a site.
  if (!data) return localSiteSettings;
  return toSiteSettings(data);
}

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

export async function getServices(): Promise<Service[]> {
  if (!useDatabase)
    return localServices.filter((s) => s.isActive).sort(byOrder);

  const { data, error } = await publicClient()
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) fail("services", error);
  return (data ?? []).map((row) => toService(row));
}

export async function getServiceBySlug(
  slug: string,
): Promise<Service | undefined> {
  if (!useDatabase)
    return localServices.find((s) => s.slug === slug && s.isActive);

  const db = publicClient();
  const { data, error } = await db
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) fail("services", error);
  if (!data) return undefined;

  const { data: links, error: linkError } = await db
    .from("service_faqs")
    .select("faq_id, display_order")
    .eq("service_id", data.id)
    .order("display_order");

  if (linkError) fail("service_faqs", linkError);

  const faqKeys = await keyById(db, "faqs");
  const orderedKeys = (links ?? [])
    .map((link) => faqKeys.get(link.faq_id))
    .filter((key): key is string => Boolean(key));

  return toService(data, orderedKeys);
}

/* -------------------------------------------------------------------------- */
/* Audiences                                                                  */
/* -------------------------------------------------------------------------- */

export async function getAudiences(): Promise<Audience[]> {
  if (!useDatabase)
    return localAudiences.filter((a) => a.isActive).sort(byOrder);

  const { data, error } = await publicClient()
    .from("audiences")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) fail("audiences", error);
  return (data ?? []).map((row) => toAudience(row));
}

export async function getAudienceBySlug(
  slug: string,
): Promise<Audience | undefined> {
  if (!useDatabase)
    return localAudiences.find((a) => a.slug === slug && a.isActive);

  const db = publicClient();
  const { data, error } = await db
    .from("audiences")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) fail("audiences", error);
  if (!data) return undefined;

  const { data: links, error: linkError } = await db
    .from("audience_services")
    .select("service_id, display_order")
    .eq("audience_id", data.id)
    .order("display_order");

  if (linkError) fail("audience_services", linkError);

  const serviceSlugs = await keyById(db, "services", "slug");
  const planSlugs = await keyById(db, "pricing_plans", "slug");

  return toAudience(
    data,
    (links ?? [])
      .map((link) => serviceSlugs.get(link.service_id))
      .filter((slug): slug is string => Boolean(slug)),
    data.recommended_plan_id
      ? (planSlugs.get(data.recommended_plan_id) ?? "")
      : "",
  );
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                    */
/* -------------------------------------------------------------------------- */

export async function getPricingPlans(): Promise<PricingPlan[]> {
  if (!useDatabase)
    return localPricingPlans.filter((p) => p.isActive).sort(byOrder);

  const { data, error } = await publicClient()
    .from("pricing_plans")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) fail("pricing_plans", error);
  return (data ?? []).map(toPricingPlan);
}

export async function getPricingPlanBySlug(
  slug: string,
): Promise<PricingPlan | undefined> {
  if (!useDatabase)
    return localPricingPlans.find((p) => p.slug === slug && p.isActive);

  const { data, error } = await publicClient()
    .from("pricing_plans")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) fail("pricing_plans", error);
  return data ? toPricingPlan(data) : undefined;
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export async function getSiteStats(): Promise<SiteStat[]> {
  if (!useDatabase) return [...localSiteStats].sort(byOrder);

  const { data, error } = await publicClient()
    .from("site_stats")
    .select("*")
    .order("display_order");

  if (error) fail("site_stats", error);
  return (data ?? []).map(toSiteStat);
}

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

export async function getTestimonials(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Testimonial[]> {
  if (!useDatabase) {
    let result = [...localTestimonials].sort(byOrder);
    if (options?.featuredOnly) result = result.filter((t) => t.isFeatured);
    if (options?.limit) result = result.slice(0, options.limit);
    return result;
  }

  let query = publicClient()
    .from("testimonials")
    .select("*")
    .order("display_order");

  if (options?.featuredOnly) query = query.eq("is_featured", true);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) fail("testimonials", error);
  return (data ?? []).map(toTestimonial);
}

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

export async function getTeamMembers(): Promise<TeamMember[]> {
  if (!useDatabase)
    return localTeamMembers.filter((m) => m.isActive).sort(byOrder);

  const { data, error } = await publicClient()
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) fail("team_members", error);
  return (data ?? []).map(toTeamMember);
}

export async function getTeamMemberById(
  id: string,
): Promise<TeamMember | undefined> {
  if (!useDatabase) return localTeamMembers.find((m) => m.id === id);

  const { data, error } = await publicClient()
    .from("team_members")
    .select("*")
    .eq("key", id)
    .maybeSingle();

  if (error) fail("team_members", error);
  return data ? toTeamMember(data) : undefined;
}

/* -------------------------------------------------------------------------- */
/* Case studies                                                               */
/* -------------------------------------------------------------------------- */

export async function getCaseStudies(): Promise<CaseStudy[]> {
  if (!useDatabase)
    return localCaseStudies.filter((c) => c.isPublished).sort(byOrder);

  const { data, error } = await publicClient()
    .from("case_studies")
    .select("*")
    .eq("is_published", true)
    .order("display_order");

  if (error) fail("case_studies", error);
  return (data ?? []).map(toCaseStudy);
}

/* -------------------------------------------------------------------------- */
/* FAQs                                                                       */
/* -------------------------------------------------------------------------- */

export async function getFaqs(options?: {
  category?: FaqCategory;
  ids?: string[];
  limit?: number;
}): Promise<Faq[]> {
  if (!useDatabase) {
    let result = localFaqs.filter((f) => f.isPublished);
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

  // An explicit empty id list means "no FAQs", not "all of them".
  if (options?.ids && options.ids.length === 0) return [];

  let query = publicClient()
    .from("faqs")
    .select("*")
    .eq("is_published", true)
    .order("display_order");

  if (options?.category) query = query.eq("category", options.category);
  if (options?.ids) query = query.in("key", options.ids);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) fail("faqs", error);
  return (data ?? []).map(toFaq);
}

/* -------------------------------------------------------------------------- */
/* Blog                                                                       */
/* -------------------------------------------------------------------------- */

function isLive(post: BlogPost, now: Date): boolean {
  if (post.status !== "published") return false;
  return new Date(post.publishedAt).getTime() <= now.getTime();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getBlogPosts(options?: {
  categorySlug?: string;
  limit?: number;
  excludeSlug?: string;
}): Promise<BlogPost[]> {
  if (!useDatabase) {
    const now = new Date();
    let result = localBlogPosts
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

  const db = publicClient();
  const [categorySlugs, authorKeys] = await Promise.all([
    keyById(db, "blog_categories", "slug"),
    keyById(db, "team_members"),
  ]);

  let query = db
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", today())
    .order("published_at", { ascending: false });

  if (options?.categorySlug) {
    const categoryId = [...categorySlugs.entries()].find(
      ([, slug]) => slug === options.categorySlug,
    )?.[0];
    if (!categoryId) return [];
    query = query.eq("category_id", categoryId);
  }

  if (options?.excludeSlug) query = query.neq("slug", options.excludeSlug);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) fail("blog_posts", error);

  return (data ?? []).map((row) =>
    toBlogPost(
      row,
      row.category_id ? (categorySlugs.get(row.category_id) ?? "") : "",
      row.author_id ? (authorKeys.get(row.author_id) ?? "") : "",
    ),
  );
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  if (!useDatabase) {
    const now = new Date();
    return localBlogPosts.find((p) => p.slug === slug && isLive(p, now));
  }

  const db = publicClient();
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", today())
    .maybeSingle();

  if (error) fail("blog_posts", error);
  if (!data) return undefined;

  const [categorySlugs, authorKeys] = await Promise.all([
    keyById(db, "blog_categories", "slug"),
    keyById(db, "team_members"),
  ]);

  return toBlogPost(
    data,
    data.category_id ? (categorySlugs.get(data.category_id) ?? "") : "",
    data.author_id ? (authorKeys.get(data.author_id) ?? "") : "",
  );
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  if (!useDatabase) return localBlogCategories;

  const { data, error } = await publicClient()
    .from("blog_categories")
    .select("*")
    .order("display_order");

  if (error) fail("blog_categories", error);
  return (data ?? []).map(toBlogCategory);
}

/** Only categories that currently have at least one live post. */
export async function getUsedBlogCategories(): Promise<BlogCategory[]> {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getBlogCategories(),
  ]);
  const used = new Set(posts.map((p) => p.categorySlug));
  return categories.filter((c) => used.has(c.slug));
}

export async function getBlogCategoryBySlug(
  slug: string,
): Promise<BlogCategory | undefined> {
  if (!useDatabase) return localBlogCategories.find((c) => c.slug === slug);

  const { data, error } = await publicClient()
    .from("blog_categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) fail("blog_categories", error);
  return data ? toBlogCategory(data) : undefined;
}

/* -------------------------------------------------------------------------- */
/* Guides                                                                     */
/* -------------------------------------------------------------------------- */

export async function getGuides(): Promise<Guide[]> {
  if (!useDatabase) return localGuides;

  const { data, error } = await publicClient()
    .from("guides")
    .select("*")
    .order("display_order");

  if (error) fail("guides", error);
  return (data ?? []).map(toGuide);
}

export async function getGuideBySlug(slug: string): Promise<Guide | undefined> {
  if (!useDatabase) return localGuides.find((g) => g.slug === slug);

  const { data, error } = await publicClient()
    .from("guides")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) fail("guides", error);
  return data ? toGuide(data) : undefined;
}

/* -------------------------------------------------------------------------- */
/* Consultation types                                                         */
/* -------------------------------------------------------------------------- */

export async function getConsultationTypes(): Promise<ConsultationType[]> {
  if (!useDatabase)
    return localConsultationTypes.filter((c) => c.isActive).sort(byOrder);

  const { data, error } = await publicClient()
    .from("consultation_types")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) fail("consultation_types", error);
  return (data ?? []).map(toConsultationType);
}

export async function getConsultationTypeBySlug(
  slug: string,
): Promise<ConsultationType | undefined> {
  if (!useDatabase)
    return localConsultationTypes.find((c) => c.slug === slug && c.isActive);

  const { data, error } = await publicClient()
    .from("consultation_types")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) fail("consultation_types", error);
  return data ? toConsultationType(data) : undefined;
}
