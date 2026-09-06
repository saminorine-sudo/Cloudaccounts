import type { IconName } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * A small, hand-built icon set.
 *
 * Drawn on a consistent 24px grid with a single 1.6 stroke weight so the
 * icons read as one family. This is deliberately not a general-purpose icon
 * library: a fixed set that all matches looks considered, whereas mixed
 * weights and styles from a large pack is one of the clearest tells of a
 * template.
 */

export type UiIconName =
  | IconName
  | "arrow-right"
  | "arrow-up-right"
  | "check"
  | "chevron-down"
  | "menu"
  | "close"
  | "phone"
  | "mail"
  | "pin"
  | "star"
  | "quote"
  | "calendar"
  | "calculator"
  | "info"
  | "warning"
  | "search"
  | "external"
  | "linkedin"
  | "x";

const paths: Record<UiIconName, React.ReactNode> = {
  /* Service and benefit icons */
  ledger: (
    <>
      <path d="M5 4.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a1 1 0 0 1-1-1V4.5Z" />
      <path d="M5 4.5h-.5a1.5 1.5 0 0 0 0 3H5" />
      <path d="M9 9.5h5M9 13h5M9 16.5h3" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5v17l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4v-17l-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4L6 3.5Z" />
      <path d="M10 9.5h4M10 13.5h4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V7M17 20v-9" />
    </>
  ),
  percent: (
    <>
      <path d="m6 18 12-12" />
      <circle cx="7.75" cy="7.75" r="2.25" />
      <circle cx="16.25" cy="16.25" r="2.25" />
    </>
  ),
  people: (
    <>
      <circle cx="9.5" cy="8" r="3" />
      <path d="M3.5 19.5a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.9" />
      <path d="M17.5 14.2a6 6 0 0 1 3 5.3" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-1.7 4.3L9 15l1.7-4.3L15 9Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 5 6v6c0 4 3 7.4 7 8.8 4-1.4 7-4.8 7-8.8V6l-7-2.8Z" />
      <path d="m9.3 12 1.9 1.9 3.5-3.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.5 13.8 9 19 10.8 13.8 12.6 12 18l-1.8-5.4L5 10.8 10.2 9 12 3.5Z" />
      <path d="M18.5 16.5 19.2 18.6 21.3 19.3 19.2 20 18.5 22.1 17.8 20 15.7 19.3 17.8 18.6 18.5 16.5Z" />
    </>
  ),
  handshake: (
    <>
      <path d="m3.5 12.5 3-3 3.2 2.4a2 2 0 0 0 2.6-.2l1.9-1.8" />
      <path d="m11 8 3-2.2 6.5 5.2-3.6 4.4-2.2-1.9" />
      <path d="m9.5 14 2 1.8M12 12l2.5 2.2M7.5 16.2l1.6 1.4" />
    </>
  ),
  tag: (
    <>
      <path d="M11.6 3.5H20v8.4l-8.5 8.5a1.5 1.5 0 0 1-2.1 0l-6.3-6.3a1.5 1.5 0 0 1 0-2.1l8.5-8.5Z" />
      <circle cx="16" cy="8" r="1.4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3.5 12.5h17" />
    </>
  ),

  /* UI icons */
  "arrow-right": (
    <>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </>
  ),
  "arrow-up-right": (
    <>
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  "chevron-down": <path d="m6 9.5 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  phone: (
    <path d="M8.4 3.8 10 7.3l-1.9 1.6a11.5 11.5 0 0 0 5 5L14.7 12l3.5 1.6v3.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4h3.4Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.6 7 7.3 5.2a2 2 0 0 0 2.2 0L20.4 7" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c4-4.4 6-7.7 6-10.3A6 6 0 0 0 6 10.7C6 13.3 8 16.6 12 21Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  star: (
    <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
  ),
  quote: (
    <path d="M9.5 6.5C6.8 7.8 5.2 10.2 5.2 13c0 2.6 1.5 4.5 3.7 4.5 1.9 0 3.3-1.4 3.3-3.3 0-1.8-1.3-3.1-3-3.1h-.5c.2-1.3 1-2.4 2.3-3.2l-1.5-1.4Zm8.3 0c-2.7 1.3-4.3 3.7-4.3 6.5 0 2.6 1.5 4.5 3.7 4.5 1.9 0 3.3-1.4 3.3-3.3 0-1.8-1.3-3.1-3-3.1h-.5c.2-1.3 1-2.4 2.3-3.2l-1.5-1.4Z" />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5V7M16 3.5V7" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.5 7.5h7" />
      <path d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <path d="M12 7.9h.01" />
    </>
  ),
  warning: (
    <>
      <path d="M10.6 4.3 3.3 17a1.6 1.6 0 0 0 1.4 2.4h14.6a1.6 1.6 0 0 0 1.4-2.4L13.4 4.3a1.6 1.6 0 0 0-2.8 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 16.6h.01" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  external: (
    <>
      <path d="M13.5 4.5H19.5v6" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14.5v4a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6h4" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5v6M8 7.6h.01M12 16.5v-6M12 12.4a2.2 2.2 0 0 1 4.3.8v3.3" />
    </>
  ),
  x: <path d="m5 5 14 14M19 5 5 19" />,
};

export type IconProps = {
  name: UiIconName;
  className?: string;
  /**
   * Accessible label. Omit for icons that sit next to text — those are
   * decorative and are hidden from assistive technology.
   */
  title?: string;
  strokeWidth?: number;
};

export function Icon({ name, className, title, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6 shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}

/** Icon in a soft tinted tile — used on service and benefit cards. */
export function IconTile({
  name,
  className,
  tone = "mint",
}: {
  name: UiIconName;
  className?: string;
  tone?: "mint" | "dark" | "white";
}) {
  const tones = {
    mint: "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
    dark: "bg-brand-800 text-brand-200 ring-1 ring-white/10",
    white: "bg-white/10 text-white ring-1 ring-white/15",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-xl",
        tones[tone],
        className,
      )}
    >
      <Icon name={name} className="h-5.5 w-5.5" />
    </span>
  );
}
