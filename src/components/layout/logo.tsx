import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Wordmark.
 *
 * The mark is an ascending trend line inside a rounded tile — growth rather
 * than a literal cloud or calculator, which is the visual cliché this brand
 * is trying to avoid.
 */
export function Logo({
  className,
  tone = "light",
  href = "/",
}: {
  className?: string;
  tone?: "light" | "dark";
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-[0.55rem]",
          tone === "dark" ? "bg-brand-500" : "bg-brand-700",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
          aria-hidden="true"
        >
          <path d="M4 17.5 9.5 11l3.5 3.2L20 6.5" />
          <path d="M15.2 6.5H20v4.7" />
        </svg>
      </span>

      <span
        className={cn(
          "font-display text-[1.0625rem] font-bold tracking-[-0.02em]",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        Cloud
        <span className={tone === "dark" ? "text-brand-400" : "text-brand-700"}>
          Accounts
        </span>
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex rounded-lg" aria-label="CloudAccounts — home">
      {content}
    </Link>
  );
}
