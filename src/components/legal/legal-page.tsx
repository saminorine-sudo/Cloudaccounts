import Link from "next/link";

import { PageHero } from "@/components/marketing/sections";
import { CookiePreferencesLink } from "@/components/consent/cookie-consent";
import { Alert } from "@/components/ui/feedback";
import { Container, Section } from "@/components/ui/layout";
import { formatDate } from "@/lib/format";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

/**
 * Shared shell for the legal pages.
 *
 * Every legal page carries a prominent template notice. These documents are
 * drafted to be a sound starting point, but a privacy policy is a legal
 * document about a specific organisation's actual processing — publishing one
 * without review, and without it matching what the business really does, is
 * worse than not having one.
 */
export function LegalPage({
  title,
  lead,
  updatedAt,
  sections,
  showTemplateNotice,
  includeCookiePreferences = false,
}: {
  title: string;
  lead: string;
  updatedAt: string;
  sections: LegalSection[];
  showTemplateNotice: boolean;
  includeCookiePreferences?: boolean;
}) {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={title}
        lead={lead}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />

      <Section tone="surface">
        <Container size="narrow">
          <p className="text-sm text-muted">
            Last updated: {formatDate(updatedAt)}
          </p>

          {showTemplateNotice ? (
            <Alert tone="warning" className="mt-6" title="Template document">
              <p>
                This is placeholder content for a demonstration site. It has not
                been reviewed by a legal adviser and does not describe the
                actual processing carried out by any real business.
              </p>
              <p className="mt-2">
                Before publishing, this must be reviewed against how the
                business genuinely handles data, and checked against current
                guidance from the{" "}
                <a
                  href="https://ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Information Commissioner&rsquo;s Office
                </a>
                . Having a privacy policy does not by itself make a website
                compliant with UK data protection law.
              </p>
            </Alert>
          ) : null}

          <div className="prose-ca mt-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {includeCookiePreferences ? (
              <section>
                <h2>Changing your cookie preferences</h2>
                <p>
                  You can change which optional cookies you allow at any time.{" "}
                  <CookiePreferencesLink>
                    Open your cookie preferences
                  </CookiePreferencesLink>
                  . You can also clear or block cookies through your browser
                  settings, though blocking strictly necessary cookies may stop
                  parts of the site working.
                </p>
              </section>
            ) : null}

            <section>
              <h2>Contact</h2>
              <p>
                Questions about this document can be sent through our{" "}
                <Link href="/contact">contact page</Link>.
              </p>
            </section>
          </div>
        </Container>
      </Section>
    </>
  );
}
