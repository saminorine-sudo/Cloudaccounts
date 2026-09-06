import { ButtonLink } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { Badge, Card } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/types/content";

/**
 * Pricing cards.
 *
 * Prices come from the content repository — nothing here is hard-coded, so a
 * fee change is a data edit rather than a deploy. The disclaimer is rendered
 * whenever any plan is still flagged as demo pricing.
 */
export function PricingTable({
  plans,
  notes,
  disclaimer,
  showDisclaimer,
}: {
  plans: PricingPlan[];
  notes?: string[];
  disclaimer?: string;
  showDisclaimer: boolean;
}) {
  return (
    <div>
      {showDisclaimer && disclaimer ? (
        <DemoNotice className="mb-8">
          <strong className="font-semibold">Indicative pricing.</strong>{" "}
          {disclaimer}
        </DemoNotice>
      ) : null}

      <ul className="grid items-start gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <Reveal as="li" key={plan.id} delay={index * 70}>
            <Card
              tone={plan.isRecommended ? "white" : "white"}
              className={cn(
                "relative flex h-full flex-col p-7",
                plan.isRecommended &&
                  "shadow-pop ring-2 ring-brand-600 lg:-translate-y-3 lg:pb-9 lg:pt-9",
              )}
            >
              {plan.isRecommended ? (
                <Badge className="absolute -top-3 left-7 bg-brand-700 text-white ring-brand-700">
                  Most popular
                </Badge>
              ) : null}

              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {plan.audience}
              </p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="text-sm font-medium text-muted">
                  {plan.pricePrefix}
                </span>
                <span className="font-display text-4xl font-bold tracking-tight text-ink">
                  {formatCurrency(plan.priceMonthly)}
                </span>
                <span className="text-sm text-muted">{plan.priceSuffix}</span>
              </p>
              <p className="mt-1 text-xs text-muted">Excluding VAT</p>

              <p className="mt-5 border-t border-line pt-5 text-[0.9375rem] leading-relaxed text-ink-soft">
                {plan.description}
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Icon
                      name="check"
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                      strokeWidth={2.2}
                    />
                    <span className="text-sm leading-relaxed text-ink-soft">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={plan.ctaHref}
                variant={plan.isRecommended ? "primary" : "secondary"}
                size="lg"
                className="mt-7 w-full"
                data-analytics={`pricing-${plan.slug}`}
              >
                {plan.ctaLabel}
              </ButtonLink>
            </Card>
          </Reveal>
        ))}
      </ul>

      {notes && notes.length > 0 ? (
        <ul className="mx-auto mt-10 flex max-w-2xl flex-col gap-2.5">
          {notes.map((note) => (
            <li
              key={note}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
            >
              <Icon
                name="check"
                className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
              />
              {note}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
