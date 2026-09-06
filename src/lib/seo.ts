import type { Metadata } from "next";

import { siteSettings } from "@/content/site";
import type { SeoFields } from "@/types/content";

/**
 * Metadata helpers.
 *
 * One place builds every page's title, description, canonical URL and social
 * cards, so no page can quietly ship without them.
 */

export const SITE_URL = siteSettings.url.replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata(seo: SeoFields): Metadata {
  const url = absoluteUrl(seo.canonicalPath);
  const ogImage = seo.ogImagePath ?? "/opengraph-image";

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      siteName: siteSettings.name,
      locale: siteSettings.locale,
      title: seo.title,
      description: seo.description,
      url,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage],
      ...(siteSettings.seo.twitterHandle
        ? { site: siteSettings.seo.twitterHandle }
        : {}),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Structured data                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Structured data is emitted only for things that are actually true of the
 * site. No aggregate review rating is published, because the ratings in this
 * build are demo content — marking them up as real review data would push
 * unverified claims into search results.
 */
export function organisationJsonLd() {
  const { contact } = siteSettings;
  return {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    "@id": `${SITE_URL}/#organisation`,
    name: siteSettings.name,
    description: siteSettings.description,
    url: SITE_URL,
    telephone: contact.phone,
    email: contact.email,
    areaServed: { "@type": "Country", name: "United Kingdom" },
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.addressLines.slice(1).join(", "),
      addressLocality: "London",
      postalCode: contact.postcode,
      addressCountry: "GB",
    },
    sameAs: siteSettings.socials.map((s) => s.url),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: siteSettings.name,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organisation` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string | null;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: { "@type": "Person", name: input.authorName },
    publisher: { "@id": `${SITE_URL}/#organisation` },
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    serviceType: input.name,
    provider: { "@id": `${SITE_URL}/#organisation` },
    areaServed: { "@type": "Country", name: "United Kingdom" },
  };
}
