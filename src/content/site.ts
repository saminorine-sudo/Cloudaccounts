import type { SiteSettings } from "@/types/content";

/**
 * DEMO CONTENT — site-wide settings.
 *
 * Phone number, email and address below are placeholders. The phone number
 * uses Ofcom's 020 7946 09xx range, which is reserved for drama and examples
 * and can never be allocated to a real subscriber. The address is a
 * deliberately generic central-London placeholder and is labelled as such in
 * the UI. Replace all of this with verified business details before launch.
 */
export const siteSettings: SiteSettings = {
  name: "CloudAccounts",
  legalName: "CloudAccounts (demo)",
  tagline: "Accounting that helps your business move forward.",
  description:
    "Accounting, tax and business support for UK sole traders, contractors, limited companies and growing businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.cloudaccounts.example",
  locale: "en_GB",

  contact: {
    isDemo: true,
    phone: "020 7946 0958",
    phoneHref: "tel:+442079460958",
    email: "hello@cloudaccounts.example",
    addressLines: ["CloudAccounts", "27 Finsbury Square", "London"],
    postcode: "EC2A 1AA",
    addressNote:
      "Demo address. Replace with the firm's registered office before launch.",
    openingHours: [
      { label: "Monday to Thursday", hours: "9:00am – 5:30pm" },
      { label: "Friday", hours: "9:00am – 5:00pm" },
      { label: "Saturday and Sunday", hours: "Closed" },
    ],
    mapLat: 51.5215,
    mapLng: -0.0865,
  },

  socials: [
    { id: "linkedin", platform: "LinkedIn", url: "https://www.linkedin.com" },
    { id: "x", platform: "X", url: "https://x.com" },
  ],

  seo: {
    titleTemplate: "%s | CloudAccounts",
    defaultTitle: "CloudAccounts — Accountants for UK businesses",
    defaultDescription:
      "Accounting, tax, bookkeeping, VAT and payroll support for UK sole traders, contractors and limited companies. Book a free consultation.",
    twitterHandle: null,
  },

  /**
   * Controls the visible "demo content" notices. Keep this true for as long
   * as the site carries placeholder statistics, case studies and reviews.
   */
  showDemoNotices: true,
};

export const CONTACT_EMAIL = siteSettings.contact.email;
export const CONTACT_PHONE = siteSettings.contact.phone;
