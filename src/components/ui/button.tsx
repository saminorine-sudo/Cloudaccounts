import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "onDarkGhost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-55 active:translate-y-px whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-card hover:bg-brand-800 hover:shadow-lift",
  secondary:
    "bg-white text-ink ring-1 ring-line shadow-card hover:ring-brand-300 hover:text-brand-800 hover:shadow-lift",
  ghost: "text-brand-700 hover:bg-brand-50 hover:text-brand-800",
  onDark: "bg-white text-brand-800 shadow-card hover:bg-brand-50",
  onDarkGhost:
    "text-white ring-1 ring-white/25 hover:bg-white/10 hover:ring-white/40",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Renders a trailing arrow. Decorative — hidden from assistive tech. */
  withArrow?: boolean;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  withArrow,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
      {withArrow ? <Icon name="arrow-right" className="h-4 w-4" /> : null}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  withArrow,
  children,
  ...props
}: CommonProps &
  Omit<React.ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
      {withArrow ? <Icon name="arrow-right" className="h-4 w-4" /> : null}
    </Link>
  );
}

/** Understated text link with an arrow — used as the tertiary action on cards. */
export function ArrowLink({
  href,
  children,
  className,
  tone = "brand",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  tone?: "brand" | "light";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/arrow inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
        tone === "brand"
          ? "text-brand-700 hover:text-brand-800"
          : "text-brand-200 hover:text-white",
        className,
      )}
    >
      {children}
      <Icon
        name="arrow-right"
        className="h-4 w-4 transition-transform duration-200 group-hover/arrow:translate-x-0.5"
      />
    </Link>
  );
}
