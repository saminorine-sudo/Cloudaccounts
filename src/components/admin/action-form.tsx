"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/app/admin/actions";

/**
 * Form wrapper for admin mutations.
 *
 * Server actions return a result rather than throwing, so failures render as
 * a message beside the control instead of replacing the page with an error
 * boundary. A failed status change should not lose the rest of the screen.
 */
type ServerAction = (formData: FormData) => Promise<ActionResult>;

export function AdminActionForm({
  action,
  children,
  className,
}: {
  action: ServerAction;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    async (_previous, formData) => action(formData),
    null,
  );

  return (
    <form action={formAction} className={className}>
      {children}
      {state && !state.ok ? (
        <p
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-xs font-medium text-red-700"
        >
          <Icon name="warning" className="mt-px h-3.5 w-3.5 shrink-0" />
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  size = "sm",
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
}) {
  // `useFormStatus` reports the enclosing form's state, so this button has to
  // live inside the form rather than own it.
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      className={className}
    >
      {pending ? <Spinner /> : null}
      {children}
    </Button>
  );
}

/**
 * A select that submits as soon as a choice is made.
 *
 * Avoids the "changed the dropdown but forgot to press save" failure, which
 * on a lead pipeline means someone's status is silently wrong. Falls back to
 * an explicit button when JavaScript has not loaded.
 */
export function AutoSubmitSelect({
  name,
  value,
  options,
  label,
  className,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  const formRef = useRef<HTMLSelectElement>(null);
  const { pending } = useFormStatus();

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <label className="sr-only" htmlFor={`${name}-select`}>
        {label}
      </label>
      {/*
        `key` is the current value on purpose. This select is uncontrolled so
        the browser owns it between renders, but `defaultValue` only applies
        on mount — after a revalidation the element would keep showing the old
        status while the record had moved on. Re-keying remounts it against
        the server's value, so the control can never disagree with the data.
      */}
      <select
        key={value}
        id={`${name}-select`}
        ref={formRef}
        name={name}
        defaultValue={value}
        disabled={pending}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="h-9 appearance-none rounded-lg border border-line bg-white pl-3 pr-8 text-sm font-medium text-ink transition-colors hover:border-slate-300 disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {pending ? (
        <Spinner className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted" />
      ) : (
        <Icon
          name="chevron-down"
          className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted"
        />
      )}

      {/* Without JavaScript the change handler never fires, so keep a way to
          submit. Hidden once JS is running, via the CSS-only sibling trick of
          rendering it inside a <noscript>. */}
      <noscript>
        <button
          type="submit"
          className="ml-2 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white"
        >
          Save
        </button>
      </noscript>
    </span>
  );
}
