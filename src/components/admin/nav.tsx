"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type UiIconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Admin navigation.
 *
 * A client component purely so the active item can be derived from the
 * current path — a server layout has no reliable access to it without
 * middleware setting a header, which is a lot of machinery for a highlight.
 *
 * Lists only sections that exist. A disabled link to an unbuilt screen is
 * noise that makes the product feel unfinished every time someone clicks it.
 */

type AdminNavItem = {
  href: string;
  label: string;
  icon: UiIconName;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "chart" },
  { href: "/admin/leads", label: "Leads", icon: "people" },
  { href: "/admin/appointments", label: "Appointments", icon: "calendar" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "mail" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="px-3 pb-3 lg:pb-6">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {adminNavItems.map((item) => {
          // The dashboard is an exact match; everything else owns its subtree.
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="shrink-0 lg:shrink">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-800"
                    : "text-ink-soft hover:bg-surface hover:text-ink",
                )}
              >
                <Icon
                  name={item.icon}
                  className={cn(
                    "h-4.5 w-4.5",
                    isActive ? "text-brand-700" : "text-slate-400",
                  )}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
