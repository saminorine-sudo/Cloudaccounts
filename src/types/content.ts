/**
 * Content types for CloudAccounts.
 *
 * Every one of these maps 1:1 to a planned database table (see
 * `docs/DATA-MODEL.md`). Components consume these types only — never raw
 * content files — so the storage layer can move from local modules to
 * Supabase without touching a single component.
 *
 * `isDemo` marks seed content that has not been supplied or verified by the
 * business. The UI uses it to render an honest "demo content" notice instead
 * of presenting invented figures as fact.
 */

export type Demoable = {
  /** True for placeholder seed content awaiting real, verified business data. */
  isDemo: boolean;
};

export type IconName =
  | "ledger"
  | "receipt"
  | "chart"
  | "percent"
  | "people"
  | "compass"
  | "shield"
  | "clock"
  | "spark"
  | "handshake"
  | "tag"
  | "briefcase";

export type Service = Demoable & {
  id: string;
  slug: string;
  title: string;
  /** One-line summary used on cards and in navigation. */
  summary: string;
  icon: IconName;
  /** Longer intro shown at the top of the service page. */
  intro: string;
  /** What the engagement actually includes. */
  includes: string[];
  /** Problem/outcome pairs — more persuasive than a feature list. */
  outcomes: { problem: string; outcome: string }[];
  /** Service-specific questions, appended to the shared FAQ set. */
  faqIds: string[];
  seo: SeoFields;
  displayOrder: number;
  isActive: boolean;
};

export type Audience = Demoable & {
  id: string;
  slug: string;
  title: string;
  summary: string;
  icon: IconName;
  intro: string;
  /** The situations this segment typically arrives with. */
  challenges: string[];
  /** How CloudAccounts responds to each. */
  support: { title: string; body: string }[];
  /** Slugs of the services most relevant to this segment. */
  recommendedServiceSlugs: string[];
  /** Slug of the pricing plan this segment usually starts on. */
  recommendedPlanSlug: string;
  seo: SeoFields;
  displayOrder: number;
  isActive: boolean;
};

export type PricingPlan = Demoable & {
  id: string;
  slug: string;
  name: string;
  /** Who the plan is built for. */
  audience: string;
  /** Price in whole pounds per month. Never hard-code this in a component. */
  priceMonthly: number;
  currency: "GBP";
  /** e.g. "From" — rendered before the price. */
  pricePrefix: string;
  /** e.g. "/month" — rendered after the price. */
  priceSuffix: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isRecommended: boolean;
  displayOrder: number;
  isActive: boolean;
};

export type Testimonial = Demoable & {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  /** 1–5. */
  rating: number;
  /** Path or URL to a portrait. Null renders an initials avatar instead. */
  photoUrl: string | null;
  isFeatured: boolean;
  displayOrder: number;
};

export type TeamMember = Demoable & {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  /**
   * Professional qualifications and memberships. Deliberately empty in demo
   * seed data — qualifications and regulatory memberships must never be
   * invented. Populate only with verified credentials.
   */
  qualifications: string[];
  memberships: string[];
  focus: string[];
  email: string | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type CaseStudy = Demoable & {
  id: string;
  slug: string;
  title: string;
  sector: string;
  /** The single number that leads the card, e.g. "£420k → £1.2m". */
  headlineMetric: string;
  headlineMetricLabel: string;
  challenge: string;
  solution: string;
  result: string;
  displayOrder: number;
  isPublished: boolean;
};

export type Faq = Demoable & {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  displayOrder: number;
  isPublished: boolean;
};

export type FaqCategory =
  | "general"
  | "pricing"
  | "services"
  | "switching"
  | "working-together";

export type SiteStat = Demoable & {
  id: string;
  value: string;
  label: string;
  /** Optional clarifying note shown under the label. */
  note: string | null;
  displayOrder: number;
};

export type BlogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type BlogPost = Demoable & {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Structured blocks rather than raw HTML — no dangerouslySetInnerHTML. */
  body: ContentBlock[];
  categorySlug: string;
  tags: string[];
  authorId: string;
  readingMinutes: number;
  publishedAt: string;
  updatedAt: string | null;
  status: "draft" | "scheduled" | "published";
  isFeatured: boolean;
  seo: SeoFields;
};

export type Guide = Demoable & {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** e.g. "Checklist", "Explainer". */
  format: string;
  audience: string;
  sections: { heading: string; points: string[] }[];
  updatedAt: string;
  seo: SeoFields;
};

/**
 * Structured content blocks. Storing structure rather than HTML strings keeps
 * rendering safe by default (React escapes text) and keeps the CMS editor and
 * the front end from drifting apart.
 */
export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "callout"; tone: "info" | "warning"; title: string; text: string }
  | { type: "quote"; text: string; attribution: string | null };

export type SeoFields = {
  title: string;
  description: string;
  /** Path relative to the site root, e.g. "/services/tax". */
  canonicalPath: string;
  /** Absolute or root-relative image path for Open Graph. */
  ogImagePath?: string | null;
  noIndex?: boolean;
};

export type ConsultationType = Demoable & {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  /** e.g. "Video call", "Telephone". */
  mode: string;
  priceLabel: string;
  /** 1 = Monday … 5 = Friday. */
  availableWeekdays: number[];
  /** 24h "HH:mm" slot starts offered for this consultation type. */
  slotTimes: string[];
  displayOrder: number;
  isActive: boolean;
};

export type OpeningHour = {
  label: string;
  hours: string;
};

export type ContactDetails = Demoable & {
  phone: string;
  phoneHref: string;
  email: string;
  addressLines: string[];
  postcode: string;
  /** Free-text note shown near the address, e.g. that it is demo data. */
  addressNote: string | null;
  openingHours: OpeningHour[];
  /** Approximate map centre. Demo values point at central London. */
  mapLat: number;
  mapLng: number;
};

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
};

export type SiteSettings = {
  name: string;
  legalName: string;
  tagline: string;
  /** Short description reused in the footer and structured data. */
  description: string;
  /** Canonical origin, e.g. "https://www.cloudaccounts.co.uk". */
  url: string;
  locale: string;
  contact: ContactDetails;
  socials: SocialLink[];
  /** Global default metadata, overridden per page. */
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    twitterHandle: string | null;
  };
  /**
   * When true the site renders visible notices wherever unverified demo
   * content appears. Set to false only once real content has been supplied.
   */
  showDemoNotices: boolean;
};
