import type { PricingPlan } from "@/types/content";

/**
 * DEMO PRICING — indicative figures only.
 *
 * These prices are placeholders for development. They are rendered from this
 * module (and, later, from the `pricing_plans` table) rather than hard-coded
 * into components, so they can be changed without a deploy. The pricing page
 * carries a visible disclaimer while `isDemo` is true.
 */
export const pricingPlans: PricingPlan[] = [
  {
    id: "plan-sole-trader",
    slug: "sole-trader",
    name: "Sole Trader",
    audience: "Self-employed people and freelancers not trading as a company.",
    priceMonthly: 49,
    currency: "GBP",
    pricePrefix: "From",
    priceSuffix: "/month",
    description:
      "Everything a sole trader needs to stay on top of Self Assessment without thinking about it in January.",
    features: [
      "Self Assessment prepared and filed",
      "Sole trader accounts",
      "Basic bookkeeping support",
      "Tax calculations and payment reminders",
      "Email support with a named contact",
    ],
    ctaLabel: "Get Started",
    ctaHref: "/contact?plan=sole-trader",
    isRecommended: false,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "plan-limited-company",
    slug: "limited-company",
    name: "Limited Company",
    audience: "Contractors and established limited companies.",
    priceMonthly: 99,
    currency: "GBP",
    pricePrefix: "From",
    priceSuffix: "/month",
    description:
      "Full compliance cover for a limited company, with the planning conversations built in rather than billed extra.",
    features: [
      "Year-end accounts filed with Companies House",
      "Corporation Tax return and computation",
      "Bookkeeping support",
      "VAT returns under Making Tax Digital",
      "Director payroll",
      "Salary and dividend planning",
      "Unlimited accountant support",
    ],
    ctaLabel: "Get Started",
    ctaHref: "/contact?plan=limited-company",
    isRecommended: true,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "plan-growing-business",
    slug: "growing-business",
    name: "Growing Business",
    audience: "Businesses with staff, stock or multiple revenue lines.",
    priceMonthly: 199,
    currency: "GBP",
    pricePrefix: "From",
    priceSuffix: "/month",
    description:
      "Monthly numbers and a regular conversation about what they mean, on top of everything in the compliance layer.",
    features: [
      "Monthly bookkeeping",
      "Monthly management accounts",
      "Payroll for your team",
      "VAT returns and scheme reviews",
      "Corporation Tax and tax planning",
      "Cash flow forecasting",
      "Business advisory calls",
      "A dedicated accountant",
    ],
    ctaLabel: "Talk to an Accountant",
    ctaHref: "/book-consultation?plan=growing-business",
    isRecommended: false,
    displayOrder: 3,
    isActive: true,
  },
].map((plan) => ({ ...plan, isDemo: true }) as PricingPlan);

/**
 * Shown beneath the pricing table. Kept alongside the plans so it moves with
 * them into the CMS.
 */
export const pricingNotes = [
  "Prices exclude VAT and are billed monthly.",
  "Your quote depends on turnover, transaction volume, payroll size and how many services you need — the consultation exists to pin that down.",
  "No tie-in period and no charge for asking a question.",
];

export const pricingDisclaimer =
  "The figures shown are placeholders used during development, not a quotation. Confirmed fees are provided in writing after a consultation.";
