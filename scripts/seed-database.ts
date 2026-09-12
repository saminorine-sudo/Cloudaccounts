/**
 * Seeds a Supabase project from the typed content modules in `src/content`.
 *
 *   npm run db:seed
 *
 * Idempotent: every table is upserted on its `key` column, so running it
 * again updates rows rather than duplicating them. Safe to re-run after
 * editing the content modules.
 *
 * The content modules stay the single source of truth. Writing the seed as a
 * script rather than a hand-maintained seed.sql means there is no second copy
 * of the content to drift, and no SQL string escaping to get wrong.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY: seeding writes to tables whose RLS
 * policies only admins can write to, and there is no admin user yet.
 */

import { createClient } from "@supabase/supabase-js";

import { audiences } from "../src/content/audiences";
import { blogCategories, blogPosts } from "../src/content/blog";
import { caseStudies } from "../src/content/case-studies";
import { faqs } from "../src/content/faqs";
import { consultationTypes, guides } from "../src/content/guides";
import { pricingPlans } from "../src/content/pricing";
import { services } from "../src/content/services";
import { siteSettings } from "../src/content/site";
import { siteStats } from "../src/content/stats";
import { teamMembers } from "../src/content/team";
import { testimonials } from "../src/content/testimonials";
import type { Database } from "../src/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example to .env.local and fill in your project's values.",
  );
  process.exit(1);
}

