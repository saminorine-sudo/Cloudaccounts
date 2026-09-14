/**
 * Emits the demo content as a standalone SQL file.
 *
 *   npm run db:sql > supabase/seed.sql
 *
 * Why this exists alongside `seed-database.ts`: that script needs network
 * access to the project. This one needs nothing, so the content can be loaded
 * by pasting into the Supabase SQL editor — which is the only route available
 * when the machine running the build cannot reach supabase.co.
 *
 * Both read the same modules in `src/content`, so there is still one source of
 * truth for the content itself. The row mappings are written twice, which
 * TypeScript guards: every builder below is typed against the generated
 * `Insert` type for its table, so a renamed or missing column fails
 * `npm run typecheck` rather than failing in the SQL editor.
 *
 * Cross-table references are emitted as `(select id from … where key = …)`
 * subqueries rather than generated uuids, so the file stays idempotent no
 * matter what ids the database assigned on a previous run.
 *
 * NO EXPLICIT TRANSACTION. The Supabase SQL editor wraps whatever it is given
 * in its own transaction, and a `commit;` in the middle of that closes it out
 * from under the wrapper — which surfaces as `relation "billable" does not
 * exist`, naming an internal CTE rather than anything in this file. The
 * editor's own transaction is what makes this atomic there; with psql, pass
 * `-1` to get the same guarantee.
 */

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

/** A reference to another table's row, resolved by `key` at insert time. */
type Ref = { __ref: { table: string; key: string } };

const ref = (table: string, key: string | undefined | null): Ref | null =>
  key ? { __ref: { table, key } } : null;

const isRef = (value: unknown): value is Ref =>
  typeof value === "object" && value !== null && "__ref" in value;

/**
 * Columns stored as `jsonb`. Everything else that arrives as an array is a
 * Postgres array column. Listing them explicitly beats inferring from the
 * value, because an empty array is ambiguous and would silently pick wrong.
 */
const jsonbColumns = new Set([
  "contact",
  "socials",
  "seo",
  "outcomes",
  "support",
  "sections",
  "body",
  "metadata",
]);

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** Postgres array literal: {"a","b"}. Left untyped so the column casts it. */
function arrayLiteral(values: readonly unknown[]): string {
  if (values.length === 0) return "'{}'";
  const items = values.map((item) => {
    if (typeof item === "number") return String(item);
    return `"${String(item).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  });
  return quote(`{${items.join(",")}}`);
}

function literal(column: string, value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (isRef(value)) {
    return `(select id from public.${value.__ref.table} where key = ${quote(value.__ref.key)})`;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (jsonbColumns.has(column)) return `${quote(JSON.stringify(value))}::jsonb`;
  if (Array.isArray(value)) return arrayLiteral(value);
  return quote(String(value));
}

/**
 * An upsert keyed on `key`. Re-running updates in place, so the file is safe
 * to apply more than once and after editing the content modules.
 */
function upsert(
  table: string,
  rows: readonly Record<string, unknown>[],
  conflict = "key",
): string {
  if (rows.length === 0) return "";

  const columns = Object.keys(rows[0]);
  const updates = columns
    .filter((column) => column !== conflict)
    .map((column) => `  ${column} = excluded.${column}`)
    .join(",\n");

  const values = rows
    .map(
      (row) =>
        `  (${columns.map((column) => literal(column, row[column])).join(", ")})`,
    )
    .join(",\n");

  return [
    `-- ${table} (${rows.length})`,
    `insert into public.${table} (${columns.join(", ")}) values`,
    values,
    `on conflict (${conflict}) do update set`,
    `${updates};`,
    "",
  ].join("\n");
}

/** Join tables are replaced wholesale, so a removed link does not linger. */
function replaceJoin(
  table: string,
  rows: readonly Record<string, unknown>[],
): string {
  const columns = Object.keys(rows[0]);
  const values = rows
    .map(
      (row) =>
        `  (${columns.map((column) => literal(column, row[column])).join(", ")})`,
    )
    .join(",\n");

  return [
    `-- ${table} (${rows.length})`,
    `delete from public.${table};`,
    `insert into public.${table} (${columns.join(", ")}) values`,
    values,
    `on conflict do nothing;`,
    "",
  ].join("\n");
}

const sections: string[] = [
  `-- CloudAccounts — demo content`,
  `--`,
  `-- Generated from src/content by \`npm run db:sql\`. Do not edit by hand:`,
  `-- edit the content modules and regenerate.`,
  `--`,
  `-- Run AFTER 0001_schema.sql and 0002_rls.sql. Safe to re-run.`,
  `--`,
  `-- No begin/commit: the Supabase SQL editor supplies its own transaction,`,
  `-- and committing inside it breaks the editor's wrapper. With psql, use -1.`,
  `--`,
  `-- EVERYTHING BELOW IS DEMO CONTENT. Statistics, reviews, case studies,`,
  `-- prices, team profiles and contact details are placeholders. Replace them`,
  `-- and set site_settings.show_demo_notices to false before launch.`,
  ``,
];

sections.push(
  upsert(
    "site_settings",
    [
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
    ],
    "id",
  ),
);

sections.push(
  upsert(
    "site_stats",
    siteStats.map((stat) => ({
      key: stat.id,
      value: stat.value,
      label: stat.label,
      note: stat.note,
      display_order: stat.displayOrder,
      is_demo: stat.isDemo,
    })),
  ),
);

sections.push(
  upsert(
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
  ),
);

sections.push(
  upsert(
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
  ),
);

sections.push(
  upsert(
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
  ),
);

sections.push(
  upsert(
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
      recommended_plan_id: ref(
        "pricing_plans",
        pricingPlans.find((p) => p.slug === audience.recommendedPlanSlug)?.id,
      ),
      seo: audience.seo,
      display_order: audience.displayOrder,
      is_active: audience.isActive,
      is_demo: audience.isDemo,
    })),
  ),
);

sections.push(
  replaceJoin(
    "service_faqs",
    services.flatMap((service) =>
      service.faqIds.map((faqKey, index) => ({
        service_id: ref("services", service.id),
        faq_id: ref("faqs", faqKey),
        display_order: index,
      })),
    ),
  ),
);

sections.push(
  replaceJoin(
    "audience_services",
    audiences.flatMap((audience) =>
      audience.recommendedServiceSlugs.map((slug, index) => ({
        audience_id: ref("audiences", audience.id),
        service_id: ref(
          "services",
          services.find((s) => s.slug === slug)?.id,
        ),
        display_order: index,
      })),
    ),
  ),
);

sections.push(
  upsert(
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
  ),
);

sections.push(
  upsert(
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
  ),
);

sections.push(
  upsert(
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
  ),
);

sections.push(
  upsert(
    "blog_categories",
    blogCategories.map((category, index) => ({
      key: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      display_order: index,
    })),
  ),
);

sections.push(
  upsert(
    "blog_posts",
    blogPosts.map((post) => ({
      key: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      category_id: ref(
        "blog_categories",
        blogCategories.find((c) => c.slug === post.categorySlug)?.id,
      ),
      author_id: ref("team_members", post.authorId),
      tags: post.tags,
      reading_minutes: post.readingMinutes,
      published_at: post.publishedAt,
      updated_on: post.updatedAt,
      status: post.status,
      is_featured: post.isFeatured,
      seo: post.seo,
      is_demo: post.isDemo,
    })),
  ),
);

sections.push(
  upsert(
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
  ),
);

sections.push(
  upsert(
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
  ),
);

process.stdout.write(sections.join("\n"));
