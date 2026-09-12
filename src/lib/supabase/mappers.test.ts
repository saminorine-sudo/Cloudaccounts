import { describe, expect, it } from "vitest";

import type {
  AudienceRow,
  BlogPostRow,
  ConsultationTypeRow,
  GuideRow,
  PricingPlanRow,
  ServiceRow,
  SiteSettingsRow,
  TeamMemberRow,
} from "./database.types";
import {
  toAudience,
  toBlogPost,
  toConsultationType,
  toGuide,
  toPricingPlan,
  toService,
  toSiteSettings,
  toTeamMember,
} from "./mappers";

/**
 * The mappers are the boundary between the database and the application, so
 * these tests cover the things that actually go wrong there: snake_case to
 * camelCase, jsonb arriving as `unknown`, nullable columns, and Postgres date
 * and time formats.
 *
 * A half-populated row should degrade to an empty-ish object rather than
 * throw — one bad row should not take out a whole page.
 */

const timestamps = {
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const serviceRow: ServiceRow = {
  ...timestamps,
  id: "uuid-1",
  key: "svc-tax",
  slug: "tax",
  title: "Corporation Tax",
  summary: "Clear tax preparation.",
  icon: "percent",
  intro: "Intro copy.",
  includes: ["CT600 return", "Filing with HMRC"],
  outcomes: [{ problem: "Surprise bills", outcome: "A running estimate" }],
  seo: {
    title: "Corporation Tax accountants",
    description: "Returns and planning.",
    canonicalPath: "/services/tax",
  },
  display_order: 2,
  is_active: true,
  is_demo: true,
};

describe("service mapper", () => {
  it("converts a row to the domain shape", () => {
    const service = toService(serviceRow, ["faq-a", "faq-b"]);

    // `key` is the stable editorial id the app uses, not the database uuid.
    expect(service.id).toBe("svc-tax");
    expect(service.slug).toBe("tax");
    expect(service.displayOrder).toBe(2);
    expect(service.isActive).toBe(true);
    expect(service.isDemo).toBe(true);
    expect(service.includes).toEqual(["CT600 return", "Filing with HMRC"]);
    expect(service.outcomes[0].problem).toBe("Surprise bills");
    expect(service.faqIds).toEqual(["faq-a", "faq-b"]);
    expect(service.seo.canonicalPath).toBe("/services/tax");
  });

  it("defaults faqIds to empty when no join rows are supplied", () => {
    expect(toService(serviceRow).faqIds).toEqual([]);
  });

  it("falls back to a known icon when the column holds something unexpected", () => {
    const service = toService({ ...serviceRow, icon: "not-an-icon" });
    expect(service.icon).toBe("briefcase");
  });

  it("survives null jsonb columns", () => {
    const service = toService({
      ...serviceRow,
      outcomes: null,
      seo: null,
    } as unknown as ServiceRow);

    expect(service.outcomes).toEqual([]);
    // A missing canonical path is derived from the slug rather than left blank.
    expect(service.seo.canonicalPath).toBe("/services/tax");
  });

  it("survives a jsonb column holding the wrong type", () => {
    const service = toService({
      ...serviceRow,
      outcomes: "not an array",
    } as unknown as ServiceRow);
    expect(service.outcomes).toEqual([]);
  });
});

describe("pricing plan mapper", () => {
  const row: PricingPlanRow = {
    ...timestamps,
    id: "uuid-2",
    key: "plan-limited-company",
    slug: "limited-company",
    name: "Limited Company",
    audience: "Contractors and companies.",
    price_monthly: 99,
    currency: "GBP",
    price_prefix: "From",
    price_suffix: "/month",
    description: "Full compliance cover.",
    features: ["Year-end accounts", "Corporation Tax"],
    cta_label: "Get Started",
    cta_href: "/contact?plan=limited-company",
    is_recommended: true,
    display_order: 2,
    is_active: true,
    is_demo: true,
  };

  it("keeps the price as a whole number of pounds", () => {
    const plan = toPricingPlan(row);
    expect(plan.priceMonthly).toBe(99);
    expect(typeof plan.priceMonthly).toBe("number");
    expect(plan.isRecommended).toBe(true);
    expect(plan.features).toHaveLength(2);
  });
});

describe("audience mapper", () => {
  const row: AudienceRow = {
    ...timestamps,
    id: "uuid-3",
    key: "aud-contractors",
    slug: "contractors",
    title: "Contractors",
    summary: "Tax-efficient accounting.",
    icon: "clock",
    intro: "Intro.",
    challenges: ["Salary and dividend split"],
    support: [{ title: "Planning", body: "We model the split." }],
    recommended_plan_id: "plan-uuid",
    seo: {},
    display_order: 2,
    is_active: true,
    is_demo: true,
  };

  it("takes related slugs from the caller rather than querying", () => {
    const audience = toAudience(row, ["tax", "accounting"], "limited-company");
    expect(audience.recommendedServiceSlugs).toEqual(["tax", "accounting"]);
    expect(audience.recommendedPlanSlug).toBe("limited-company");
    expect(audience.support[0].title).toBe("Planning");
  });

  it("defaults relations to empty when unresolved", () => {
    const audience = toAudience(row);
    expect(audience.recommendedServiceSlugs).toEqual([]);
    expect(audience.recommendedPlanSlug).toBe("");
  });
});

describe("blog post mapper", () => {
  const row: BlogPostRow = {
    ...timestamps,
    id: "uuid-4",
    key: "post-vat",
    slug: "when-to-register-for-vat",
    title: "When to register for VAT",
    excerpt: "The two tests.",
    body: [{ type: "paragraph", text: "There are two tests." }],
    category_id: "cat-uuid",
    author_id: "author-uuid",
    tags: ["vat"],
    reading_minutes: 5,
    // Postgres returns a date column as YYYY-MM-DD, but a timestamp would
    // arrive with a time component — both must reduce to a plain date.
    published_at: "2026-06-23",
    updated_on: null,
    status: "published",
    is_featured: false,
    seo: {},
    is_demo: true,
  };

  it("maps content blocks through untouched", () => {
    const post = toBlogPost(row, "vat", "team-4");
    expect(post.body).toEqual([
      { type: "paragraph", text: "There are two tests." },
    ]);
    expect(post.categorySlug).toBe("vat");
    expect(post.authorId).toBe("team-4");
    expect(post.publishedAt).toBe("2026-06-23");
    expect(post.updatedAt).toBeNull();
  });

  it("trims a timestamp down to a plain date", () => {
    const post = toBlogPost(
      { ...row, published_at: "2026-06-23T00:00:00+00:00" },
      "vat",
    );
    expect(post.publishedAt).toBe("2026-06-23");
  });

  it("keeps an updated date when present", () => {
    const post = toBlogPost({ ...row, updated_on: "2026-08-01" }, "vat");
    expect(post.updatedAt).toBe("2026-08-01");
  });
});

describe("team member mapper", () => {
  const row: TeamMemberRow = {
    ...timestamps,
    id: "uuid-5",
    key: "team-1",
    slug: "elena-marsh",
    name: "Elena Marsh",
    role: "Founder",
    bio: "Bio.",
    qualifications: [],
    memberships: [],
    focus: ["Advisory"],
    email: null,
    linkedin_url: null,
    photo_url: null,
    display_order: 1,
    is_active: true,
    is_demo: true,
  };

  it("preserves empty qualifications rather than inventing any", () => {
    const member = toTeamMember(row);
    expect(member.qualifications).toEqual([]);
    expect(member.memberships).toEqual([]);
  });

  it("keeps nullable contact columns as null", () => {
    const member = toTeamMember(row);
    expect(member.email).toBeNull();
    expect(member.linkedinUrl).toBeNull();
    expect(member.photoUrl).toBeNull();
  });
});

describe("consultation type mapper", () => {
  const row: ConsultationTypeRow = {
    ...timestamps,
    id: "uuid-6",
    key: "consult-intro",
    slug: "free-consultation",
    name: "Free Consultation",
    description: "A conversation.",
    duration_minutes: 30,
    mode: "Video call",
    price_label: "Free",
    available_weekdays: [1, 2, 3, 4, 5],
    slot_times: ["09:00", "14:30"],
    display_order: 1,
    is_active: true,
    is_demo: true,
  };

  it("maps availability arrays used by the booking rules", () => {
    const type = toConsultationType(row);
    expect(type.availableWeekdays).toEqual([1, 2, 3, 4, 5]);
    expect(type.slotTimes).toEqual(["09:00", "14:30"]);
    expect(type.durationMinutes).toBe(30);
  });

  it("copes with null array columns", () => {
    const type = toConsultationType({
      ...row,
      available_weekdays: null,
      slot_times: null,
    } as unknown as ConsultationTypeRow);

    expect(type.availableWeekdays).toEqual([]);
    expect(type.slotTimes).toEqual([]);
  });
});

describe("guide mapper", () => {
  it("reduces the updated date to YYYY-MM-DD", () => {
    const row: GuideRow = {
      ...timestamps,
      id: "uuid-7",
      key: "guide-switching",
      slug: "switching-accountants",
      title: "Switching accountants",
      summary: "How it works.",
      format: "Explainer",
      audience: "Anyone moving",
      sections: [{ heading: "The process", points: ["Notify them"] }],
      updated_on: "2026-07-30",
      seo: {},
      display_order: 1,
      is_demo: true,
    };

    const guide = toGuide(row);
    expect(guide.updatedAt).toBe("2026-07-30");
    expect(guide.sections[0].points).toEqual(["Notify them"]);
  });
});

describe("site settings mapper", () => {
  const row: SiteSettingsRow = {
    id: true,
    name: "CloudAccounts",
    legal_name: "CloudAccounts (demo)",
    tagline: "Accounting that helps.",
    description: "Support for UK businesses.",
    url: "https://example.com",
    locale: "en_GB",
    contact: {
      isDemo: true,
      phone: "020 7946 0958",
      phoneHref: "tel:+442079460958",
      email: "hello@example.com",
      addressLines: ["CloudAccounts", "27 Finsbury Square", "London"],
      postcode: "EC2A 1AA",
      addressNote: "Demo address.",
      openingHours: [{ label: "Monday to Thursday", hours: "9:00am – 5:30pm" }],
      mapLat: 51.5215,
      mapLng: -0.0865,
    },
    socials: [{ id: "linkedin", platform: "LinkedIn", url: "https://li.test" }],
    seo: { titleTemplate: "%s | CloudAccounts" },
    show_demo_notices: true,
    updated_at: "2026-01-01T00:00:00Z",
  };

  it("unpacks the nested contact and seo jsonb", () => {
    const settings = toSiteSettings(row);
    expect(settings.contact.phone).toBe("020 7946 0958");
    expect(settings.contact.addressLines).toHaveLength(3);
    expect(settings.contact.openingHours[0].label).toBe("Monday to Thursday");
    expect(settings.socials[0].platform).toBe("LinkedIn");
    expect(settings.showDemoNotices).toBe(true);
  });

  it("falls back to sensible values when the jsonb is empty", () => {
    const settings = toSiteSettings({ ...row, contact: {}, seo: {} });

    expect(settings.contact.phone).toBe("");
    expect(settings.contact.addressLines).toEqual([]);
    expect(settings.contact.addressNote).toBeNull();
    // Central London, so a map never renders at latitude zero.
    expect(settings.contact.mapLat).toBeCloseTo(51.5074);
    expect(settings.seo.defaultTitle).toBe("CloudAccounts");
  });

  it("carries the demo-notice flag through, since the UI depends on it", () => {
    expect(toSiteSettings({ ...row, show_demo_notices: false }).showDemoNotices)
      .toBe(false);
  });
});
