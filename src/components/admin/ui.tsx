import Link from "next/link";

import { Icon, type UiIconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { AppointmentStatus, LeadStatus } from "@/lib/server/submissions";

/** Shared admin building blocks: stat tiles, tables and status pills. */

export function StatCard({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string;
  detail?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-ink tabular-nums">
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-muted">{detail}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group rounded-card bg-white p-5 shadow-card ring-1 ring-line transition-[box-shadow,border-color] hover:shadow-lift hover:ring-brand-200"
      >
        {body}
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-700">
          View
          <Icon
            name="arrow-right"
            className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    );
  }

  return (
    <div className="rounded-card bg-white p-5 shadow-card ring-1 ring-line">
      {body}
    </div>
  );
}

/**
 * Table wrapper. The horizontal scroll lives on this container rather than
 * the page, so a wide table never makes the whole layout scroll sideways on
 * a phone.
 */
export function AdminTable({
  headers,
  children,
  caption,
  density = "wide",
}: {
  headers: string[];
  children: React.ReactNode;
  caption?: string;
  /**
   * `wide` suits a full-width table with many columns. `compact` is for the
   * dashboard's side-by-side panels, where a 44rem minimum would leave the
   * last column permanently scrolled out of sight.
   */
  density?: "wide" | "compact";
}) {
  return (
    <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-collapse text-sm",
            density === "wide" ? "min-w-[44rem]" : "min-w-[22rem]",
          )}
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-line bg-surface/60">
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminTableRow({ children }: { children: React.ReactNode }) {
  return <tr className="transition-colors hover:bg-surface/60">{children}</tr>;
}

export function Cell({
  children,
  className,
  muted = false,
}: {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        muted ? "text-muted" : "text-ink-soft",
        className,
      )}
    >
      {children}
    </td>
  );
}

/**
 * Status pill. Each status carries an icon as well as a colour so the state
 * is never communicated by hue alone.
 */
const leadStatusStyles: Record<
  LeadStatus,
  { className: string; icon: UiIconName }
> = {
  NEW: { className: "bg-brand-50 text-brand-800 ring-brand-200", icon: "spark" },
  CONTACTED: {
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: "phone",
  },
  CONSULTATION_BOOKED: {
    className: "bg-blue-50 text-blue-900 ring-blue-200",
    icon: "calendar",
  },
  PROPOSAL_SENT: {
    className: "bg-amber-50 text-amber-900 ring-amber-200",
    icon: "receipt",
  },
  WON: {
    className: "bg-brand-700 text-white ring-brand-700",
    icon: "check",
  },
  LOST: { className: "bg-slate-50 text-muted ring-line", icon: "close" },
};

const appointmentStatusStyles: Record<
  AppointmentStatus,
  { className: string; icon: UiIconName }
> = {
  PENDING: {
    className: "bg-amber-50 text-amber-900 ring-amber-200",
    icon: "clock",
  },
  CONFIRMED: {
    className: "bg-brand-50 text-brand-800 ring-brand-200",
    icon: "check",
  },
  COMPLETED: {
    className: "bg-brand-700 text-white ring-brand-700",
    icon: "check",
  },
  CANCELLED: { className: "bg-slate-50 text-muted ring-line", icon: "close" },
  NO_SHOW: {
    className: "bg-red-50 text-red-900 ring-red-200",
    icon: "warning",
  },
};

export function StatusPill({
  label,
  status,
  kind,
}: {
  label: string;
  status: LeadStatus | AppointmentStatus;
  kind: "lead" | "appointment";
}) {
  const style =
    kind === "lead"
      ? leadStatusStyles[status as LeadStatus]
      : appointmentStatusStyles[status as AppointmentStatus];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        style.className,
      )}
    >
      <Icon name={style.icon} className="h-3 w-3" />
      {label}
    </span>
  );
}

export function AdminEmptyState({
  title,
  description,
  icon = "search",
}: {
  title: string;
  description: string;
  icon?: UiIconName;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Icon name={icon} className="h-4.5 w-4.5" />
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}

/** Definition row used on the lead detail page. */
export function DetailRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
        {term}
      </dt>
      <dd className="text-sm text-ink-soft">{children}</dd>
    </div>
  );
}
