import type { ConsultationType, Guide } from "@/types/content";

/**
 * DEMO CONTENT — downloadable-style guides rendered as pages.
 */
export const guides: Guide[] = [
  {
    id: "guide-new-company",
    slug: "starting-a-limited-company",
    title: "Starting a limited company",
    summary:
      "The setup steps that matter in the first month, in the order they need doing.",
    format: "Checklist",
    audience: "New company directors",
    updatedAt: "2026-08-12",
    sections: [
      {
        heading: "Before you incorporate",
        points: [
          "Check the name is available and not too close to an existing registered company or trade mark.",
          "Decide the share structure now — splitting shares later can have tax consequences.",
          "Choose an accounting reference date; the default is the anniversary of the month you incorporate.",
          "Confirm a registered office address that you are entitled to use.",
        ],
      },
      {
        heading: "In the first fortnight",
        points: [
          "Open a business bank account in the company's name and keep it strictly separate from personal money.",
          "Register for Corporation Tax with HMRC.",
          "Register as an employer if you will run payroll, including for a single director.",
          "Set up accounting software before transactions start, not after.",
        ],
      },
      {
        heading: "Before the first quarter ends",
        points: [
          "Decide whether VAT registration is needed or worthwhile.",
          "Agree how you will pay yourself and document it properly.",
          "Put dividend paperwork in place — board minutes and vouchers, not just a bank transfer.",
          "Diary the filing dates for accounts, Corporation Tax and the confirmation statement.",
        ],
      },
      {
        heading: "Habits worth forming immediately",
        points: [
          "Photograph receipts at the point of purchase rather than collecting them.",
          "Reconcile the bank monthly.",
          "Keep a separate account for tax and move money into it as you invoice.",
          "Ask before you make a decision with a tax consequence, not after.",
        ],
      },
    ],
    seo: {
      title: "Starting a limited company: setup checklist",
      description:
        "A practical checklist for new UK limited company directors covering incorporation, registrations, banking and the habits that make year one easier.",
      canonicalPath: "/resources/guides/starting-a-limited-company",
    },
    isDemo: true,
  },
  {
    id: "guide-switching",
    slug: "switching-accountants",
    title: "Switching accountants",
    summary:
      "What actually happens when you move, and why it is less disruptive than people expect.",
    format: "Explainer",
    audience: "Anyone considering a move",
    updatedAt: "2026-07-30",
    sections: [
      {
        heading: "You do not have to wait for a year end",
        points: [
          "You can move at any point in the year; mid-year transfers are routine.",
          "Work already in progress is handed over rather than repeated.",
          "There is no requirement to explain your reasons to anyone.",
        ],
      },
      {
        heading: "The process",
        points: [
          "You notify your existing accountant that you are moving.",
          "Your new firm writes to them requesting professional clearance and your records.",
          "The existing firm confirms there is no professional reason not to act, and passes over the information.",
          "Your new firm completes the identity and anti-money-laundering checks required of accountancy firms.",
          "Software access and authorisations with HMRC are transferred.",
        ],
      },
      {
        heading: "What to have ready",
        points: [
          "Your company registration number and UTR.",
          "Access to your accounting software, if you use it.",
          "The most recent set of accounts and tax return.",
          "Details of any outstanding filings or open HMRC correspondence.",
        ],
      },
      {
        heading: "What can slow it down",
        points: [
          "An outstanding fee with the previous firm — settle it, as clearance can be delayed.",
          "Records that were never digitised.",
          "Filings already overdue, which usually need dealing with first.",
        ],
      },
    ],
    seo: {
      title: "Switching accountants: how it works",
      description:
        "How to change accountants in the UK: professional clearance, transferring records and authorisations, and what can slow the process down.",
      canonicalPath: "/resources/guides/switching-accountants",
    },
    isDemo: true,
  },
  {
    id: "guide-record-keeping",
    slug: "record-keeping-for-small-businesses",
    title: "Record keeping for small businesses",
    summary:
      "What to keep, how long to keep it, and the setup that makes it take minutes a week.",
    format: "Checklist",
    audience: "Sole traders and small companies",
    updatedAt: "2026-07-15",
    sections: [
      {
        heading: "What you need to keep",
        points: [
          "All sales invoices raised and all purchase invoices and receipts.",
          "Bank and credit card statements for every business account.",
          "Records of anything taken out of the business for personal use.",
          "Payroll records if you employ anyone, including yourself as a director.",
          "VAT records if registered, kept digitally under Making Tax Digital.",
        ],
      },
      {
        heading: "How long to keep it",
        points: [
          "Retention periods differ between company records and self-employment records, and VAT has its own requirement.",
          "HMRC publishes the current periods — check them rather than assuming a single number covers everything.",
          "Digital copies are generally acceptable, which makes long retention far easier.",
        ],
      },
      {
        heading: "A setup that works",
        points: [
          "One bank account used exclusively for the business.",
          "Receipt capture on your phone, used at the till rather than later.",
          "Bank feeds into accounting software so transactions arrive automatically.",
          "A fixed monthly slot to reconcile and review.",
        ],
      },
      {
        heading: "The common failures",
        points: [
          "Mixing personal and business spending in one account.",
          "Keeping receipts as paper in a box.",
          "Recording a transfer between your own accounts as income.",
          "Leaving everything until the filing deadline.",
        ],
      },
    ],
    seo: {
      title: "Record keeping for small businesses",
      description:
        "What records a UK small business must keep, how long to keep them, and a practical setup that takes minutes a week.",
      canonicalPath: "/resources/guides/record-keeping-for-small-businesses",
    },
    isDemo: true,
  },
];

/**
 * DEMO CONTENT — consultation types offered on /book-consultation.
 *
 * Availability here is a simple weekday and slot list. When a real booking
 * provider is connected, this becomes the fallback and live availability is
 * fetched from the provider instead (see `src/lib/booking/availability.ts`).
 */
export const consultationTypes: ConsultationType[] = [
  {
    id: "consult-intro",
    slug: "free-consultation",
    name: "Free Consultation",
    description:
      "A no-obligation conversation about your business and what you need. We will tell you what we would do and what it would cost.",
    durationMinutes: 30,
    mode: "Video call",
    priceLabel: "Free",
    availableWeekdays: [1, 2, 3, 4, 5],
    slotTimes: [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ],
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "consult-tax-review",
    slug: "tax-planning-review",
    name: "Tax Planning Review",
    description:
      "A focused session on your tax position — profit extraction, timing and allowances — before your year end rather than after it.",
    durationMinutes: 45,
    mode: "Video call",
    priceLabel: "Free for clients",
    availableWeekdays: [2, 3, 4],
    slotTimes: ["10:00", "11:00", "14:00", "15:00", "16:00"],
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "consult-switching",
    slug: "switching-accountants",
    name: "Switching Accountants",
    description:
      "A short call covering how a move would work for your business, what we would need, and the timeline.",
    durationMinutes: 20,
    mode: "Telephone",
    priceLabel: "Free",
    availableWeekdays: [1, 2, 3, 4, 5],
    slotTimes: [
      "09:00",
      "09:30",
      "10:00",
      "12:00",
      "12:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
    ],
    displayOrder: 3,
    isActive: true,
  },
].map((type) => ({ ...type, isDemo: true }) as ConsultationType);
