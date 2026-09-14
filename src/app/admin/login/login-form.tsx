"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signIn, type SignInResult } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert, Spinner } from "@/components/ui/feedback";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Spinner />
          Signing in…
        </>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<SignInResult | null, FormData>(
    async (_previous, formData) => signIn(formData),
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      {state && !state.ok ? (
        <Alert tone="error" role="alert" title="Could not sign you in">
          {state.error}
        </Alert>
      ) : null}

      <Field label="Email" required>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="email"
            type="email"
            inputMode="email"
            aria-describedby={describedBy}
            invalid={invalid}
            autoComplete="username"
            required
          />
        )}
      </Field>

      <Field label="Password" required>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="password"
            type="password"
            aria-describedby={describedBy}
            invalid={invalid}
            autoComplete="current-password"
            required
          />
        )}
      </Field>

      <SubmitButton />
    </form>
  );
}
