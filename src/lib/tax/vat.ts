import { getTaxYear, type TaxYearConfig } from "./rates";

/**
 * VAT calculations.
 *
 * Deliberately simple, because VAT arithmetic itself is simple — the
 * complexity in VAT lives in liability, place of supply and scheme choice,
 * none of which a website calculator should pretend to resolve.
 */

export type VatRateKey = "standard" | "reduced" | "zero";

export type VatRateOption = {
  key: VatRateKey;
  label: string;
  rate: number;
  /** Short, non-exhaustive orientation — not a liability determination. */
  hint: string;
};

export function vatRateOptions(config: TaxYearConfig): VatRateOption[] {
  return [
    {
      key: "standard",
      label: `Standard rate (${asPercent(config.vat.standardRate)})`,
      rate: config.vat.standardRate,
      hint: "Applies to most goods and services.",
    },
    {
      key: "reduced",
      label: `Reduced rate (${asPercent(config.vat.reducedRate)})`,
      rate: config.vat.reducedRate,
      hint: "Applies to a defined list including domestic fuel and power and some energy-saving materials.",
    },
    {
      key: "zero",
      label: `Zero rate (${asPercent(config.vat.zeroRate)})`,
      rate: config.vat.zeroRate,
      hint: "Applies to a defined list including most food, books and children's clothing. Different from being exempt.",
    },
  ];
}

export type VatDirection = "add" | "remove";

export type VatResult = {
  taxYear: TaxYearConfig;
  direction: VatDirection;
  rate: number;
  net: number;
  vat: number;
  gross: number;
};

/**
 * `add` treats the amount as net (VAT-exclusive) and adds VAT.
 * `remove` treats the amount as gross (VAT-inclusive) and extracts the VAT.
 */
export function calculateVat(input: {
  amount: number;
  rateKey?: VatRateKey;
  /** Explicit rate, overriding `rateKey`. Used for Flat Rate percentages. */
  rate?: number;
  direction: VatDirection;
  taxYearId?: string;
}): VatResult {
  const config = getTaxYear(input.taxYearId);
  const amount = Math.max(0, input.amount);
  const rate =
    input.rate ??
    vatRateOptions(config).find((o) => o.key === (input.rateKey ?? "standard"))!
      .rate;

  if (input.direction === "add") {
    const vat = amount * rate;
    return {
      taxYear: config,
      direction: "add",
      rate,
      net: amount,
      vat,
      gross: amount + vat,
    };
  }

  const net = amount / (1 + rate);
  return {
    taxYear: config,
    direction: "remove",
    rate,
    net,
    vat: amount - net,
    gross: amount,
  };
}

export type VatThresholdCheck = {
  taxYear: TaxYearConfig;
  turnover: number;
  registrationThreshold: number;
  deregistrationThreshold: number;
  mustRegister: boolean;
  /** Within 10% of the threshold — worth watching. */
  approaching: boolean;
  headroom: number;
  message: string;
};

/**
 * Checks a rolling twelve-month taxable turnover against the registration
 * threshold. Covers the backward-looking test only — the separate
 * forward-looking test (expecting to exceed the threshold in the next 30 days
 * alone) cannot be evaluated from a single turnover figure, and the UI says
 * so rather than implying this check is complete.
 */
export function checkVatThreshold(
  turnover: number,
  taxYearId?: string,
): VatThresholdCheck {
  const config = getTaxYear(taxYearId);
  const { registrationThreshold, deregistrationThreshold } = config.vat;
  const value = Math.max(0, turnover);
  const headroom = registrationThreshold - value;
  const mustRegister = value > registrationThreshold;
  const approaching = !mustRegister && headroom <= registrationThreshold * 0.1;

  let message: string;
  if (mustRegister) {
    message = `This exceeds the ${money(registrationThreshold)} registration threshold, so registration is required.`;
  } else if (approaching) {
    message = `This is within ${money(headroom)} of the ${money(registrationThreshold)} threshold. Worth monitoring monthly.`;
  } else {
    message = `This is ${money(headroom)} below the ${money(registrationThreshold)} registration threshold.`;
  }

  return {
    taxYear: config,
    turnover: value,
    registrationThreshold,
    deregistrationThreshold,
    mustRegister,
    approaching,
    headroom,
    message,
  };
}

function asPercent(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

function money(value: number): string {
  return `£${Math.round(value).toLocaleString("en-GB")}`;
}
