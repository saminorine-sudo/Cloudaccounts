import Link from "next/link";

import { SiteChrome } from "@/components/layout/site-chrome";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container, Section } from "@/components/ui/layout";

const suggestions = [
  { href: "/services", label: "Our services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources/calculators", label: "Tax calculators" },
  { href: "/resources/blog", label: "Blog" },
  { href: "/contact", label: "Contact us" },
];

/**
 * Global 404. Renders the site chrome itself, because unmatched URLs resolve
 * above the `(site)` route group — without this the page would have no
 * navigation to leave by.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <Section tone="white" spacing="loose">
        <Container size="narrow" className="text-center">
          <p className="font-display text-6xl font-bold tracking-tight text-brand-200">
            404
          </p>
          <h1 className="mt-4 text-display-md">
            We can&rsquo;t find that page.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted">
            The link may be out of date, or the page may have moved. Here are
            the places people usually want.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/" size="lg">
              Back to the homepage
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg" withArrow>
              Contact us
            </ButtonLink>
          </div>

          <ul className="mt-12 flex flex-wrap justify-center gap-2">
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-soft ring-1 ring-line transition-colors hover:text-brand-700 hover:ring-brand-300"
                >
                  {item.label}
                  <Icon name="arrow-right" className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </SiteChrome>
  );
}
