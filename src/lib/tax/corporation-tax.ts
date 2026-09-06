import { getTaxYear, type TaxYearConfig } from "./rates";

/**
 * Corporation Tax, including marginal relief.
 *
 * HMRC's marginal relief formula is:
 *
 *   Marginal Relief = F × (U − A) × (N ÷ A)
 *
 * where F is the standard fraction, U the upper limit, A augmented profits
 * (taxable profits plus exempt distributions from non-group companies) and N
 * taxable total profits. With no franked investment income A equals N and the
 * expression reduces to F × (U − N), which is the normal case.
 *
 * The lower and upper limits are divided by the number of associated
 * companies plus one, and pro-rated for accounting periods shorter than a
 * year. Both are common enough to get wrong that they are modelled here
 * rather than assumed away.
 */

export type CorporationTaxInput = {
  /** Taxable total profits for the period. */
  profit: number;
  /**
   * Augmented profits — taxable profits plus exempt distributions received.
   * Defaults to `profit`, which is correct for most small companies.
   */
  augmentedProfit?: number;
  /** Number of OTHER associated companies. Limits are divided by this + 1. */
  associatedCompanies?: number;
  /** Length of the accounting period. Limits are pro-rated below 365 days. */
  accountingPeriodDays?: number;
  taxYearId?: string;
};

export type CorporationTaxResult = {
  taxYear: TaxYearConfig;
  profit: number;
  /** Limits after association and period adjustments. */
  lowerLimit: number;
  upperLimit: number;
  /** Which charging basis applied. */
  basis: "small-profits" | "marginal-relief" | "main-rate";
  /** Tax before marginal relief (at the main rate, where relevant). */
  taxBeforeRelief: number;
  marginalRelief: number;
  tax: number;
  profitAfterTax: number;
  /** Overall tax as a proportion of profit. */
  effectiveRate: number;
  /**
   * Tax on the next £1 of profit. In the marginal relief band this is
   * meaningfully higher than the main rate, which is the single most useful
   * number for anyone deciding whether to bring income forward or defer it.
   */
  marginalRate: number;
};

export function calculateCorporationTax(
  input: CorporationTaxInput,
): CorporationTaxResult {
  const config = getTaxYear(input.taxYearId);
  const ct = config.corporationTax;

  const profit = Math.max(0, input.profit);
  const augmentedProfit = Math.max(profit, input.augmentedProfit ?? profit);
  const associates = Math.max(0, input.associatedCompanies ?? 0);
  const days = clamp(input.accountingPeriodDays ?? 365, 1, 365);

  const scale = days / 365 / (associates + 1);
  const lowerLimit = ct.lowerLimit * scale;
  const upperLimit = ct.upperLimit * scale;

  let basis: CorporationTaxResult["basis"];
  let taxBeforeRelief: number;
  let marginalRelief = 0;

  if (augmentedProfit <= lowerLimit) {
    basis = "small-profits";
    taxBeforeRelief = profit * ct.smallProfitsRate;
  } else if (augmentedProfit >= upperLimit) {
    basis = "main-rate";
    taxBeforeRelief = profit * ct.mainRate;
  } else {
    basis = "marginal-relief";
    taxBeforeRelief = profit * ct.mainRate;
    marginalRelief =
      ct.marginalReliefFraction *
      (upperLimit - augmentedProfit) *
      (profit / augmentedProfit);
  }

  const tax = Math.max(0, taxBeforeRelief - marginalRelief);

  return {
    taxYear: config,
    profit,
    lowerLimit,
    upperLimit,
    basis,
    taxBeforeRelief,
    marginalRelief,
    tax,
    profitAfterTax: profit - tax,
    effectiveRate: profit > 0 ? tax / profit : 0,
    marginalRate: marginalRateFor(profit, {
      lowerLimit,
      upperLimit,
      config,
    }),
  };
}

/**
 * Rate applied to the next pound of profit.
 *
 * Computed from the config rather than hard-coded, so it stays correct if the
 * rates or the relief fraction change. Within the marginal relief band this
 * works out at 26.5% on the current figures.
 */
function marginalRateFor(
  profit: number,
  ctx: { lowerLimit: number; upperLimit: number; config: TaxYearConfig },
): number {
  const ct = ctx.config.corporationTax;
  if (profit < ctx.lowerLimit) return ct.smallProfitsRate;
  if (profit >= ctx.upperLimit) return ct.mainRate;
  return ct.mainRate + ct.marginalReliefFraction;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function corporationTaxAssumptions(config: TaxYearConfig): string[] {
  const ct = config.corporationTax;
  return [
    `Small profits rate ${formatPercent(ct.smallProfitsRate)} on profits up to ${formatMoney(ct.lowerLimit)}.`,
    `Main rate ${formatPercent(ct.mainRate)} on profits of ${formatMoney(ct.upperLimit)} and above.`,
    `Marginal relief applies between those limits, giving an effective rate on the next pound of ${formatPercent(ct.mainRate + ct.marginalReliefFraction)}.`,
    "Limits are divided between associated companies and reduced for accounting periods shorter than 12 months.",
    "Assumes no losses brought forward, capital allowances, R&D relief, group relief or other adjustments.",
  ];
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(rate * 100 % 1 === 0 ? 0 : 1)}%`;
}

function formatMoney(value: number): string {
  return `£${value.toLocaleString("en-GB")}`;
}
