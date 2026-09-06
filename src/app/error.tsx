"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";

/**
 * Route-level error boundary.
 *
 * Shows a recovery path, never the underlying error. Stack traces and
 * messages can leak internal detail, so the user gets a plain apology and a
 * digest they can quote if they call us.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <Section tone="white" spacing="loose">
      <Container size="narrow" className="text-center">
        <h1 className="text-display-md">Something went wrong.</h1>
        <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted">
          Sorry — that page didn&rsquo;t load properly. Trying again usually
          fixes it. If it keeps happening, give us a call and we&rsquo;ll sort
          it out.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/" variant="secondary" size="lg">
            Back to the homepage
          </ButtonLink>
        </div>

        {error.digest ? (
          <p className="mt-8 text-xs text-muted">
            Reference: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </Container>
    </Section>
  );
}
