import Link from "next/link";

import { AdminNav } from "@/components/admin/nav";
import { Logo } from "@/components/layout/logo";
import { Icon } from "@/components/ui/icon";
import type { AdminAccess } from "@/lib/admin/access";

/**
 * Admin chrome: a persistent sidebar on desktop, a scrollable tab strip on
 * mobile. Deliberately plainer than the marketing site — this is a tool
 * people use all day, so it optimises for density and scanning rather than
 * persuasion.
 *
 * Navigation lists only what exists. Disabled links to unbuilt sections are
 * noise, and they make the product feel half-finished every time someone
 * clicks one.
 */

export function AdminShell({
  access,
  children,
}: {
  access: Extract<AdminAccess, { allowed: true }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      {/* Sidebar */}
      <div className="border-b border-line bg-white lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:px-6 lg:py-5">
          <span className="min-w-0">
            <Logo href="/admin" />
          </span>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-muted transition-colors hover:text-brand-700"
          >
            View site
            <Icon name="external" className="h-3 w-3" />
          </Link>
        </div>

        <AdminNav />

        <div className="hidden border-t border-line px-6 py-4 lg:block">
          <p className="text-xs font-medium text-ink">{access.actor.name}</p>
          <p className="mt-0.5 text-xs text-muted">
            {access.actor.role.replace("_", " ").toLowerCase()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-surface">
        {access.mode === "dev-preview" ? <PreviewBanner /> : null}
        <main id="admin-main" className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Unmissable on every admin screen. The preview has no sign-in behind it, so
 * it must never be mistaken for the real thing.
 */
function PreviewBanner() {
  return (
    <div className="flex items-start gap-2.5 border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-xs leading-relaxed text-amber-950 sm:px-8">
      <Icon name="warning" className="mt-px h-3.5 w-3.5 shrink-0 text-amber-700" />
      <p>
        <strong className="font-semibold">Development preview.</strong> Nobody
        is signed in — this area is open because{" "}
        <code className="font-mono">ADMIN_DEV_PREVIEW</code> is set and the
        build is not production. Data is held in memory and disappears when the
        server restarts.
      </p>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
