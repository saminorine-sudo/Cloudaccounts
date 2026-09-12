/**
 * Form option lists and field names — plain data, no dependencies.
 *
 * Kept apart from `schemas.ts` on purpose. The client form components need
 * these lists to render selects and checkboxes, but they do no validation of
 * their own: every submission is checked on the server, which is the only
 * place that decides anything.
 *
 * Importing them from `schemas.ts` pulled Zod into the browser bundle — and
 * because Next shares a chunk across a route segment, every marketing page
 * paid for it, including pages with no form at all. That was ~86KB
 * compressed on the homepage for a library it never used.
 *
 * `schemas.ts` re-exports everything here, so server code can keep importing
 * from one place. Client components must import from THIS module.
 */

export const businessTypes = [
  { value: "sole-trader", label: "Sole trader" },
  { value: "contractor", label: "Contractor" },
  { value: "limited-company", label: "Limited company" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
] as const;

export const turnoverBands = [
  { value: "under-50k", label: "Under £50k" },
  { value: "50k-100k", label: "£50k–£100k" },
  { value: "100k-250k", label: "£100k–£250k" },
  { value: "250k-500k", label: "£250k–£500k" },
  { value: "500k-plus", label: "£500k+" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

export const serviceOptions = [
  { value: "accounting", label: "Accounting" },
  { value: "tax", label: "Tax" },
  { value: "bookkeeping", label: "Bookkeeping" },
  { value: "payroll", label: "Payroll" },
  { value: "vat", label: "VAT" },
  { value: "business-advisory", label: "Business advisory" },
  { value: "other", label: "Other" },
] as const;

export const contactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "either", label: "Either" },
] as const;

/**
 * Honeypot field name. Real users never see or fill this field; bots fill
 * everything. A submission with content here is answered with a success
 * response and silently discarded, so the bot gets no signal to adapt.
 */
export const honeypotField = "company_website";
