import Image from "next/image";

import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Portrait with an initials fallback.
 *
 * Team and testimonial records carry a `photoUrl` field for real photography.
 * Until real photos exist, an initials monogram is used rather than generic
 * stock portraits, which would misrepresent who works at the firm.
 *
 * The tint is picked deterministically from the name so the same person keeps
 * the same colour across the site.
 */

/**
 * Every tint keeps a visible disc against both white cards and the light
 * mint portrait panel — a near-white fill reads as a missing avatar rather
 * than a monogram.
 */
const tints = [
  "bg-brand-100 text-brand-800",
  "bg-brand-800 text-brand-100",
  "bg-slate-200 text-slate-700",
  "bg-brand-200 text-brand-900",
  "bg-slate-800 text-slate-100",
];

function tintFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return tints[hash % tints.length];
}

const sizes = {
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-full w-full text-2xl",
} as const;

export function Avatar({
  name,
  photoUrl,
  size = "md",
  className,
}: {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-full",
          sizes[size],
          className,
        )}
      >
        <Image
          src={photoUrl}
          alt={`${name}, CloudAccounts`}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide",
        tintFor(name),
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
