import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { denialMessages, type AdminDenialReason } from "@/lib/admin/access";

/**
 * Rendered instead of any admin screen when access is refused.
 *
 * Used by the layout AND by every page. The layout alone is not enough: a
 * layout that discards `children` still leaves the page component rendered
 * and serialized into the RSC payload, so the page has to refuse for itself
 * or its data ends up on the wire.
 *
 * States the reason plainly, because each one is a configuration problem for
 * the operator rather than something a stranger can exploit. It exposes no
 * data and offers no way in.
 */
export function AccessDenied({ reason }: { reason: AdminDenialReason }) {
  const message = denialMessages[reason];

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5 py-16">
      <div className="w-full max-w-md rounded-card bg-white p-8 text-center shadow-card ring-1 ring-line">
        <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon name="shield" className="h-5 w-5" />
        </span>

        <h1 className="mt-5 text-xl font-semibold text-ink">{message.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {message.body}
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Back to the website
        </Link>
      </div>
    </div>
  );
}
