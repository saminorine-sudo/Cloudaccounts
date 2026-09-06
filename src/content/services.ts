import type { Service } from "@/types/content";

/**
 * DEMO CONTENT — service definitions.
 *
 * Copy describes the general shape of a UK accountancy engagement. Confirm
 * scope, inclusions and turnaround times with CloudAccounts before launch.
 */
export const services: Service[] = [
  {
    id: "svc-accounting",
    slug: "accounting",
    title: "Accounting",
    summary: "Annual accounts and ongoing accounting support.",
    icon: "ledger",
    intro:
      "We prepare your year-end accounts, file them where they need to go, and make sure you actually understand what they say. Most of our clients come to us because their previous accounts arrived nine months late with no explanation attached.",
    includes: [
      "Year-end statutory accounts prepared and filed with Companies House",
      "Sole trader and partnership accounts",
      "Companies House confirmation statement",
      "Director's Self Assessment where it forms part of your plan",
      "A year-end review call to walk through the numbers",
      "Ongoing questions answered without a per-email charge",
    ],
    outcomes: [
      {
        problem: "Accounts arrive months late, long after they are useful.",
        outcome:
          "We agree a timetable at the start of the year and tell you what we need and when.",
      },
      {
        problem: "The numbers are filed but nobody explains them.",
        outcome:
          "Every set of accounts comes with a short review call in plain English.",
      },
      {
        problem: "Deadlines creep up and penalties follow.",
        outcome:
          "Filing dates are tracked for you, with reminders well ahead of time.",
      },
    ],
    faqIds: ["faq-switching", "faq-deadlines", "faq-remote"],
    seo: {
      title: "Accounting services for UK businesses",
      description:
        "Year-end accounts, Companies House filing and ongoing accounting support for sole traders, contractors and limited companies. Book a free consultation.",
      canonicalPath: "/services/accounting",
    },
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "svc-tax",
    slug: "tax",
    title: "Corporation Tax",
    summary:
      "Clear tax preparation and planning for limited companies.",
    icon: "percent",
    intro:
      "Corporation Tax is where a lot of avoidable cost sits. We prepare and file your return, and we look at the position early enough in the year that there is still something useful to do about it.",
    includes: [
      "Corporation Tax computation and CT600 return",
      "Filing with HMRC alongside your statutory accounts",
      "Review of allowable expenses and capital allowances",
      "Salary and dividend planning for director-shareholders",
      "Guidance on the payment deadline and how much to set aside",
      "Support with HMRC correspondence and queries",
    ],
    outcomes: [
      {
        problem: "The tax bill is a surprise every year.",
        outcome:
          "We give you a running estimate so you can put money aside as you go.",
      },
      {
        problem: "Planning conversations happen after the year has ended.",
        outcome:
          "We review your position mid-year, while decisions can still change the outcome.",
      },
      {
        problem: "Nobody explains what is actually claimable.",
        outcome:
          "We go through your costs with you rather than guessing from a bank feed.",
      },
    ],
    faqIds: ["faq-corporation-tax", "faq-deadlines", "faq-switching"],
    seo: {
      title: "Corporation Tax accountants",
      description:
        "Corporation Tax returns, computations and planning for UK limited companies. Clear advice on what you owe and when. Book a free consultation.",
      canonicalPath: "/services/tax",
    },
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "svc-bookkeeping",
    slug: "bookkeeping",
    title: "Bookkeeping",
    summary:
      "Accurate bookkeeping so the business always knows where it stands.",
    icon: "receipt",
    intro:
      "Good bookkeeping is not admin for its own sake. It is what makes every other number — your tax estimate, your VAT return, your margin — worth trusting. We keep it current so you are never working from a six-month-old picture.",
    includes: [
      "Monthly or quarterly bookkeeping",
      "Bank reconciliation and transaction categorisation",
      "Sales and purchase ledger maintenance",
      "Receipt capture set up on software you already use",
      "Month-end review and a short summary of what changed",
      "Clean records handed straight through to VAT and year-end",
    ],
    outcomes: [
      {
        problem: "Records are reconstructed in a panic at year end.",
        outcome:
          "Books are kept current month by month, so year end is a review rather than a rebuild.",
      },
      {
        problem: "Reports do not match reality.",
        outcome:
          "Reconciled accounts mean the reports you look at are the ones we work from.",
      },
      {
        problem: "Chasing paperwork eats evenings and weekends.",
        outcome:
          "Receipt capture and bank feeds cut the manual work down to a few minutes a week.",
      },
    ],
    faqIds: ["faq-software", "faq-onboarding", "faq-remote"],
    seo: {
      title: "Bookkeeping services",
      description:
        "Monthly and quarterly bookkeeping, bank reconciliation and receipt capture for UK businesses. Keep your numbers current. Book a free consultation.",
      canonicalPath: "/services/bookkeeping",
    },
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "svc-payroll",
    slug: "payroll",
    title: "Payroll",
    summary: "Reliable payroll processing and reporting.",
    icon: "people",
    intro:
      "Payroll has to be right and it has to be on time, every month, without you chasing it. We run it, file it and tell you what is leaving the bank account and when.",
    includes: [
      "Monthly or weekly payroll processing",
      "Real Time Information submissions to HMRC",
      "Payslips distributed to your team",
      "Starters, leavers, P45s and P60s",
      "Auto-enrolment pension submissions",
      "A clear monthly summary of PAYE and National Insurance due",
    ],
    outcomes: [
      {
        problem: "Payroll is one more thing to remember each month.",
        outcome:
          "We run to a fixed schedule and only come to you when something has changed.",
      },
      {
        problem: "It is never clear what is owed to HMRC.",
        outcome:
          "Every run comes with the payment amount, the reference and the due date.",
      },
      {
        problem: "New starters create a scramble.",
        outcome: "Send us the details and we handle the onboarding paperwork.",
      },
    ],
    faqIds: ["faq-payroll", "faq-onboarding", "faq-remote"],
    seo: {
      title: "Payroll services for UK employers",
      description:
        "Monthly payroll processing, RTI submissions, payslips and auto-enrolment for UK employers. Book a free consultation.",
      canonicalPath: "/services/payroll",
    },
    displayOrder: 4,
    isActive: true,
  },
  {
    id: "svc-vat",
    slug: "vat",
    title: "VAT",
    summary: "VAT registration, returns and support.",
    icon: "chart",
    intro:
      "VAT is where small process problems turn into real money. We handle registration, choose the scheme that suits how you actually trade, and file your returns under Making Tax Digital.",
    includes: [
      "VAT registration and scheme selection",
      "Quarterly VAT returns filed under Making Tax Digital",
      "Flat Rate, Cash Accounting and Annual Accounting reviews",
      "Guidance on the registration threshold as you grow",
      "Support with HMRC VAT queries and inspections",
      "Advice on VAT treatment for unusual or cross-border sales",
    ],
    outcomes: [
      {
        problem: "It is unclear whether registration is required yet.",
        outcome:
          "We monitor your rolling turnover and tell you before it becomes urgent.",
      },
      {
        problem: "The wrong scheme is quietly costing money.",
        outcome:
          "We review which VAT scheme fits your margins and your customer base.",
      },
      {
        problem: "Returns are filed late or from incomplete records.",
        outcome:
          "Bookkeeping and VAT are handled together, so the return is built from reconciled data.",
      },
    ],
    faqIds: ["faq-vat-threshold", "faq-vat", "faq-deadlines"],
    seo: {
      title: "VAT accountants and VAT return services",
      description:
        "VAT registration, scheme advice and Making Tax Digital VAT returns for UK businesses. Book a free consultation.",
      canonicalPath: "/services/vat",
    },
    displayOrder: 5,
    isActive: true,
  },
  {
    id: "svc-business-advisory",
    slug: "business-advisory",
    title: "Business Advisory",
    summary:
      "Financial insight and practical advice to help you make better decisions.",
    icon: "compass",
    intro:
      "Compliance tells you what already happened. Advisory work is about what happens next: whether you can afford the hire, what the new pricing does to your margin, how much cash you will have in March.",
    includes: [
      "Monthly or quarterly management accounts",
      "Cash flow forecasting and scenario planning",
      "Pricing and margin analysis",
      "Budgeting and hiring affordability reviews",
      "Business structure reviews as you grow",
      "A regular call with the accountant who knows your numbers",
    ],
    outcomes: [
      {
        problem: "Decisions get made on gut feel and a bank balance.",
        outcome:
          "Management accounts give you a defensible basis for the call.",
      },
      {
        problem: "Cash gets tight without warning.",
        outcome:
          "A rolling forecast shows the pinch points far enough ahead to act.",
      },
      {
        problem: "Growth happens but profit does not follow.",
        outcome:
          "We break down margin by product, service or client so you can see where it goes.",
      },
    ],
    faqIds: ["faq-advisory", "faq-pricing", "faq-remote"],
    seo: {
      title: "Business advisory and management accounts",
      description:
        "Management accounts, cash flow forecasting and practical financial advice for growing UK businesses. Book a free consultation.",
      canonicalPath: "/services/business-advisory",
    },
    displayOrder: 6,
    isActive: true,
  },
].map((service) => ({ ...service, isDemo: true }) as Service);
