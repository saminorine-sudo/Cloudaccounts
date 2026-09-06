import { cn } from "@/lib/utils";

/** Page gutter. One max width across the site keeps the rhythm consistent. */
export function Container({
  className,
  children,
  size = "default",
}: {
  className?: string;
  children: React.ReactNode;
  size?: "default" | "narrow" | "wide";
}) {
  const widths = {
    narrow: "max-w-3xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  } as const;

  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        widths[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Vertical rhythm. `tone` sets the section's ground colour. */
export function Section({
  className,
  children,
  tone = "surface",
  spacing = "default",
  id,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "surface" | "white" | "mint" | "dark";
  spacing?: "tight" | "default" | "loose";
  id?: string;
} & React.HTMLAttributes<HTMLElement>) {
  const tones = {
    surface: "bg-surface",
    white: "bg-white",
    mint: "bg-brand-50",
    dark: "bg-brand-800 text-white",
  } as const;

  const spacings = {
    tight: "py-12 sm:py-16",
    default: "py-16 sm:py-20 lg:py-24",
    loose: "py-20 sm:py-28 lg:py-32",
  } as const;

  return (
    <section
      id={id}
      className={cn(tones[tone], spacings[spacing], className)}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * Section heading block: eyebrow, title, lead paragraph.
 *
 * The eyebrow is rendered as a `<p>` rather than a heading so it never
 * disrupts the document outline.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "light",
  as: Tag = "h2",
  className,
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto max-w-2xl text-center items-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.14em]",
            tone === "dark" ? "text-brand-300" : "text-brand-700",
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <Tag
        id={id}
        className={cn(
          Tag === "h1" ? "text-display-lg" : "text-display-md",
          tone === "dark" && "text-white",
        )}
      >
        {title}
      </Tag>

      {lead ? (
        <p
          className={cn(
            "max-w-2xl text-lg leading-relaxed",
            tone === "dark" ? "text-brand-100/85" : "text-muted",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export function Card({
  className,
  children,
  interactive = false,
  tone = "white",
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
  tone?: "white" | "mint" | "dark" | "outline";
} & React.HTMLAttributes<HTMLDivElement>) {
  const tones = {
    white: "bg-white ring-1 ring-line shadow-card",
    mint: "bg-brand-50 ring-1 ring-brand-100",
    dark: "bg-brand-900 text-white ring-1 ring-white/10",
    outline: "bg-transparent ring-1 ring-line",
  } as const;

  return (
    <div
      className={cn(
        "rounded-card",
        tones[tone],
        interactive &&
          "transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "mint",
  className,
}: {
  children: React.ReactNode;
  tone?: "mint" | "neutral" | "dark" | "amber";
  className?: string;
}) {
  const tones = {
    mint: "bg-brand-50 text-brand-800 ring-brand-200",
    neutral: "bg-slate-50 text-ink-soft ring-line",
    dark: "bg-white/10 text-brand-100 ring-white/15",
    amber: "bg-amber-50 text-amber-900 ring-amber-200",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Thin decorative rule with a green tick — a small brand signature. */
export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-line" />
      <span className="h-1.5 w-1.5 rotate-45 bg-brand-500" />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
