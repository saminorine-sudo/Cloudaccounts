"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { primaryNav, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Site header.
 *
 * Becomes compact and gains a shadow once scrolled. Dropdowns open on hover
 * for pointer users and on click or Enter for keyboard users, close on Escape
 * and on outside click, and are wired with `aria-expanded` / `aria-controls`.
 */
export function SiteHeader({
  phone,
  phoneHref,
}: {
  phone: string;
  phoneHref: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes whatever is open. Adjusting state during render
  // when a value changes is React's documented pattern for this — an effect
  // would render the stale open menu for a frame first.
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  // Prevent the page behind the mobile menu from scrolling.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const openWithDelay = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };

  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-100 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-line bg-white/92 shadow-card backdrop-blur-md"
            : "border-transparent bg-white",
        )}
      >
        {/* Utility bar — desktop only, keeps the main bar uncluttered. */}
        <div
          className={cn(
            "hidden overflow-hidden border-b border-line/70 bg-surface transition-all duration-300 lg:block",
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
          )}
        >
          <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-8 text-xs text-muted">
            <p>
              Accounting, tax and business support for UK businesses.
            </p>
            <div className="flex items-center gap-5">
              <a
                href={phoneHref}
                className="inline-flex items-center gap-1.5 font-medium text-ink-soft transition-colors hover:text-brand-700"
                data-analytics="header-phone"
              >
                <Icon name="phone" className="h-3.5 w-3.5" />
                {phone}
              </a>
              <Link
                href="/contact"
                className="font-medium text-ink-soft transition-colors hover:text-brand-700"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div
          ref={navRef}
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 transition-[height] duration-300 sm:px-6 lg:px-8",
            scrolled ? "h-16" : "h-18",
          )}
        >
          <Logo />

          <nav
            aria-label="Main"
            className="hidden items-center gap-0.5 lg:flex"
          >
            {primaryNav.map((item) => (
              <NavEntry
                key={item.label}
                item={item}
                active={isActive(item.href)}
                open={openMenu === item.label}
                onOpen={() => openWithDelay(item.label)}
                onClose={closeWithDelay}
                onToggle={() =>
                  setOpenMenu(openMenu === item.label ? null : item.label)
                }
              />
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <ButtonLink href="/contact" variant="secondary" size="sm">
              Get a Quote
            </ButtonLink>
            <ButtonLink
              href="/book-consultation"
              size="sm"
              data-analytics="header-book"
            >
              Book a Free Consultation
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink ring-1 ring-line transition-colors hover:bg-surface lg:hidden"
          >
            <Icon
              name={mobileOpen ? "close" : "menu"}
              className="h-5 w-5"
              title={mobileOpen ? "Close menu" : "Open menu"}
            />
          </button>
        </div>
      </header>

      <MobileMenu open={mobileOpen} phone={phone} phoneHref={phoneHref} />
    </>
  );
}

function NavEntry({
  item,
  active,
  open,
  onOpen,
  onClose,
  onToggle,
}: {
  item: NavItem;
  active: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}) {
  const menuId = `nav-${item.label.replace(/\s+/g, "-").toLowerCase()}`;

  const linkClass = cn(
    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[0.9375rem] font-medium transition-colors",
    active ? "text-brand-700" : "text-ink-soft hover:text-brand-700",
  );

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={linkClass}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  }

  // Opens on hover for pointer users and on click/Enter for keyboard users.
  // Deliberately NOT on focus: tabbing to the trigger would open the menu,
  // and the Enter press that follows would immediately close it again.
  // Blur closes it once focus leaves the trigger and its links.
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          onClose();
        }
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={menuId}
        className={linkClass}
      >
        {item.label}
        <Icon
          name="chevron-down"
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-3"
      >
        <div className="overflow-hidden rounded-card bg-white p-2 shadow-pop ring-1 ring-line">
          <Link
            href={item.href}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-700 transition-colors hover:bg-brand-50"
          >
            All {item.label}
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </Link>

          <ul className="mt-1">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
                >
                  <span className="block text-sm font-medium text-ink">
                    {child.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {child.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MobileMenu({
  open,
  phone,
  phoneHref,
}: {
  open: boolean;
  phone: string;
  phoneHref: string;
}) {
  return (
    <div
      id="mobile-menu"
      hidden={!open}
      className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-white lg:hidden"
    >
      <nav aria-label="Mobile" className="px-5 pb-8 pt-4 sm:px-6">
        <ul className="divide-y divide-line">
          {primaryNav.map((item) => (
            <li key={item.label} className="py-1">
              {item.children ? (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {item.label}
                    <Icon
                      name="chevron-down"
                      className="h-4 w-4 text-muted transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <ul className="pb-2 pl-1">
                    <li>
                      <Link
                        href={item.href}
                        className="block py-2.5 text-sm font-semibold text-brand-700"
                      >
                        All {item.label}
                      </Link>
                    </li>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block py-2.5 text-sm text-ink-soft"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link
                  href={item.href}
                  className="block py-3.5 text-base font-medium text-ink"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
          <li className="py-1">
            <Link
              href="/contact"
              className="block py-3.5 text-base font-medium text-ink"
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-2.5">
          <ButtonLink href="/book-consultation" size="lg" className="w-full">
            Book a Free Consultation
          </ButtonLink>
          <ButtonLink
            href="/contact"
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Get a Quote
          </ButtonLink>
        </div>

        <a
          href={phoneHref}
          className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-surface py-3.5 text-sm font-medium text-ink-soft"
          data-analytics="mobile-menu-phone"
        >
          <Icon name="phone" className="h-4 w-4 text-brand-700" />
          {phone}
        </a>
      </nav>
    </div>
  );
}
