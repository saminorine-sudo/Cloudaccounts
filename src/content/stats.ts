import type { SiteStat } from "@/types/content";

/**
 * DEMO STATISTICS — NOT VERIFIED.
 *
 * Every figure below is fictional placeholder content created for
 * development. None of it has been verified against CloudAccounts' records
 * and none of it may be presented as fact.
 *
 * Because unverifiable trust claims are the single most damaging thing a
 * professional-services site can get wrong, the homepage renders a visible
 * "illustrative demo figures" label alongside these while
 * `siteSettings.showDemoNotices` is true. Replace with verified numbers and
 * set that flag to false before launch.
 */
export const siteStats: SiteStat[] = [
  {
    id: "stat-experience",
    value: "15+",
    label: "Years of experience",
    note: null,
    displayOrder: 1,
  },
  {
    id: "stat-businesses",
    value: "1,200+",
    label: "Businesses supported",
    note: null,
    displayOrder: 2,
  },
  {
    id: "stat-turnover",
    value: "£250M+",
    label: "Client turnover supported",
    note: null,
    displayOrder: 3,
  },
  {
    id: "stat-retention",
    value: "98%",
    label: "Client retention",
    note: null,
    displayOrder: 4,
  },
  {
    id: "stat-rating",
    value: "4.9/5",
    label: "Average client rating",
    note: null,
    displayOrder: 5,
  },
].map((stat) => ({ ...stat, isDemo: true }) as SiteStat);
