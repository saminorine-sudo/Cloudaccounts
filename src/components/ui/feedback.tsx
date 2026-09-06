import { Icon, type UiIconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Alerts, empty states, loading states and the demo-content notice.
 *
 * Each carries an icon as well as colour, so state is never signalled by hue
 * alone, and messages are wired to the right live region.
 */

type AlertTone = "info" | "success" | "warning" | "error" | "demo";

const alertTones: Record<
  AlertTone,
  { wrapper: string; icon: UiIconName; iconClass: string }
> = {
  info: {
    wrapper: "bg-slate-50 ring-line text-ink-soft",
    icon: "info",
    iconClass: "text-slate-500",
  },
  success: {
    wrapper: "bg-brand-50 ring-brand-200 text-brand-900",
    icon: "check",
    iconClass: "text-brand-700",
  },
  warning: {
    wrapper: "bg-amber-50 ring-amber-200 text-amber-950",
    icon: "warning",
    iconClass: "text-amber-700",
  },
  error: {
    wrapper: "bg-red-50 ring-red-200 text-red-950",
    icon: "warning",
    iconClass: "text-red-700",
  },
  demo: {
    wrapper: "bg-amber-50/70 ring-amber-200/80 text-amber-950",
    icon: "info",
    iconClass: "text-amber-700",
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
  role,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  const config = alertTones[tone];

  return (
    <div
      role={role}
      className={cn(
        "flex gap-3 rounded-xl px-4 py-3.5 text-sm leading-relaxed ring-1",
        config.wrapper,
        className,
      )}
    >
      <Icon
        name={config.icon}
        className={cn("mt-0.5 h-4.5 w-4.5", config.iconClass)}
      />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? (
          <div className={cn(title && "mt-1", "[&_a]:underline")}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Marks unverified placeholder content.
 *
 * Rendered wherever demo statistics, reviews or case studies appear, so the
 * site never presents invented figures as verified fact. Controlled centrally
 * by `siteSettings.showDemoNotices`.
 */
export function DemoNotice({
  children,
  className,
  compact = false,
}: {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200",
          className,
        )}
      >
        <Icon name="info" className="h-3.5 w-3.5" />
        {children}
      </p>
    );
  }

  return (
    <Alert tone="demo" className={className}>
      {children}
    </Alert>
  );
}

export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
}: {
  icon?: UiIconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-white px-6 py-14 text-center",
        className,
      )}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** Skeleton block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-200/70", className)}
      aria-hidden="true"
    />
  );
}

/** Star rating. The numeric value is exposed to screen readers as text. */
export function Rating({
  value,
  max = 5,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <span className="sr-only">{`Rated ${value} out of ${max}`}</span>
      {Array.from({ length: max }, (_, index) => (
        <Icon
          key={index}
          name="star"
          strokeWidth={1.2}
          className={cn(
            "h-4 w-4",
            index < value
              ? "fill-brand-500 text-brand-600"
              : "fill-slate-100 text-slate-300",
          )}
        />
      ))}
    </div>
  );
}
