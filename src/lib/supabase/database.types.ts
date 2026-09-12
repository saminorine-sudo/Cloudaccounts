/**
 * Database row types.
 *
 * Hand-written to match `supabase/migrations/`. Once a Supabase project
 * exists, replace this file with generated types and the mappers below will
 * start catching any drift between the schema and the application:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 *
 * Only the tables the application actually queries are typed. Adding a table
 * here without querying it would be type surface with nothing behind it.
 */

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "ACCOUNTANT"
  | "STAFF"
  | "CLIENT";

export type LeadStatusRow =
  | "NEW"
  | "CONTACTED"
  | "CONSULTATION_BOOKED"
  | "PROPOSAL_SENT"
  | "WON"
  | "LOST";

export type AppointmentStatusRow =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type PostStatusRow = "draft" | "scheduled" | "published";

export type FaqCategoryRow =
  | "general"
  | "pricing"
  | "services"
  | "switching"
  | "working-together";

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type SiteSettingsRow = {
  id: boolean;
  name: string;
  legal_name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  contact: unknown;
  socials: unknown;
  seo: unknown;
  show_demo_notices: boolean;
  updated_at: string;
};

export type SiteStatRow = Timestamps & {
  id: string;
  key: string;
  value: string;
  label: string;
  note: string | null;
  display_order: number;
  is_demo: boolean;
};

export type FaqRow = Timestamps & {
  id: string;
  key: string;
  question: string;
  answer: string;
  category: FaqCategoryRow;
  display_order: number;
  is_published: boolean;
  is_demo: boolean;
};

export type ServiceRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
  intro: string;
  includes: string[];
  outcomes: unknown;
  seo: unknown;
  display_order: number;
  is_active: boolean;
  is_demo: boolean;
};

export type PricingPlanRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  name: string;
  audience: string;
  price_monthly: number;
  currency: string;
  price_prefix: string;
  price_suffix: string;
  description: string;
  features: string[];
  cta_label: string;
  cta_href: string;
  is_recommended: boolean;
  display_order: number;
  is_active: boolean;
  is_demo: boolean;
};

export type AudienceRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
  intro: string;
  challenges: string[];
  support: unknown;
  recommended_plan_id: string | null;
  seo: unknown;
  display_order: number;
  is_active: boolean;
  is_demo: boolean;
};

export type ServiceFaqRow = {
  service_id: string;
  faq_id: string;
  display_order: number;
};

export type AudienceServiceRow = {
  audience_id: string;
  service_id: string;
  display_order: number;
};

export type TestimonialRow = Timestamps & {
  id: string;
  key: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  photo_url: string | null;
  is_featured: boolean;
  display_order: number;
  is_demo: boolean;
};

export type TeamMemberRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  qualifications: string[];
  memberships: string[];
  focus: string[];
  email: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  display_order: number;
  is_active: boolean;
  is_demo: boolean;
};

export type CaseStudyRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  title: string;
  sector: string;
  headline_metric: string;
  headline_metric_label: string;
  challenge: string;
  solution: string;
  result: string;
  display_order: number;
  is_published: boolean;
  is_demo: boolean;
};

export type BlogCategoryRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string;
  display_order: number;
};

export type BlogPostRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  title: string;
  excerpt: string;
  body: unknown;
  category_id: string | null;
  author_id: string | null;
  tags: string[];
  reading_minutes: number;
  published_at: string;
  updated_on: string | null;
  status: PostStatusRow;
  is_featured: boolean;
  seo: unknown;
  is_demo: boolean;
};

export type GuideRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  title: string;
  summary: string;
  format: string;
  audience: string;
  sections: unknown;
  updated_on: string;
  seo: unknown;
  display_order: number;
  is_demo: boolean;
};

export type ConsultationTypeRow = Timestamps & {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string;
  duration_minutes: number;
  mode: string;
  price_label: string;
  available_weekdays: number[];
  slot_times: string[];
  display_order: number;
  is_active: boolean;
  is_demo: boolean;
};

export type LeadRow = Timestamps & {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  business_type: string;
  turnover: string;
  services: string[];
  message: string;
  preferred_contact: string;
  source: string;
  status: LeadStatusRow;
  assigned_to_id: string | null;
  follow_up_at: string | null;
};

export type LeadNoteRow = {
  id: string;
  lead_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
};

export type LeadStatusHistoryRow = {
  id: string;
  lead_id: string;
  from_status: LeadStatusRow | null;
  to_status: LeadStatusRow;
  changed_by_id: string | null;
  created_at: string;
};

export type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_handled: boolean;
  created_at: string;
};

export type AppointmentRow = Timestamps & {
  id: string;
  consultation_type_id: string;
  scheduled_on: string;
  scheduled_at_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  notes: string | null;
  status: AppointmentStatusRow;
  lead_id: string | null;
};

export type ProfileRow = Timestamps & {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
};

/** Insert and update shapes are derived so a column rename breaks both. */
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      site_settings: Table<SiteSettingsRow>;
      site_stats: Table<SiteStatRow>;
      faqs: Table<FaqRow>;
      services: Table<ServiceRow>;
      pricing_plans: Table<PricingPlanRow>;
      audiences: Table<AudienceRow>;
      service_faqs: Table<ServiceFaqRow>;
      audience_services: Table<AudienceServiceRow>;
      testimonials: Table<TestimonialRow>;
      team_members: Table<TeamMemberRow>;
      case_studies: Table<CaseStudyRow>;
      blog_categories: Table<BlogCategoryRow>;
      blog_posts: Table<BlogPostRow>;
      guides: Table<GuideRow>;
      consultation_types: Table<ConsultationTypeRow>;
      leads: Table<LeadRow>;
      lead_notes: Table<LeadNoteRow>;
      lead_status_history: Table<LeadStatusHistoryRow>;
      contact_submissions: Table<ContactSubmissionRow>;
      appointments: Table<AppointmentRow>;
      profiles: Table<ProfileRow>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      user_role: UserRole;
      lead_status: LeadStatusRow;
      appointment_status: AppointmentStatusRow;
      post_status: PostStatusRow;
      faq_category: FaqCategoryRow;
    };
    CompositeTypes: Record<never, never>;
  };
};
