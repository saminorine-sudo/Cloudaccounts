import type { Audience } from "@/types/content";

/**
 * DEMO CONTENT — customer segments.
 */
export const audiences: Audience[] = [
  {
    id: "aud-sole-traders",
    slug: "sole-traders",
    title: "Sole Traders",
    summary: "Simple accounting and Self Assessment support.",
    icon: "briefcase",
    intro:
      "Working for yourself should not mean spending January reconstructing a year of receipts. We keep sole trader accounting deliberately simple: know what you owe, know when it is due, and get on with the work.",
    challenges: [
      "Self Assessment left until the last few weeks of January",
      "Uncertainty about which expenses are genuinely allowable",
      "No idea how much to set aside for the tax bill",
      "Wondering whether a limited company would be better",
    ],
    support: [
      {
        title: "Self Assessment, prepared properly",
        body: "We prepare and file your return, and we ask about the things people usually forget — use of home, mileage, equipment, pension contributions.",
      },
      {
        title: "A tax number you can plan around",
        body: "You get an estimate through the year rather than a bill in January, so the money is already set aside when it falls due.",
      },
      {
        title: "An honest answer on incorporating",
        body: "Sometimes a limited company saves money and sometimes it just adds admin. We will tell you which one your numbers point to.",
      },
    ],
    recommendedServiceSlugs: ["accounting", "bookkeeping", "vat"],
    recommendedPlanSlug: "sole-trader",
    seo: {
      title: "Accountants for sole traders",
      description:
        "Self Assessment, bookkeeping and tax support for UK sole traders. Know what you owe and when. Book a free consultation.",
      canonicalPath: "/who-we-help/sole-traders",
    },
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "aud-contractors",
    slug: "contractors",
    title: "Contractors",
    summary: "Tax-efficient accounting for contractors and freelancers.",
    icon: "clock",
    intro:
      "Contracting through your own limited company brings a set of decisions most employees never face: how to pay yourself, what to do between contracts, and how to handle the status of each engagement.",
    challenges: [
      "Getting the salary and dividend split right",
      "Understanding how off-payroll working rules affect an engagement",
      "Managing income that arrives unevenly across the year",
      "Keeping company admin from eating into billable time",
    ],
    support: [
      {
        title: "Salary and dividend planning",
        body: "We model the split each year against current rates and thresholds, and revisit it when your income or the rules change.",
      },
      {
        title: "Straightforward company admin",
        body: "Accounts, Corporation Tax, confirmation statement and your Self Assessment handled on a schedule you do not have to track.",
      },
      {
        title: "A view across the whole year",
        body: "Contract income rarely arrives evenly. We plan around the gaps rather than reacting to them.",
      },
    ],
    recommendedServiceSlugs: ["accounting", "tax", "bookkeeping"],
    recommendedPlanSlug: "limited-company",
    seo: {
      title: "Contractor accountants",
      description:
        "Limited company accounting, Corporation Tax and salary and dividend planning for UK contractors and freelancers. Book a free consultation.",
      canonicalPath: "/who-we-help/contractors",
    },
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "aud-limited-companies",
    slug: "limited-companies",
    title: "Limited Companies",
    summary: "Complete accounting, tax and compliance support.",
    icon: "shield",
    intro:
      "A limited company carries filing obligations to both Companies House and HMRC, on different deadlines, with different consequences for missing them. We take the whole calendar off your desk.",
    challenges: [
      "Multiple filing deadlines across the year, each with its own penalty",
      "Director responsibilities that are easy to overlook",
      "Deciding how to extract profit tax-efficiently",
      "Records spread across software, spreadsheets and email",
    ],
    support: [
      {
        title: "One compliance calendar",
        body: "Accounts, Corporation Tax, confirmation statement, VAT and payroll tracked together, with reminders ahead of each deadline.",
      },
      {
        title: "Profit extraction reviewed each year",
        body: "Salary, dividends, pension contributions and timing looked at as one decision rather than four separate ones.",
      },
      {
        title: "A named accountant",
        body: "You deal with the same person each time, and they already know how your company works.",
      },
    ],
    recommendedServiceSlugs: ["accounting", "tax", "payroll", "vat"],
    recommendedPlanSlug: "limited-company",
    seo: {
      title: "Limited company accountants",
      description:
        "Year-end accounts, Corporation Tax, VAT and payroll for UK limited companies. One compliance calendar, one named accountant.",
      canonicalPath: "/who-we-help/limited-companies",
    },
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "aud-small-businesses",
    slug: "small-businesses",
    title: "Growing Businesses",
    summary:
      "Management accounts, bookkeeping, payroll and strategic financial support.",
    icon: "spark",
    intro:
      "Once there are staff, stock or several revenue lines, annual accounts stop being enough to run on. This is the point where most businesses need monthly numbers and someone to interpret them.",
    challenges: [
      "Growth that does not translate into profit",
      "Cash flow that tightens without warning",
      "Payroll and VAT obligations arriving at the same time",
      "Not knowing whether the next hire is affordable",
    ],
    support: [
      {
        title: "Monthly management accounts",
        body: "Profitability, margin and cash reported monthly, with a short commentary on what actually moved and why.",
      },
      {
        title: "Cash flow forecasting",
        body: "A rolling forecast so you see pressure points months out rather than the week they arrive.",
      },
      {
        title: "The full compliance stack",
        body: "Bookkeeping, VAT, payroll, accounts and Corporation Tax handled by one team that shares the same records.",
      },
    ],
    recommendedServiceSlugs: [
      "bookkeeping",
      "payroll",
      "vat",
      "business-advisory",
    ],
    recommendedPlanSlug: "growing-business",
    seo: {
      title: "Accountants for growing small businesses",
      description:
        "Management accounts, bookkeeping, payroll, VAT and advisory support for growing UK businesses. Book a free consultation.",
      canonicalPath: "/who-we-help/small-businesses",
    },
    displayOrder: 4,
    isActive: true,
  },
].map((audience) => ({ ...audience, isDemo: true }) as Audience);
