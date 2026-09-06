/** Presentation helpers. Kept out of the tax engine so the maths stays pure. */

const gbp0 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const gbp2 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole pounds — the default for tax estimates, where pennies imply false precision. */
export function formatCurrency(value: number): string {
  return gbp0.format(Math.round(value));
}

/** Pounds and pence — for VAT, where the exact figure is the point. */
export function formatCurrencyPrecise(value: number): string {
  return gbp2.format(value);
}

export function formatPercent(rate: number, decimals = 1): string {
  const pct = rate * 100;
  const rounded = Number(pct.toFixed(decimals));
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateShort(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "Mon 14 Sep" — used in the booking date picker. */
export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

/** ISO date (YYYY-MM-DD) without timezone drift. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
