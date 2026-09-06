"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { honeypotProps, useFormSubmit } from "@/components/forms/use-form-submit";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { Alert, EmptyState, Spinner } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { track } from "@/lib/analytics";
import { formatSlotTime } from "@/lib/booking/availability";
import { cn } from "@/lib/utils";
import type { ConsultationType } from "@/types/content";

/**
 * Availability is computed on the server and passed in, so the date list is
 * identical on both sides of hydration and the client does no date maths.
 */
export type DayAvailability = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** "Mon 14 Sep". */
  label: string;
  slots: string[];
};

type Step = 1 | 2 | 3;

const steps: { number: Step; label: string }[] = [
  { number: 1, label: "Consultation" },
  { number: 2, label: "Date & time" },
  { number: 3, label: "Your details" },
];

const initialDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  businessName: "",
  notes: "",
  consent: false,
};

export function BookingForm({
  consultationTypes,
  availability,
  initialTypeSlug,
}: {
  consultationTypes: ConsultationType[];
  availability: Record<string, DayAvailability[]>;
  initialTypeSlug?: string;
}) {
  const [step, setStep] = useState<Step>(1);
  const [typeSlug, setTypeSlug] = useState(
    initialTypeSlug && availability[initialTypeSlug]
      ? initialTypeSlug
      : (consultationTypes[0]?.slug ?? ""),
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [details, setDetails] = useState(initialDetails);
  const [honeypot, setHoneypot] = useState("");

  const { status, error, fieldErrors, submit } = useFormSubmit("/api/bookings");

  const selectedType = consultationTypes.find((type) => type.slug === typeSlug);
  // Memoised so the fallback empty array is not a fresh value each render,
  // which would invalidate everything downstream of it.
  const days = useMemo(
    () => availability[typeSlug] ?? [],
    [availability, typeSlug],
  );
  const selectedDay = useMemo(
    () => days.find((day) => day.date === date),
    [days, date],
  );

  const set = <K extends keyof typeof initialDetails>(
    key: K,
    value: (typeof initialDetails)[K],
  ) => setDetails((prev) => ({ ...prev, [key]: value }));

  const chooseType = (slug: string) => {
    setTypeSlug(slug);
    // A different consultation type has different availability, so any
    // previously chosen slot is no longer meaningful.
    setDate("");
    setTime("");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await submit(
      { consultationTypeSlug: typeSlug, date, time, ...details },
      { honeypotValue: honeypot },
    );
    if (ok) track({ name: "booking_submitted", consultationType: typeSlug });
    else track({ name: "form_error", form: "booking" });
  };

  /* ---------------------------------------------------------------------- */
  /* Success                                                                 */
  /* ---------------------------------------------------------------------- */

  if (status === "success" && selectedType) {
    return (
      <div className="rounded-card bg-white p-8 shadow-card ring-1 ring-line sm:p-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="check" className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-ink">
          Your consultation is requested.
        </h2>
        <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-muted">
          We&rsquo;ve sent the details to{" "}
          <strong className="font-medium text-ink">{details.email}</strong>. One
          of the team will confirm the slot by email shortly — if the time stops
          working for you, just reply and we&rsquo;ll rearrange.
        </p>

        <dl className="mt-7 grid gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line sm:grid-cols-3">
          {[
            { term: "Consultation", detail: selectedType.name },
            { term: "Date", detail: selectedDay?.label ?? date },
            {
              term: "Time",
              detail: `${formatSlotTime(time)} · ${selectedType.durationMinutes} min`,
            },
          ].map((row) => (
            <div key={row.term} className="bg-white p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                {row.term}
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {row.detail}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/resources/calculators" variant="secondary">
            Try our calculators
          </ButtonLink>
          <ButtonLink href="/resources/guides" variant="secondary">
            Read our guides
          </ButtonLink>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Wizard                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div>
      <ol className="mb-8 flex items-center gap-2 sm:gap-3">
        {steps.map((entry, index) => {
          const isDone = step > entry.number;
          const isCurrent = step === entry.number;

          return (
            <li key={entry.number} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isDone && "bg-brand-700 text-white",
                  isCurrent && "bg-brand-700 text-white",
                  !isDone && !isCurrent && "bg-slate-100 text-muted",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? (
                  <Icon name="check" className="h-4 w-4" strokeWidth={2.4} />
                ) : (
                  entry.number
                )}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  isCurrent ? "text-ink" : "text-muted",
                )}
              >
                {entry.label}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "ml-1 h-px flex-1",
                    isDone ? "bg-brand-600" : "bg-line",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-line sm:p-8">
        {/* Step 1 — consultation type */}
        {step === 1 ? (
          <fieldset>
            <legend className="text-lg font-semibold text-ink">
              What would you like to talk about?
            </legend>
            <p className="mt-1.5 text-sm text-muted">
              All initial consultations are free and carry no obligation.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {consultationTypes.map((type) => {
                const isSelected = type.slug === typeSlug;
                return (
                  <label
                    key={type.slug}
                    className={cn(
                      "flex cursor-pointer gap-3.5 rounded-xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-700",
                      isSelected
                        ? "border-brand-600 bg-brand-50/60"
                        : "border-line hover:border-slate-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="consultationType"
                      value={type.slug}
                      checked={isSelected}
                      onChange={() => chooseType(type.slug)}
                      className="mt-1 h-4 w-4 accent-brand-700"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-semibold text-ink">
                          {type.name}
                        </span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-line">
                          {type.durationMinutes} min
                        </span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-line">
                          {type.mode}
                        </span>
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                          {type.priceLabel}
                        </span>
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-muted">
                        {type.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-7">
              <Button
                type="button"
                size="lg"
                onClick={() => setStep(2)}
                disabled={!typeSlug}
                withArrow
              >
                Choose a time
              </Button>
            </div>
          </fieldset>
        ) : null}

        {/* Step 2 — date and time */}
        {step === 2 ? (
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Pick a date and time
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              All times are UK time. {selectedType?.name} ·{" "}
              {selectedType?.durationMinutes} minutes.
            </p>

            {days.length === 0 ? (
              <EmptyState
                icon="calendar"
                className="mt-6"
                title="No slots available right now"
                description="There are no bookable times for this consultation in the next few weeks. Send us an enquiry and we'll find a time that works."
                action={
                  <ButtonLink href="/contact" variant="secondary">
                    Send an enquiry
                  </ButtonLink>
                }
              />
            ) : (
              <>
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium text-ink">
                    Available dates
                  </legend>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {days.map((day) => {
                      const isSelected = day.date === date;
                      return (
                        <label
                          key={day.date}
                          className={cn(
                            "cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-700",
                            isSelected
                              ? "border-brand-600 bg-brand-700 text-white"
                              : "border-line bg-white text-ink-soft hover:border-slate-300",
                          )}
                        >
                          <input
                            type="radio"
                            name="date"
                            value={day.date}
                            checked={isSelected}
                            onChange={() => {
                              setDate(day.date);
                              setTime("");
                            }}
                            className="sr-only"
                          />
                          {day.label}
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.date ? (
                    <p className="mt-2 text-xs font-medium text-red-700">
                      {fieldErrors.date}
                    </p>
                  ) : null}
                </fieldset>

                {selectedDay ? (
                  <fieldset className="mt-7 border-t border-line pt-6">
                    <legend className="text-sm font-medium text-ink">
                      Available times on {selectedDay.label}
                    </legend>
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {selectedDay.slots.map((slot) => {
                        const isSelected = slot === time;
                        return (
                          <label
                            key={slot}
                            className={cn(
                              "cursor-pointer rounded-lg border px-2 py-2.5 text-center text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-700",
                              isSelected
                                ? "border-brand-600 bg-brand-700 text-white"
                                : "border-line bg-white text-ink-soft hover:border-slate-300",
                            )}
                          >
                            <input
                              type="radio"
                              name="time"
                              value={slot}
                              checked={isSelected}
                              onChange={() => setTime(slot)}
                              className="sr-only"
                            />
                            {formatSlotTime(slot)}
                          </label>
                        );
                      })}
                    </div>
                    {fieldErrors.time ? (
                      <p className="mt-2 text-xs font-medium text-red-700">
                        {fieldErrors.time}
                      </p>
                    ) : null}
                  </fieldset>
                ) : null}
              </>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => setStep(3)}
                disabled={!date || !time}
                withArrow
              >
                Enter your details
              </Button>
            </div>
          </div>
        ) : null}

        {/* Step 3 — details */}
        {step === 3 ? (
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

            <div>
              <h2 className="text-lg font-semibold text-ink">Your details</h2>
              <p className="mt-1.5 text-sm text-muted">
                {selectedType?.name} · {selectedDay?.label} at{" "}
                {formatSlotTime(time)} (UK time)
              </p>
            </div>

            {error ? (
              <Alert tone="error" role="alert" title="We couldn't book that">
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
                    value={details.firstName}
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
                    value={details.lastName}
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
                    value={details.email}
                    onChange={(event) => set("email", event.target.value)}
                    autoComplete="email"
                    required
                  />
                )}
              </Field>

              <Field
                label="Phone"
                error={fieldErrors.phone}
                hint="In case we need to reach you before the call."
              >
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    type="tel"
                    inputMode="tel"
                    aria-describedby={describedBy}
                    invalid={invalid}
                    value={details.phone}
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
                  value={details.businessName}
                  onChange={(event) => set("businessName", event.target.value)}
                  autoComplete="organization"
                />
              )}
            </Field>

            <Field
              label="What would you like to cover?"
              error={fieldErrors.notes}
              hint="A sentence or two so we can prepare properly."
            >
              {({ id, describedBy, invalid }) => (
                <Textarea
                  id={id}
                  rows={4}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  value={details.notes}
                  onChange={(event) => set("notes", event.target.value)}
                />
              )}
            </Field>

            <Checkbox
              checked={details.consent}
              onChange={(event) => set("consent", event.target.checked)}
              invalid={Boolean(fieldErrors.consent)}
              label={
                <>
                  I&rsquo;m happy for CloudAccounts to contact me about this
                  booking. See our{" "}
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

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setStep(2)}
                disabled={status === "submitting"}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={status === "submitting"}
                data-analytics="booking-submit"
              >
                {status === "submitting" ? (
                  <>
                    <Spinner />
                    Booking…
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
