import type {
  AudienceRow,
  BlogCategoryRow,
  BlogPostRow,
  CaseStudyRow,
  ConsultationTypeRow,
  FaqRow,
  GuideRow,
  PricingPlanRow,
  ServiceRow,
  SiteSettingsRow,
  SiteStatRow,
  TeamMemberRow,
  TestimonialRow,
} from "./database.types";
import type {
  Audience,
  BlogCategory,
  BlogPost,
  CaseStudy,
  ConsultationType,
  ContentBlock,
  Faq,
  Guide,
  IconName,
  PricingPlan,
  SeoFields,
  Service,
  SiteSettings,
  SiteStat,
  TeamMember,
  Testimonial,
} from "@/types/content";

/**
 * Database rows → domain objects.
 *
 * This is the only place snake_case becomes camelCase, and the only place
 * `jsonb` (which arrives as `unknown`) becomes a typed shape. Keeping it in
 * pure functions means the translation is unit-testable without a database,
 * and a schema change surfaces here rather than deep inside a component.
 *
 * The coercion helpers are deliberately forgiving about missing values and
 * strict about types. A half-populated row should render a slightly empty
 * page, not throw and take out the whole route.
 */

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asSeo(value: unknown, canonicalPath: string): SeoFields {
  const record = asRecord(value);
  return {
    title: asString(record.title),
    description: asString(record.description),
    canonicalPath: asString(record.canonicalPath, canonicalPath),
    ogImagePath:
      typeof record.ogImagePath === "string" ? record.ogImagePath : null,
    noIndex: record.noIndex === true,
  };
}

/**
 * Icon names come back as plain text. An unrecognised value would otherwise
 * render nothing at all, so it falls back to a neutral icon.
 */
const ICON_NAMES = new Set<IconName>([
  "ledger",
  "receipt",
  "chart",
  "percent",
  "people",
  "compass",
  "shield",
  "clock",
  "spark",
  "handshake",
  "tag",
  "briefcase",
]);

function asIcon(value: string): IconName {
  return ICON_NAMES.has(value as IconName) ? (value as IconName) : "briefcase";
}

/** Postgres `date` arrives as "YYYY-MM-DD", which is what the app expects. */
function asDate(value: string | null): string | null {
  return value ? value.slice(0, 10) : null;
}

/* -------------------------------------------------------------------------- */

export function toSiteSettings(row: SiteSettingsRow): SiteSettings {
  const contact = asRecord(row.contact);
  const seo = asRecord(row.seo);

  return {
    name: row.name,
    legalName: row.legal_name,
    tagline: row.tagline,
    description: row.description,
    url: row.url,
    locale: row.locale,
    contact: {
      isDemo: contact.isDemo === true,
      phone: asString(contact.phone),
      phoneHref: asString(contact.phoneHref),
      email: asString(contact.email),
      addressLines: asArray<string>(contact.addressLines),
      postcode: asString(contact.postcode),
      addressNote:
        typeof contact.addressNote === "string" ? contact.addressNote : null,
      openingHours: asArray<{ label: string; hours: string }>(
        contact.openingHours,
      ),
      mapLat: typeof contact.mapLat === "number" ? contact.mapLat : 51.5074,
      mapLng: typeof contact.mapLng === "number" ? contact.mapLng : -0.1278,
    },
    socials: asArray<{ id: string; platform: string; url: string }>(
      row.socials,
    ),
    seo: {
      titleTemplate: asString(seo.titleTemplate, "%s | CloudAccounts"),
      defaultTitle: asString(seo.defaultTitle, row.name),
      defaultDescription: asString(seo.defaultDescription, row.description),
      twitterHandle:
        typeof seo.twitterHandle === "string" ? seo.twitterHandle : null,
    },
    showDemoNotices: row.show_demo_notices,
  };
}

export function toSiteStat(row: SiteStatRow): SiteStat {
  return {
    id: row.key,
    value: row.value,
    label: row.label,
    note: row.note,
    displayOrder: row.display_order,
    isDemo: row.is_demo,
  };
}

export function toFaq(row: FaqRow): Faq {
  return {
    id: row.key,
    question: row.question,
    answer: row.answer,
    category: row.category,
    displayOrder: row.display_order,
    isPublished: row.is_published,
    isDemo: row.is_demo,
  };
}

/**
 * `faqKeys` is supplied by the caller from the `service_faqs` join, because a
 * mapper should not issue its own queries.
 */
