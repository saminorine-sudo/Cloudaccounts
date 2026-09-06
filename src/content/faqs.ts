import type { Faq } from "@/types/content";

/**
 * DEMO CONTENT — FAQs.
 *
 * Answers describe general UK practice and are written to avoid stating tax
 * rates or deadlines that change. Where a figure or date is unavoidable, the
 * answer points the reader at the calculator or a consultation rather than
 * baking a number into prose that will silently go stale.
 */
export const faqs: Faq[] = [
  {
    id: "faq-pricing",
    question: "How much does an accountant cost?",
    answer:
      "It depends on the structure of your business, your turnover, how many transactions you have and which services you need. Our published plans start from a monthly fee for sole traders and rise for limited companies and businesses with payroll and management reporting. We quote in writing after a short consultation, so you know the number before you commit to anything.",
    category: "pricing",
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "faq-sole-traders",
    question: "Do you work with sole traders?",
    answer:
      "Yes. A large part of our client base is self-employed people and freelancers who want Self Assessment handled properly and a clear view of what they owe. We also give an honest answer on whether incorporating would benefit you, which sometimes means telling you it would not.",
    category: "services",
    displayOrder: 2,
    isPublished: true,
  },
  {
    id: "faq-corporation-tax",
    question: "Can you handle Corporation Tax?",
    answer:
      "Yes. We prepare the computation and the CT600 return, file it with HMRC alongside your statutory accounts, and tell you what to pay and by when. We also review the position during the year, while there is still time for planning to make a difference.",
    category: "services",
    displayOrder: 3,
    isPublished: true,
  },
  {
    id: "faq-vat",
    question: "Can you manage VAT?",
    answer:
      "Yes. We handle VAT registration, help you choose the scheme that fits how you trade, and file your quarterly returns under Making Tax Digital. If you are approaching the registration threshold we will flag it before it becomes urgent.",
    category: "services",
    displayOrder: 4,
    isPublished: true,
  },
  {
    id: "faq-vat-threshold",
    question: "When does my business need to register for VAT?",
    answer:
      "You must register when your VAT-taxable turnover over any rolling twelve-month period passes the registration threshold, or if you expect to pass it within the next thirty days on its own. The threshold is set by HMRC and can change at a Budget, so we monitor your rolling turnover rather than checking once a year. You can also register voluntarily below the threshold, which sometimes makes sense if your customers are VAT-registered.",
    category: "services",
    displayOrder: 5,
    isPublished: true,
  },
  {
    id: "faq-payroll",
    question: "Can you handle payroll?",
    answer:
      "Yes. We run weekly or monthly payroll, make the Real Time Information submissions to HMRC, distribute payslips, handle starters and leavers, and manage pension auto-enrolment submissions. You get a summary each period showing what is due to HMRC and when.",
    category: "services",
    displayOrder: 6,
    isPublished: true,
  },
  {
    id: "faq-switching",
    question: "Can you take over from my current accountant?",
    answer:
      "Yes, and it is more routine than most people expect. You tell your current accountant you are moving, we write to them for professional clearance and your records, and we take it from there. You do not need to have an awkward conversation about why, and you do not have to wait for a year end to move.",
    category: "switching",
    displayOrder: 7,
    isPublished: true,
  },
  {
    id: "faq-remote",
    question: "Do you work remotely?",
    answer:
      "Yes. Most of our work happens over video call, phone and email, and our clients are spread across the UK rather than clustered around one office. If you would rather meet in person we can arrange that, but nothing about the service depends on it.",
    category: "working-together",
    displayOrder: 8,
    isPublished: true,
  },
  {
    id: "faq-onboarding",
    question: "How does onboarding work?",
    answer:
      "We start with a consultation to understand your business and confirm what you need. You get a written quote. If you go ahead, we complete the identity checks required of accountancy firms, request records from your previous accountant if there is one, get you set up on the software, and agree the deadlines for the year ahead. Most clients are fully onboarded within a couple of weeks.",
    category: "working-together",
    displayOrder: 9,
    isPublished: true,
  },
  {
    id: "faq-consultation",
    question: "Can I book a free consultation?",
    answer:
      "Yes. The initial consultation is free and there is no obligation attached to it. It is a conversation about your business and what you need, not a sales call with a deadline on it. You can book a time directly through the website.",
    category: "general",
    displayOrder: 10,
    isPublished: true,
  },
  {
    id: "faq-software",
    question: "Which accounting software do you work with?",
    answer:
      "We work with the major UK cloud accounting platforms and will usually keep you on whatever you already use rather than forcing a migration. If you are not using anything yet, we will recommend something that fits the size and shape of your business.",
    category: "working-together",
    displayOrder: 11,
    isPublished: true,
  },
  {
    id: "faq-deadlines",
    question: "What happens if I miss a filing deadline?",
    answer:
      "Companies House and HMRC both charge automatic penalties for late filing, and these escalate the longer a filing is outstanding. Interest can also apply to tax paid late. We track your filing dates and remind you well ahead of each one, which is the entire point of having them tracked by somebody.",
    category: "general",
    displayOrder: 12,
    isPublished: true,
  },
  {
    id: "faq-advisory",
    question: "What is the difference between compliance and advisory work?",
    answer:
      "Compliance is the work that has to be done: accounts, tax returns, VAT, payroll. It describes what already happened. Advisory work is about what happens next — whether you can afford a hire, what a price change does to your margin, how much cash you will have in three months. Both matter, but only one of them changes the outcome.",
    category: "services",
    displayOrder: 13,
    isPublished: true,
  },
  {
    id: "faq-contract",
    question: "Am I tied into a long contract?",
    answer:
      "No. We work on a rolling monthly basis. If the service is not right for you, you can leave with a month's notice and we will pass your records on to whoever takes over.",
    category: "pricing",
    displayOrder: 14,
    isPublished: true,
  },
].map((faq) => ({ ...faq, isDemo: true }) as Faq);
