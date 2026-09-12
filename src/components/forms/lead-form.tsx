"use client";

import Link from "next/link";
import { useState } from "react";

import { honeypotProps, useFormSubmit } from "@/components/forms/use-form-submit";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Checkbox,
  CheckboxGroup,
  Field,
  Input,
  RadioGroup,
  Select,
  Textarea,
} from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { track } from "@/lib/analytics";
import {
  businessTypes,
  contactMethods,
  serviceOptions,
  turnoverBands,
} from "@/lib/validation/options";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  turnover: string;
  services: string[];
  message: string;
  preferredContact: string;
  consent: boolean;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  businessName: "",
  businessType: "",
  turnover: "",
  services: [],
  message: "",
  preferredContact: "either",
  consent: false,
};

/**
 * Quote request / lead capture form.
 *
 * Validation runs on the server; this renders the errors it returns and keeps
 * the user's input so nothing has to be retyped. The success state replaces
 * the form entirely rather than showing a toast that can be missed.
 */
export function LeadForm({
  source = "website",
  compact = false,
}: {
  /** Where the enquiry came from — a plan slug, a service page, a campaign. */
  source?: string;
  compact?: boolean;
}) {
  const [values, setValues] = useState<FormState>(initialState);
  const [honeypot, setHoneypot] = useState("");
  const { status, error, fieldErrors, submit } = useFormSubmit("/api/leads");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const toggleService = (value: string) =>
    setValues((prev) => ({
      ...prev,
      services: prev.services.includes(value)
        ? prev.services.filter((service) => service !== value)
        : [...prev.services, value],
    }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await submit({ ...values, source }, { honeypotValue: honeypot });
    if (ok) track({ name: "lead_submitted", source });
    else track({ name: "form_error", form: "lead" });
  };

  if (status === "success") {
    return (
      <div className="rounded-card bg-white p-8 text-center shadow-card ring-1 ring-line">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="check" className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <h3 className="mt-5 text-xl font-semibold text-ink">
          Thanks — we&rsquo;ve got your enquiry.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">
          One of our accountants will be in touch within one working day. We
          have sent a confirmation to{" "}
          <strong className="font-medium text-ink">{values.email}</strong>.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/book-consultation">
            Book a consultation now
          </ButtonLink>
          <ButtonLink href="/resources/calculators" variant="secondary">
            Try our calculators
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6"
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
        <Field label="First name" required error={fieldErrors.firstName}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.firstName}
              onChange={(event) => set("firstName", event.target.value)}
              autoComplete="given-name"
              required
            />
          )}
        </Field>

        <Field label="Last name" required error={fieldErrors.lastName}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.lastName}
              onChange={(event) => set("lastName", event.target.value)}
              autoComplete="family-name"
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

        <Field
          label="Phone"
          error={fieldErrors.phone}
          hint="Only if you'd like us to call."
        >
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
      </div>

      <Field label="Business name" error={fieldErrors.businessName}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            value={values.businessName}
            onChange={(event) => set("businessName", event.target.value)}
            autoComplete="organization"
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business type" required error={fieldErrors.businessType}>
          {({ id, describedBy, invalid }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.businessType}
              onChange={(event) => set("businessType", event.target.value)}
              required
            >
              <option value="">Please select…</option>
              {businessTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          label="Estimated annual turnover"
          required
          error={fieldErrors.turnover}
        >
          {({ id, describedBy, invalid }) => (
            <Select
              id={id}
              aria-describedby={describedBy}
              invalid={invalid}
              value={values.turnover}
              onChange={(event) => set("turnover", event.target.value)}
              required
            >
              <option value="">Please select…</option>
              {turnoverBands.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <CheckboxGroup
        name="services"
        legend="Which services are you interested in?"
        hint="Select as many as apply — we'll confirm the right mix on the call."
        options={[...serviceOptions]}
        selected={values.services}
        onToggle={toggleService}
        error={fieldErrors.services}
      />

      <Field
        label="Anything else we should know?"
        error={fieldErrors.message}
        hint="Your current setup, deadlines coming up, what is not working — whatever is useful."
      >
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            aria-describedby={describedBy}
            invalid={invalid}
            rows={compact ? 3 : 5}
            value={values.message}
            onChange={(event) => set("message", event.target.value)}
          />
        )}
      </Field>

      <RadioGroup
        name="preferredContact"
        legend="Preferred contact method"
        options={[...contactMethods]}
        value={values.preferredContact}
        onChange={(value) => set("preferredContact", value)}
        error={fieldErrors.preferredContact}
      />

      <Checkbox
        checked={values.consent}
        onChange={(event) => set("consent", event.target.checked)}
        invalid={Boolean(fieldErrors.consent)}
        label={
          <>
            I&rsquo;m happy for CloudAccounts to contact me about this enquiry.
            See our{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              privacy policy
            </Link>{" "}
            for how we handle your details.
          </>
        }
      />
      {fieldErrors.consent ? (
        <p className="-mt-3 flex items-center gap-1.5 text-xs font-medium text-red-700">
          <Icon name="warning" className="h-3.5 w-3.5" />
          {fieldErrors.consent}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          data-analytics="lead-form-submit"
        >
          {status === "submitting" ? (
            <>
              <Spinner />
              Sending…
            </>
          ) : (
            "Get My Free Quote"
          )}
        </Button>
        <p className="text-xs leading-relaxed text-muted">
          No obligation. We reply within one working day.
        </p>
      </div>
    </form>
  );
}
