"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Fades content in as it enters the viewport.
 *
 * Deliberately restrained: one short transform, applied once, only to section
 * blocks. Elements start visible if JavaScript never runs, and the CSS honours
 * `prefers-reduced-motion` by disabling the transition entirely.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger in milliseconds. Keep small — long cascades feel sluggish. */
  delay?: number;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reduced motion is already handled in CSS, which forces revealed
    // elements visible. This branch only covers a browser without
    // IntersectionObserver, where the content must still appear. Deferring a
    // frame keeps the state update out of the effect body.
    if (
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("reveal", className)}
      data-revealed={revealed ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Counts a statistic up when it scrolls into view.
 *
 * The value is a formatted string like "£250M+" or "4.9/5", so the numeric
 * part is animated in place and the surrounding characters are preserved.
 * The full final value is rendered immediately for screen readers and when
 * motion is reduced.
 */
export function CountUp({
  value,
  className,
  durationMs = 1100,
}: {
  value: string;
  className?: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const match = value.match(/^([^\d.]*)([\d,.]+)(.*)$/);
    if (
      !match ||
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const [, prefix, numeric, suffix] = match;
    const target = Number(numeric.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;

    const decimals = numeric.includes(".")
      ? numeric.split(".")[1].length
      : 0;
    const useGrouping = numeric.includes(",");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        let frame = 0;

        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          // Ease-out cubic: fast to begin, settling at the end.
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;

          setDisplay(
            `${prefix}${current.toLocaleString("en-GB", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
              useGrouping,
            })}${suffix}`,
          );

          if (progress < 1) frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
