"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { honeypotField } from "@/lib/validation/options";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

type ApiResponse = {
  ok: boolean;
  error?: string;
  fields?: Record<string, string>;
  id?: string;
};

/**
 * Shared submit handling for the public forms.
 *
 * Owns the four states every form needs — idle, submitting, success, error —
 * plus per-field errors returned by the server, and guards against duplicate
 * submissions from a double click or an impatient second press.
 *
 * `renderedAt` is captured on mount and sent with the payload so the server
 * can reject submissions that arrive impossibly fast.
 */
export function useFormSubmit(endpoint: string) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Stamped after mount rather than during render: reading the clock while
  // rendering is impure and would give a different value on every re-render.
  // Zero means "not stamped", which the server treats as no timing signal.
  const renderedAt = useRef(0);
  const inFlight = useRef(false);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const submit = useCallback(
    async (
      payload: Record<string, unknown>,
      options?: { honeypotValue?: string },
    ): Promise<boolean> => {
      if (inFlight.current) return false;
      inFlight.current = true;

      setStatus("submitting");
      setError(null);
      setFieldErrors({});

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...payload,
            renderedAt: renderedAt.current,
            [honeypotField]: options?.honeypotValue ?? "",
          }),
        });

        const data = (await response.json()) as ApiResponse;

        if (!response.ok || !data.ok) {
          setFieldErrors(data.fields ?? {});
          setError(
            data.error ??
              "Something went wrong. Please try again, or call us instead.",
          );
          setStatus("error");
          return false;
        }

        setStatus("success");
        return true;
      } catch {
        // Network failure, offline, or the request was blocked.
        setError(
          "We couldn't reach the server. Check your connection and try again, or call us instead.",
        );
        setStatus("error");
        return false;
      } finally {
        inFlight.current = false;
      }
    },
    [endpoint],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setFieldErrors({});
    renderedAt.current = Date.now();
  }, []);

  return { status, error, fieldErrors, submit, reset };
}

/**
 * Honeypot input.
 *
 * Positioned off-screen rather than `display: none`, kept out of the tab order
 * and hidden from assistive technology, with autocomplete disabled so a
 * browser cannot helpfully fill it in for a real user.
 */
export const honeypotProps = {
  name: honeypotField,
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": true as const,
  className:
    "absolute left-[-9999px] top-0 h-px w-px overflow-hidden opacity-0",
};
