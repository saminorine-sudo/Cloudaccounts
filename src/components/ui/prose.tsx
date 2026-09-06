import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { ContentBlock } from "@/types/content";

/**
 * Renders structured content blocks.
 *
 * Content is stored as typed blocks rather than HTML strings, so nothing here
 * needs `dangerouslySetInnerHTML` — React escapes every value, which removes
 * stored-XSS as a class of bug from the CMS entirely.
 */
export function Prose({
  blocks,
  className,
}: {
  blocks: ContentBlock[];
  className?: string;
}) {
  return (
    <div className={cn("prose-ca", className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2 key={index} id={slugify(block.text)}>
                {block.text}
              </h2>
            ) : (
              <h3 key={index} id={slugify(block.text)}>
                {block.text}
              </h3>
            );

          case "list":
            return block.ordered ? (
              <ol key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );

          case "callout":
            return (
              <aside
                key={index}
                className={cn(
                  "not-prose my-7 flex gap-3 rounded-xl px-4 py-4 text-sm leading-relaxed ring-1",
                  block.tone === "warning"
                    ? "bg-amber-50 text-amber-950 ring-amber-200"
                    : "bg-brand-50 text-brand-900 ring-brand-200",
                )}
              >
                <Icon
                  name={block.tone === "warning" ? "warning" : "info"}
                  className={cn(
                    "mt-0.5 h-4.5 w-4.5",
                    block.tone === "warning"
                      ? "text-amber-700"
                      : "text-brand-700",
                  )}
                />
                <div>
                  <p className="font-semibold">{block.title}</p>
                  <p className="mt-1">{block.text}</p>
                </div>
              </aside>
            );

          case "quote":
            return (
              <blockquote key={index}>
                <p>{block.text}</p>
                {block.attribution ? (
                  <footer className="mt-2 text-sm text-muted">
                    {block.attribution}
                  </footer>
                ) : null}
              </blockquote>
            );

          case "paragraph":
          default:
            return <p key={index}>{block.text}</p>;
        }
      })}
    </div>
  );
}

/** Extracts h2 headings for an on-page contents list. */
export function tableOfContents(
  blocks: ContentBlock[],
): { id: string; text: string }[] {
  return blocks
    .filter(
      (block): block is Extract<ContentBlock, { type: "heading" }> =>
        block.type === "heading" && block.level === 2,
    )
    .map((block) => ({ id: slugify(block.text), text: block.text }));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function Breadcrumbs({
  items,
  className,
  tone = "light",
}: {
  items: { label: string; href?: string }[];
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    tone === "dark"
                      ? "text-brand-200 hover:text-white"
                      : "text-muted hover:text-brand-700",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "font-medium",
                    tone === "dark" ? "text-white" : "text-ink",
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={
                    tone === "dark" ? "text-brand-400/60" : "text-slate-300"
                  }
                >
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Embeds JSON-LD. Serialised safely against `</script>` injection. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
