"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Sticky mobile action bar: tap to call, tap to book.
 *
 * Appears only after the user has scrolled past the hero, so it never covers
 * the first screen. Hidden on the pages where it would compete with the
 * primary form on screen.
 */
const HIDDEN_ON = ["/book-consultation", "/contact"];

export function MobileCtaBar({ phoneHref }: { phoneHref: string }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.625rem)] pt-2.5 backdrop-blur-md transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!visible}
    >
      <div className="flex gap-2.5">
        <a
          href={phoneHref}
          tabIndex={visible ? undefined : -1}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-brand-700 ring-1 ring-line"
          data-analytics="sticky-phone"
        >
          <Icon name="phone" className="h-5 w-5" title="Call CloudAccounts" />
        </a>
        <Link
          href="/book-consultation"
          tabIndex={visible ? undefined : -1}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-700 text-[0.9375rem] font-medium text-white"
          data-analytics="sticky-book"
        >
          Book a Consultation
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