const db = createClient<Database>(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Maps a content `key` to the uuid the database assigned it. */
type KeyMap = Map<string, string>;

function step(label: string): void {
  process.stdout.write(`  ${label.padEnd(24)}`);
}

function done(count: number): void {
  process.stdout.write(`${count}\n`);
}

function abort(label: string, error: { message: string }): never {
  process.stdout.write("failed\n");
  console.error(`\n${label}: ${error.message}\n`);
  process.exit(1);
}

/** Upserts rows on `key` and returns a key → id map for cross-references. */
async function upsert(
  table:
    | "site_stats"
    | "faqs"
    | "services"
    | "pricing_plans"
    | "audiences"
    | "testimonials"
    | "team_members"
    | "case_studies"
    | "blog_categories"
    | "blog_posts"
    | "guides"
    | "consultation_types",
  rows: Record<string, unknown>[],
): Promise<KeyMap> {
  step(table);

  const { data, error } = await db
    .from(table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generated row types are stricter than the seed literals
    .upsert(rows as any, { onConflict: "key" })
    .select("id, key");

  if (error) abort(table, error);

  done(rows.length);
  return new Map(
    ((data ?? []) as { id: string; key: string }[]).map((row) => [
      row.key,
      row.id,
    ]),
  );
}

async function main(): Promise<void> {
  console.log(`\nSeeding ${url}\n`);

  /* Site settings — single row, fixed primary key. */
  step("site_settings");
  {
    const { error } = await db.from("site_settings").upsert(
      {
        id: true,
        name: siteSettings.name,
        legal_name: siteSettings.legalName,
        tagline: siteSettings.tagline,
        description: siteSettings.description,
        url: siteSettings.url,
        locale: siteSettings.locale,
        contact: siteSettings.contact,
        socials: siteSettings.socials,
        seo: siteSettings.seo,
        show_demo_notices: siteSettings.showDemoNotices,
      },
      { onConflict: "id" },
    );
    if (error) abort("site_settings", error);
    done(1);
  }

  await upsert(
    "site_stats",
    siteStats.map((stat) => ({
      key: stat.id,
      value: stat.value,
      label: stat.label,
      note: stat.note,
      display_order: stat.displayOrder,
      is_demo: stat.isDemo,
    })),
  );

  const faqIds = await upsert(
    "faqs",
    faqs.map((faq) => ({
      key: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      display_order: faq.displayOrder,
      is_published: faq.isPublished,
      is_demo: faq.isDemo,
    })),
  );

  const serviceIds = await upsert(
    "services",
    services.map((service) => ({
      key: service.id,
      slug: service.slug,
      title: service.title,
      summary: service.summary,
      icon: service.icon,
      intro: service.intro,
      includes: service.includes,
      outcomes: service.outcomes,
      seo: service.seo,
      display_order: service.displayOrder,
      is_active: service.isActive,
      is_demo: service.isDemo,
    })),
  );

  const planIds = await upsert(
    "pricing_plans",
    pricingPlans.map((plan) => ({
      key: plan.id,
      slug: plan.slug,
      name: plan.name,
      audience: plan.audience,
      price_monthly: plan.priceMonthly,
      currency: plan.currency,
      price_prefix: plan.pricePrefix,
      price_suffix: plan.priceSuffix,
      description: plan.description,
      features: plan.features,
      cta_label: plan.ctaLabel,
      cta_href: plan.ctaHref,
      is_recommended: plan.isRecommended,
      display_order: plan.displayOrder,
      is_active: plan.isActive,
      is_demo: plan.isDemo,
    })),
  );

  const audienceIds = await upsert(
    "audiences",
    audiences.map((audience) => ({
      key: audience.id,
      slug: audience.slug,
      title: audience.title,
      summary: audience.summary,
      icon: audience.icon,
      intro: audience.intro,
      challenges: audience.challenges,
      support: audience.support,
      recommended_plan_id:
        planIds.get(
          pricingPlans.find((p) => p.slug === audience.recommendedPlanSlug)
            ?.id ?? "",
        ) ?? null,
      seo: audience.seo,
      display_order: audience.displayOrder,
      is_active: audience.isActive,
      is_demo: audience.isDemo,
    })),
  );

  /* Join tables — replaced wholesale so removed links do not linger. */
  step("service_faqs");
  {
    const rows = services.flatMap((service) =>
      service.faqIds
        .map((faqKey, index) => ({
          service_id: serviceIds.get(service.id),
          faq_id: faqIds.get(faqKey),
          display_order: index,
        }))
        .filter((row) => row.service_id && row.faq_id),
    );

    const { error: clearError } = await db
      .from("service_faqs")
      .delete()
      .not("service_id", "is", null);
    if (clearError) abort("service_faqs (clear)", clearError);

    const { error } = await db
      .from("service_faqs")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ids are resolved above and filtered for null
      .insert(rows as any);
    if (error) abort("service_faqs", error);
    done(rows.length);
  }

  step("audience_services");
  {
    const rows = audiences.flatMap((audience) =>
      audience.recommendedServiceSlugs
        .map((slug, index) => ({
          audience_id: audienceIds.get(audience.id),
          service_id: serviceIds.get(
            services.find((s) => s.slug === slug)?.id ?? "",
          ),
          display_order: index,
        }))
        .filter((row) => row.audience_id && row.service_id),
    );

    const { error: clearError } = await db
      .from("audience_services")
      .delete()
      .not("audience_id", "is", null);
    if (clearError) abort("audience_services (clear)", clearError);

    const { error } = await db
      .from("audience_services")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ids are resolved above and filtered for null
      .insert(rows as any);
    if (error) abort("audience_services", error);
    done(rows.length);
  }

  await upsert(
    "testimonials",
    testimonials.map((testimonial) => ({
      key: testimonial.id,
      quote: testimonial.quote,
      name: testimonial.name,
      role: testimonial.role,
      company: testimonial.company,
      rating: testimonial.rating,
      photo_url: testimonial.photoUrl,
      is_featured: testimonial.isFeatured,
      display_order: testimonial.displayOrder,
      is_demo: testimonial.isDemo,
    })),
  );

  const teamIds = await upsert(
    "team_members",
    teamMembers.map((member) => ({
      key: member.id,
      slug: member.slug,
      name: member.name,
      role: member.role,
      bio: member.bio,
      qualifications: member.qualifications,
      memberships: member.memberships,
      focus: member.focus,
      email: member.email,
      linkedin_url: member.linkedinUrl,
      photo_url: member.photoUrl,
      display_order: member.displayOrder,
      is_active: member.isActive,
      is_demo: member.isDemo,
    })),
  );

  await upsert(
    "case_studies",
    caseStudies.map((study) => ({
      key: study.id,
      slug: study.slug,
      title: study.title,
      sector: study.sector,
      headline_metric: study.headlineMetric,
      headline_metric_label: study.headlineMetricLabel,
      challenge: study.challenge,
      solution: study.solution,
      result: study.result,
      display_order: study.displayOrder,
      is_published: study.isPublished,
      is_demo: study.isDemo,
    })),
  );

  const categoryIds = await upsert(
    "blog_categories",
    blogCategories.map((category, index) => ({
      key: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      display_order: index,
    })),
  );

  await upsert(
    "blog_posts",
    blogPosts.map((post) => ({
      key: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      category_id:
        categoryIds.get(
          blogCategories.find((c) => c.slug === post.categorySlug)?.id ?? "",
        ) ?? null,
      author_id: teamIds.get(post.authorId) ?? null,
      tags: post.tags,
      reading_minutes: post.readingMinutes,
      published_at: post.publishedAt,
      updated_on: post.updatedAt,
      status: post.status,
      is_featured: post.isFeatured,
      seo: post.seo,
      is_demo: post.isDemo,
    })),
  );

  await upsert(
    "guides",
    guides.map((guide, index) => ({
      key: guide.id,
      slug: guide.slug,
      title: guide.title,
      summary: guide.summary,
      format: guide.format,
      audience: guide.audience,
      sections: guide.sections,
      updated_on: guide.updatedAt,
      seo: guide.seo,
      display_order: index,
      is_demo: guide.isDemo,
    })),
  );

  await upsert(
    "consultation_types",
    consultationTypes.map((type) => ({
      key: type.id,
      slug: type.slug,
      name: type.name,
      description: type.description,
      duration_minutes: type.durationMinutes,
      mode: type.mode,
      price_label: type.priceLabel,
      available_weekdays: type.availableWeekdays,
      slot_times: type.slotTimes,
      display_order: type.displayOrder,
      is_active: type.isActive,
      is_demo: type.isDemo,
    })),
  );

  console.log("\nSeed complete.\n");
  console.log(
    "Everything inserted is DEMO CONTENT. Replace it with the firm's real\n" +
      "details and set site_settings.show_demo_notices to false before launch.\n",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
