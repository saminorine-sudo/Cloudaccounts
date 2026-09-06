"use client";

import { useId } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Accessible form primitives.
 *
 * Every control is wired to a visible `<label>`, its hint and its error via
 * `aria-describedby`, and errors are marked with `aria-invalid` plus an icon —
 * so validation state is never communicated by colour alone.
 */

const controlBase =
  "w-full rounded-lg border bg-white px-3.5 text-[0.9375rem] text-ink transition-colors placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50";
const controlIdle = "border-line hover:border-slate-300";
const controlError = "border-red-400 bg-red-50/40";

export type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Hides the label visually but keeps it for screen readers. */
  hideLabel?: boolean;
  className?: string;
  children: (props: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
  }) => React.ReactNode;
};

export function Field({
  label,
  hint,
  error,
  required,
  hideLabel,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className={cn(
          "text-sm font-medium text-ink",
          hideLabel && "sr-only",
        )}
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-brand-700" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted">
            (optional)
          </span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}

      {children({ id, describedBy, invalid: Boolean(error) })}

      {error ? (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-xs font-medium text-red-700"
        >
          <Icon name="warning" className="mt-px h-3.5 w-3.5" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export function Input({
  invalid,
  className,
  ...props
}: { invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        controlBase,
        "h-11",
        invalid ? controlError : controlIdle,
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({
  invalid,
  className,
  ...props
}: { invalid?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={5}
      className={cn(
        controlBase,
        "resize-y py-2.5 leading-relaxed",
        invalid ? controlError : controlIdle,
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...props
}: { invalid?: boolean } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          controlBase,
          "h-11 appearance-none pr-10",
          invalid ? controlError : controlIdle,
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="chevron-down"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function Checkbox({
  label,
  description,
  invalid,
  className,
  ...props
}: {
  label: React.ReactNode;
  description?: string;
  invalid?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;

  return (
    <div className={cn("flex gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        aria-describedby={descId}
        aria-invalid={invalid || undefined}
        className={cn(
          "mt-0.5 h-[18px] w-[18px] shrink-0 rounded border-2 accent-brand-700",
          invalid ? "border-red-400" : "border-slate-300",
        )}
        {...props}
      />
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-sm leading-relaxed text-ink-soft"
        >
          {label}
        </label>
        {description ? (
          <p id={descId} className="text-xs text-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Multi-select rendered as checkbox chips inside a fieldset.
 *
 * A real fieldset/legend keeps the group announced correctly, which a div of
 * styled buttons would not.
 */
export function CheckboxGroup({
  legend,
  hint,
  error,
  options,
  selected,
  onToggle,
  name,
}: {
  legend: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  name: string;
}) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset aria-describedby={errorId}>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}

      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-700",
                isSelected
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-line bg-white text-ink-soft hover:border-slate-300",
              )}
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onToggle(option.value)}
                className="h-4 w-4 rounded border-2 border-slate-300 accent-brand-700"
              />
              {option.label}
            </label>
          );
        })}
      </div>

      {error ? (
        <p
          id={errorId}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700"
        >
          <Icon name="warning" className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function RadioGroup({
  legend,
  hint,
  error,
  options,
  value,
  onChange,
  name,
}: {
  legend: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string; description?: string }[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <fieldset aria-describedby={errorId}>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}

      <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-700",
                isSelected
                  ? "border-brand-600 bg-brand-50"
                  : "border-line bg-white hover:border-slate-300",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              <span>
                <span
                  className={cn(
                    "block font-medium",
                    isSelected ? "text-brand-800" : "text-ink",
                  )}
                >
                  {option.label}
                </span>
                {option.description ? (
                  <span className="mt-0.5 block text-xs text-muted">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p
          id={errorId}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700"
        >
          <Icon name="warning" className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
