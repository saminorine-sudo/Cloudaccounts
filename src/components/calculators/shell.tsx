"use client";

import { useId } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/layout";
import { formatCurrency } from "@/lib/format";
import { ESTIMATE_DISCLAIMER, type TaxYearConfig } from "@/lib/tax/rates";
import { cn } from "@/lib/utils";

/**
 * Shared calculator chrome.
 *
 * Every calculator shows the tax year it used, the assumptions behind the
 * figure and the estimate disclaimer — right next to the result rather than
 * in small print at the bottom of the page. A number without its assumptions
 * is the thing that gets people into trouble.
 *
 * All calculation happens in the browser. Nothing the user types is sent
 * anywhere, which is both the right default for financial figures and what
 * lets the tools work instantly.
 */
export function CalculatorShell({
  title,
  description,
  taxYear,
  assumptions,
  inputs,
  results,
  ctaLabel = "Want a personalised calculation? Book a consultation.",
}: {
  title: string;
  description: string;
  taxYear: TaxYearConfig;
  assumptions: string[];
  inputs: React.ReactNode;
  results: React.ReactNode;
  ctaLabel?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
              {description}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
            {taxYear.label} rates
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="flex flex-col gap-5 p-6 sm:p-7">{inputs}</div>

        <div className="border-t border-line bg-surface p-6 sm:p-7 lg:border-l lg:border-t-0">
          {results}

          <p className="mt-6 flex gap-2 border-t border-line pt-5 text-xs leading-relaxed text-muted">
            <Icon name="info" className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              <strong className="font-semibold text-ink-soft">
                Estimate only.
              </strong>{" "}
              {ESTIMATE_DISCLAIMER.replace("Estimate only. ", "")}
            </span>
          </p>

          <details className="group mt-4">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-brand-700 [&::-webkit-details-marker]:hidden">
              What this assumes
              <Icon
                name="chevron-down"
                className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
              />
            </summary>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {assumptions.map((assumption) => (
                <li
                  key={assumption}
                  className="flex gap-2 text-xs leading-relaxed text-muted"
                >
                  <span aria-hidden="true" className="text-brand-500">
                    ·
                  </span>
                  {assumption}
                </li>
              ))}
            </ul>
          </details>

          <div className="mt-6">
            <ButtonLink
              href="/book-consultation"
              size="sm"
              className="w-full"
              data-analytics={`calculator-cta-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {ctaLabel}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Currency input with a £ prefix and numeric keyboard on mobile. */
export function MoneyInput({
  label,
  value,
  onChange,
  hint,
  max = 100_000_000,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  max?: number;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.9375rem] text-muted"
        >
          £
        </span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          step={100}
          aria-describedby={hintId}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => {
            const next = Number(event.target.value);
            // Clamp here rather than trusting the input: the tax functions
            // stay pure and should never receive NaN or a negative amount.
            onChange(
              Number.isFinite(next) ? Math.min(Math.max(next, 0), max) : 0,
            );
          }}
          className="h-11 w-full rounded-lg border border-line bg-white pl-7 pr-3.5 text-[0.9375rem] font-medium text-ink transition-colors hover:border-slate-300"
        />
      </div>
    </div>
  );
}

/** Segmented control for a small set of options. */
export function OptionToggle<T extends string>({
  label,
  options,
  value,
  onChange,
  name,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  name: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5 rounded-lg bg-slate-100 p-1">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex-1 cursor-pointer rounded-[0.4rem] px-3 py-2 text-center text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-700",
                isSelected
                  ? "bg-white text-ink shadow-card"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The single headline figure a calculator exists to produce. */
export function HeadlineResult({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
        {label}
      </p>
      <p
        className="mt-1.5 font-display text-4xl font-bold tracking-tight text-ink"
        aria-live="polite"
      >
        {value}
      </p>
      {sublabel ? (
        <p className="mt-1 text-sm text-muted">{sublabel}</p>
      ) : null}
    </div>
  );
}

export function ResultRow({
  label,
  value,
  emphasis = false,
  note,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  note?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 py-2.5",
        emphasis && "border-t border-line pt-3 font-semibold",
      )}
    >
      <span
        className={cn(
          "text-sm",
          emphasis ? "text-ink" : "text-muted",
        )}
      >
        {label}
        {note ? (
          <span className="mt-0.5 block text-xs font-normal text-muted">
            {note}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "shrink-0 text-sm tabular-nums",
          emphasis ? "text-ink" : "text-ink-soft",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Horizontal split showing how a total divides between parties. */
export function SplitBar({
  segments,
  total,
}: {
  segments: { label: string; value: number; className: string }[];
  total: number;
}) {
  if (total <= 0) return null;

  return (
    <div className="mt-5">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-200">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={segment.className}
            style={{ width: `${Math.max(0, (segment.value / total) * 100)}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <li
            key={segment.label}
            className="inline-flex items-center gap-1.5 text-xs text-muted"
          >
            <span
              aria-hidden="true"
              className={cn("h-2 w-2 rounded-full", segment.className)}
            />
            {segment.label} {formatCurrency(segment.value)}
          </li>
        ))}
      </ul>
    </div>
  );
}
