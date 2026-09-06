/**
 * Site navigation.
 *
 * Single source of truth for the header, mobile menu, footer and sitemap, so
 * a new page cannot be added to one and forgotten in the others.
 */

export type NavChild = {
  label: string;
  href: string;
  description: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const primaryNav: NavItem[] = [
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "Accounting",
        href: "/services/accounting",
        description: "Year-end accounts and ongoing support",
      },
      {
        label: "Corporation Tax",
        href: "/services/tax",
        description: "Returns, computations and planning",
      },
      {
        label: "Bookkeeping",
        href: "/services/bookkeeping",
        description: "Records kept current, month by month",
      },
      {
        label: "VAT",
        href: "/services/vat",
        description: "Registration, schemes and returns",
      },
      {
        label: "Payroll",
        href: "/services/payroll",
        description: "Processing, RTI and auto-enrolment",
      },
      {
        label: "Business Advisory",
        href: "/services/business-advisory",
        description: "Management accounts and forecasting",
      },
    ],
  },
  {
    label: "Who We Help",
    href: "/who-we-help",
    children: [
      {
        label: "Sole Traders",
        href: "/who-we-help/sole-traders",
        description: "Self Assessment and simple accounting",
      },
      {
        label: "Contractors",
        href: "/who-we-help/contractors",
        description: "Limited company and profit extraction",
      },
      {
        label: "Limited Companies",
        href: "/who-we-help/limited-companies",
        description: "Full compliance and tax support",
      },
      {
        label: "Growing Businesses",
        href: "/who-we-help/small-businesses",
        description: "Management accounts and advisory",
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      {
        label: "Blog",
        href: "/resources/blog",
        description: "Articles on tax, accounting and business",
      },
      {
        label: "Guides",
        href: "/resources/guides",
        description: "Practical checklists and explainers",
      },
      {
        label: "Calculators",
        href: "/resources/calculators",
        description: "Corporation Tax, VAT and take-home estimates",
      },
    ],
  },
];

export const footerNav: { title: string; links: { label: string; href: string }[] }[] =
  [
    {
      title: "Services",
      links: [
        { label: "Accounting", href: "/services/accounting" },
        { label: "Corporation Tax", href: "/services/tax" },
        { label: "Bookkeeping", href: "/services/bookkeeping" },
        { label: "VAT", href: "/services/vat" },
        { label: "Payroll", href: "/services/payroll" },
        { label: "Business Advisory", href: "/services/business-advisory" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Team", href: "/team" },
        { label: "Who We Help", href: "/who-we-help" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "/resources/blog" },
        { label: "Guides", href: "/resources/guides" },
        { label: "Calculators", href: "/resources/calculators" },
        { label: "Book a consultation", href: "/book-consultation" },
      ],
    },
  ];

export const legalNav = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Terms", href: "/terms" },
];

/** Paths included in the generated sitemap, with their relative priority. */
export const staticSitemapPaths: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/who-we-help", priority: 0.8 },
  { path: "/pricing", priority: 0.9 },
  { path: "/about", priority: 0.7 },
  { path: "/team", priority: 0.6 },
  { path: "/resources", priority: 0.6 },
  { path: "/resources/blog", priority: 0.7 },
  { path: "/resources/guides", priority: 0.6 },
  { path: "/resources/calculators", priority: 0.7 },
  { path: "/contact", priority: 0.8 },
  { path: "/book-consultation", priority: 0.9 },
  { path: "/privacy-policy", priority: 0.2 },
  { path: "/cookie-policy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];
