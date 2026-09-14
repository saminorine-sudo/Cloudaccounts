import type { Metadata } from "next";

/**
 * Shared chrome for everything under `/admin`, including the sign-in page.
 *
 * Deliberately does NOT gate. The gate lives in `(dashboard)/layout.tsx` for
 * display and in `lib/admin/data.ts` for access, because a signed-out visitor
 * has to be able to reach `/admin/login` to do anything about it.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  // Belt and braces alongside the Disallow in robots.ts. Neither is access
  // control — the gate is.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
