import type { TeamMember } from "@/types/content";

/**
 * DEMO TEAM — placeholder people.
 *
 * IMPORTANT: `qualifications` and `memberships` are deliberately EMPTY.
 *
 * Accountancy qualifications (ACA, ACCA, CTA, AAT) and professional body
 * memberships are regulated claims. Inventing them would be a false statement
 * about a regulated profession, so the seed data leaves them blank and the
 * team page simply omits the section when the arrays are empty. Populate them
 * only with credentials the firm has verified.
 */
export const teamMembers: TeamMember[] = [
  {
    id: "team-1",
    slug: "elena-marsh",
    name: "Elena Marsh",
    role: "Founder & Managing Director",
    bio: "Elena started CloudAccounts after a decade in practice, frustrated by how often clients received technically correct accounts that nobody had bothered to explain. She leads the firm's advisory work and still takes on a small portfolio of clients directly.",
    qualifications: [],
    memberships: [],
    focus: ["Business advisory", "Company structure", "Growth planning"],
    email: null,
    linkedinUrl: null,
    photoUrl: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "team-2",
    slug: "marcus-webb",
    name: "Marcus Webb",
    role: "Head of Tax",
    bio: "Marcus looks after Corporation Tax and personal tax planning across the client base. He spends most of his time on the conversations that happen before a year end rather than the filings that follow it.",
    qualifications: [],
    memberships: [],
    focus: ["Corporation Tax", "Self Assessment", "Profit extraction"],
    email: null,
    linkedinUrl: null,
    photoUrl: null,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "team-3",
    slug: "hannah-obrien",
    name: "Hannah O'Brien",
    role: "Client Services Manager",
    bio: "Hannah runs onboarding and is the person most clients speak to first. She handles the handover from a previous accountant, which is usually the part people expect to be difficult.",
    qualifications: [],
    memberships: [],
    focus: ["Onboarding", "Client support", "Practice operations"],
    email: null,
    linkedinUrl: null,
    photoUrl: null,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "team-4",
    slug: "raj-patel",
    name: "Raj Patel",
    role: "Senior Accountant",
    bio: "Raj manages a portfolio of limited companies and contractors, covering year-end accounts, VAT and payroll. He is the named contact for a large share of the firm's contractor clients.",
    qualifications: [],
    memberships: [],
    focus: ["Limited companies", "VAT", "Contractors"],
    email: null,
    linkedinUrl: null,
    photoUrl: null,
    displayOrder: 4,
    isActive: true,
  },
  {
    id: "team-5",
    slug: "sofia-lindqvist",
    name: "Sofia Lindqvist",
    role: "Bookkeeping Lead",
    bio: "Sofia leads the bookkeeping team and owns the month-end process. She is responsible for making sure the data every other service depends on is reconciled and current.",
    qualifications: [],
    memberships: [],
    focus: ["Bookkeeping", "Month-end reporting", "Accounting software"],
    email: null,
    linkedinUrl: null,
    photoUrl: null,
    displayOrder: 5,
    isActive: true,
  },
  {
    id: "team-6",
    slug: "george-adeyemi",
    name: "George Adeyemi",
    role: "Payroll Manager",
    bio: "George runs payroll for the firm's employer clients, from single-director companies through to teams of fifty, including RTI submissions and pension auto-enrolment.",
    qualifications: [],
    memberships: [],
    focus: ["Payroll", "Auto-enrolment", "Employer compliance"],
    email: null,
    linkedinUrl: null,
    photoUrl: null,
    displayOrder: 6,
    isActive: true,
  },
].map((member) => ({ ...member, isDemo: true }) as TeamMember);