export function toService(row: ServiceRow, faqKeys: string[] = []): Service {
  return {
    id: row.key,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    icon: asIcon(row.icon),
    intro: row.intro,
    includes: row.includes ?? [],
    outcomes: asArray<{ problem: string; outcome: string }>(row.outcomes),
    faqIds: faqKeys,
    seo: asSeo(row.seo, `/services/${row.slug}`),
    displayOrder: row.display_order,
    isActive: row.is_active,
    isDemo: row.is_demo,
  };
}

export function toPricingPlan(row: PricingPlanRow): PricingPlan {
  return {
    id: row.key,
    slug: row.slug,
    name: row.name,
    audience: row.audience,
    priceMonthly: row.price_monthly,
    currency: "GBP",
    pricePrefix: row.price_prefix,
    priceSuffix: row.price_suffix,
    description: row.description,
    features: row.features ?? [],
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    isRecommended: row.is_recommended,
    displayOrder: row.display_order,
    isActive: row.is_active,
    isDemo: row.is_demo,
  };
}

export function toAudience(
  row: AudienceRow,
  serviceSlugs: string[] = [],
  recommendedPlanSlug = "",
): Audience {
  return {
    id: row.key,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    icon: asIcon(row.icon),
    intro: row.intro,
    challenges: row.challenges ?? [],
    support: asArray<{ title: string; body: string }>(row.support),
    recommendedServiceSlugs: serviceSlugs,
    recommendedPlanSlug,
    seo: asSeo(row.seo, `/who-we-help/${row.slug}`),
    displayOrder: row.display_order,
    isActive: row.is_active,
    isDemo: row.is_demo,
  };
}

export function toTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.key,
    quote: row.quote,
    name: row.name,
    role: row.role,
    company: row.company,
    rating: row.rating,
    photoUrl: row.photo_url,
    isFeatured: row.is_featured,
    displayOrder: row.display_order,
    isDemo: row.is_demo,
  };
}

export function toTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.key,
    slug: row.slug,
    name: row.name,
    role: row.role,
    bio: row.bio,
    qualifications: row.qualifications ?? [],
    memberships: row.memberships ?? [],
    focus: row.focus ?? [],
    email: row.email,
    linkedinUrl: row.linkedin_url,
    photoUrl: row.photo_url,
    displayOrder: row.display_order,
    isActive: row.is_active,
    isDemo: row.is_demo,
  };
}

export function toCaseStudy(row: CaseStudyRow): CaseStudy {
  return {
    id: row.key,
    slug: row.slug,
    title: row.title,
    sector: row.sector,
    headlineMetric: row.headline_metric,
    headlineMetricLabel: row.headline_metric_label,
    challenge: row.challenge,
    solution: row.solution,
    result: row.result,
    displayOrder: row.display_order,
    isPublished: row.is_published,
    isDemo: row.is_demo,
  };
}

export function toBlogCategory(row: BlogCategoryRow): BlogCategory {
  return {
    id: row.key,
    slug: row.slug,
    name: row.name,
    description: row.description,
  };
}

export function toBlogPost(
  row: BlogPostRow,
  categorySlug = "",
  authorKey = "",
): BlogPost {
  return {
    id: row.key,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: asArray<ContentBlock>(row.body),
    categorySlug,
    tags: row.tags ?? [],
    authorId: authorKey,
    readingMinutes: row.reading_minutes,
    publishedAt: row.published_at.slice(0, 10),
    updatedAt: asDate(row.updated_on),
    status: row.status,
    isFeatured: row.is_featured,
    seo: asSeo(row.seo, `/resources/blog/${row.slug}`),
    isDemo: row.is_demo,
  };
}

export function toGuide(row: GuideRow): Guide {
  return {
    id: row.key,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    format: row.format,
    audience: row.audience,
    sections: asArray<{ heading: string; points: string[] }>(row.sections),
    updatedAt: row.updated_on.slice(0, 10),
    seo: asSeo(row.seo, `/resources/guides/${row.slug}`),
    isDemo: row.is_demo,
  };
}

export function toConsultationType(row: ConsultationTypeRow): ConsultationType {
  return {
    id: row.key,
    slug: row.slug,
    name: row.name,
    description: row.description,
    durationMinutes: row.duration_minutes,
    mode: row.mode,
    priceLabel: row.price_label,
    availableWeekdays: row.available_weekdays ?? [],
    slotTimes: row.slot_times ?? [],
    displayOrder: row.display_order,
    isActive: row.is_active,
    isDemo: row.is_demo,
  };
}
