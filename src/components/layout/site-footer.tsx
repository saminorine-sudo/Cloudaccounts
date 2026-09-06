import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/layout";
import { footerNav, legalNav } from "@/lib/navigation";
import type { SiteSettings } from "@/types/content";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { contact } = settings;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-brand-100">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div className="max-w-xs">
            <Logo tone="dark" />
            <p className="mt-4 text-sm leading-relaxed text-brand-100/80">
              Modern accounting support for UK businesses.
            </p>

            {settings.socials.length > 0 ? (
              <ul className="mt-6 flex gap-2">
                {settings.socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-200 ring-1 ring-white/12 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Icon
                        name={social.platform === "LinkedIn" ? "linkedin" : "x"}
                        className="h-4 w-4"
                        title={`CloudAccounts on ${social.platform}`}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {footerNav.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-100/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
              Contact
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <a
                  href={contact.phoneHref}
                  className="inline-flex items-center gap-2 text-brand-100/80 transition-colors hover:text-white"
                  data-analytics="footer-phone"
                >
                  <Icon name="phone" className="h-4 w-4 text-brand-400" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 break-all text-brand-100/80 transition-colors hover:text-white"
                  data-analytics="footer-email"
                >
                  <Icon name="mail" className="h-4 w-4 shrink-0 text-brand-400" />
                  {contact.email}
                </a>
              </li>
              <li className="flex gap-2">
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <address className="not-italic text-brand-100/80">
                  {contact.addressLines.slice(1).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <span className="block">{contact.postcode}</span>
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/*
          Honest footprint: while demo content is in place, the footer says so
          rather than letting placeholder contact details read as real.
        */}
        {settings.showDemoNotices ? (
          <p className="mt-12 rounded-xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-brand-100/75 ring-1 ring-white/10">
            <strong className="font-semibold text-brand-100/90">
              Demonstration site.
            </strong>{" "}
            CloudAccounts is a fictional brand built for development. Contact
            details, statistics, reviews, case studies, pricing and team
            profiles on this site are placeholder content and are not
            statements of fact.
          </p>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-brand-100/75">
            © {year} {settings.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs text-brand-100/75 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
