import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * FAQ accordion built on native `<details>`/`<summary>`.
 *
 * Keyboard support, focus handling and screen-reader semantics come for free
 * and it works with JavaScript disabled — which a div-and-onClick version
 * would not. `name` groups items so only one stays open at a time.
 */
export function Accordion({
  items,
  className,
  name,
}: {
  items: { id: string; question: string; answer: string }[];
  className?: string;
  /** Shared name makes the group behave as an exclusive accordion. */
  name?: string;
}) {
  return (
    <div className={cn("divide-y divide-line", className)}>
      {items.map((item) => (
        <details key={item.id} name={name} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-brand-800 sm:text-[1.0625rem]">
              {item.question}
            </h3>
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-transform duration-200 group-open:rotate-180">
              <Icon name="chevron-down" className="h-4 w-4" />
            </span>
          </summary>
          <div className="pb-5 pr-10 text-[0.9375rem] leading-relaxed text-muted">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
