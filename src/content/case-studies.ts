import type { CaseStudy } from "@/types/content";

/**
 * DEMO CASE STUDIES — ILLUSTRATIVE SCENARIOS, NOT REAL CLIENT RESULTS.
 *
 * These describe the kind of work an accountancy firm does. They are not
 * documented outcomes for real clients and must not be published as such.
 * The case study section renders a visible label while
 * `siteSettings.showDemoNotices` is true.
 *
 * Before launch: replace with documented engagements, with the client's
 * written permission, and keep the supporting figures on file.
 */
export const caseStudies: CaseStudy[] = [
  {
    id: "case-1",
    slug: "ecommerce-growth",
    title: "An e-commerce business that had outgrown its bookkeeping",
    sector: "E-commerce",
    headlineMetric: "£420k → £1.2m",
    headlineMetricLabel: "Annual turnover across the engagement",
    challenge:
      "The business was growing quickly but its bookkeeping process had not changed since it was one person and a spreadsheet. Stock, marketplace fees and returns were all being recorded inconsistently, so nobody could say which product lines were actually profitable.",
    solution:
      "We rebuilt the chart of accounts around how the business really trades, moved bookkeeping to a monthly cycle, and introduced management accounts that split revenue and margin by channel.",
    result:
      "The owner moved from an annual view of the business to a monthly one, with clear visibility of margin by channel and a cash flow forecast to plan stock purchasing against.",
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "case-2",
    slug: "professional-services-admin",
    title: "A professional services firm losing days to finance admin",
    sector: "Professional services",
    headlineMetric: "32%",
    headlineMetricLabel: "Reduction in accounting administration time",
    challenge:
      "Two directors were spending several days each month on invoicing, chasing payment, categorising expenses and preparing figures for their accountant — time that came directly out of billable work.",
    solution:
      "We took bookkeeping and payroll in house, set up automated receipt capture and bank feeds, and standardised the month-end pack so the same information arrives in the same format every month.",
    result:
      "Finance admin moved off the directors' desks. The monthly close now runs to a fixed timetable and the directors review a report rather than assembling one.",
    displayOrder: 2,
    isPublished: true,
  },
  {
    id: "case-3",
    slug: "consultancy-tax-planning",
    title: "A consultancy where planning happened too late in the year",
    sector: "Consultancy",
    headlineMetric: "£18,400",
    headlineMetricLabel: "Potential tax saving identified through planning",
    challenge:
      "Tax was only ever discussed after the year had ended, by which point the decisions that would have changed the outcome had already been made by default.",
    solution:
      "We moved the tax conversation to a mid-year review covering profit extraction, timing of expenditure, capital allowances and pension contributions, so the options were still open.",
    result:
      "The review identified a set of changes worth a meaningful amount over the year, and the planning call is now a fixed part of the annual cycle rather than an afterthought.",
    displayOrder: 3,
    isPublished: true,
  },
].map((study) => ({ ...study, isDemo: true }) as CaseStudy);
