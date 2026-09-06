"use client";

import Link from "next/link";
import { useState } from "react";

import { honeypotProps, useFormSubmit } from "@/components/forms/use-form-submit";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { track } from "@/lib/analytics";

const initialState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  consent: false,
};

export function ContactForm() {
  const [values, setValues] = useState(initialState);
  const [honeypot, setHoneypot] = useState("");
  const { status, error, fieldErrors, submit, reset } =
    useFormSubmit("/api/contact");

  const set = <K extends keyof typeof initialState>(
    key: K,
    value: (typeof initialState)[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await submit(values, { honeypotValue: honeypot });
    if (ok) track({ name: "contact_submitted", source: "contact-page" });
    else track({ name: "form_error", form: "contact" });
  };

  if (status === "success") {
    return (
      <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-line">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="check" className="h-5.5 w-5.5" strokeWidth={2.2} />
        </span>
        <h3 className="mt-5 text-xl font-semibold text-ink">
          Message sent.
        </h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
          Thanks for getting in touch. We&rsquo;ll reply to{" "}
          <strong className="font-medium text-ink">{values.email}</strong>{" "}
          within one working day.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(initialState);
            reset();
          }}
          className="mt-6 text-sm font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5"
      aria-busy={status === "submitting"}
    >
      <input
        {...honeypotProps}
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
      />

      {error ? (
        <Alert tone="error" role="alert" title="We couldn't send that">
          {error}
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={fieldErrors.name}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              autoComplete="name"
              required
            />
          )}
        </Field>

        <Field label="Email" required error={fieldErrors.email}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              inputMode="email"
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
              autoComplete="email"
              required
            />
          )}
        </Field>
      </div>

      <Field label="Phone" error={fieldErrors.phone}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="tel"
            inputMode="tel"
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.phone}
            onChange={(event) => set("phone", event.target.value)}
            autoComplete="tel"
          />
        )}
      </Field>

      <Field label="Subject" required error={fieldErrors.subject}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.subject}
            onChange={(event) => set("subject", event.target.value)}
            placeholder="What is your message about?"
            required
          />
        )}
      </Field>

      <Field label="Message" required error={fieldErrors.message}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.message}
            onChange={(event) => set("message", event.target.value)}
            required
          />
        )}
      </Field>

      <Checkbox
        checked={values.consent}
        onChange={(event) => set("consent", event.target.checked)}
        invalid={Boolean(fieldErrors.consent)}
        label={
          <>
            I&rsquo;m happy for CloudAccounts to contact me about this message.
            See our{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              privacy policy
            </Link>
            .
          </>
        }
      />
      {fieldErrors.consent ? (
        <p className="-mt-2 flex items-center gap-1.5 text-xs font-medium text-red-700">
          <Icon name="warning" className="h-3.5 w-3.5" />
          {fieldErrors.consent}
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          data-analytics="contact-form-submit"
        >
          {status === "submitting" ? (
            <>
              <Spinner />
              Sending…
            </>
          ) : (
            "Send Enquiry"
          )}
        </Button>
      </div>
    </form>
  );
}
