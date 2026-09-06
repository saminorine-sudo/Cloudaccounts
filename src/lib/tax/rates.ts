/**
 * UK TAX RATES CONFIGURATION
 * ==========================
 *
 * Every rate, threshold and allowance used anywhere in the calculators lives
 * in this file and nowhere else. No component, route or calculator contains a
 * hard-coded tax figure. When rates change at a Budget, a new `TaxYearConfig`
 * is added here and `DEFAULT_TAX_YEAR` is moved forward — nothing else needs
 * to be touched.
 *
 * -------------------------------------------------------------------------
 * PROVENANCE AND VERIFICATION STATUS
 * -------------------------------------------------------------------------
 * These figures were cross-checked across multiple independent UK tax
 * references for the 2026/27 tax year (which reflect the Autumn Budget 2025
 * changes, most notably the 2pp increase to the ordinary and upper dividend
 * rates).
 *
 * They have NOT been verified directly against GOV.UK, because gov.uk was
 * unreachable from the build environment at the time of writing.
 *
 * REQUIRED BEFORE PRODUCTION USE — confirm each block against the primary
 * source and set `verifiedAgainstGovUk: true`:
 *
 *   Income tax rates and allowances  https://www.gov.uk/income-tax-rates
 *   Dividend tax                     https://www.gov.uk/tax-on-dividends
 *   National Insurance rates         https://www.gov.uk/national-insurance-rates-letters
 *   Self-employed NI                 https://www.gov.uk/self-employed-national-insurance-rates
 *   Corporation Tax rates            https://www.gov.uk/corporation-tax-rates
 *   Marginal relief                  https://www.gov.uk/guidance/corporation-tax-marginal-relief
 *   VAT rates and thresholds         https://www.gov.uk/vat-registration/thresholds
 *
 * -------------------------------------------------------------------------
 * SCOPE LIMITS — these apply to every calculator built on this config
 * -------------------------------------------------------------------------
 *  • Income tax rates and bands are for ENGLAND, WALES and NORTHERN IRELAND.
 *    Scotland sets its own income tax bands and rates, which differ
 *    materially. Scottish taxpayers are told this in the calculator UI.
 *  • National Insurance is UK-wide and unaffected by the above.
 *  • The calculators assume a full tax year, one source of each income type,
 *    and no other reliefs or adjustments.
 *  • Student loan repayments, pension contributions, salary sacrifice,
 *    benefits in kind, the High Income Child Benefit Charge, Marriage
 *    Allowance, Blind Person's Allowance, capital allowances and losses
 *    brought forward are all OUT OF SCOPE and are disclosed as such.
 */

export type IncomeTaxConfig = {
  /** Standard tax-free personal allowance. */
  personalAllowance: number;
  /** Adjusted net income above which the allowance is withdrawn. */
  taperThreshold: number;
  /** Allowance lost per £1 of income above the threshold (£1 per £2 = 0.5). */
  taperRate: number;
  /** Taxable income (after allowances) taxed at the basic rate. */
  basicRateLimit: number;
  /** Taxable income above which the additional rate applies. */
  additionalRateThreshold: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
};

export type DividendConfig = {
  /** Nil-rate dividend allowance. Uses band space but is taxed at 0%. */
  allowance: number;
  ordinaryRate: number;
  upperRate: number;
  additionalRate: number;
};

export type NationalInsuranceConfig = {
  employee: {
    primaryThreshold: number;
    upperEarningsLimit: number;
    mainRate: number;
    upperRate: number;
  };
  employer: {
    secondaryThreshold: number;
    rate: number;
    /**
     * Employment Allowance. NOT available to a company whose only employee
     * paid above the secondary threshold is a single director — the most
     * common contractor setup — so calculators must not apply it by default.
     */
    employmentAllowance: number;
  };
  selfEmployed: {
    /** Above this, Class 2 is treated as paid without a contribution. */
    class2SmallProfitsThreshold: number;
    /** Voluntary weekly rate below the small profits threshold. */
    class2VoluntaryWeeklyRate: number;
    class4LowerProfitsLimit: number;
    class4UpperProfitsLimit: number;
    class4MainRate: number;
    class4UpperRate: number;
  };
};

export type CorporationTaxConfig = {
  smallProfitsRate: number;
  mainRate: number;
  /** Profits at or below this are charged at the small profits rate. */
  lowerLimit: number;
  /** Profits at or above this are charged at the main rate. */
  upperLimit: number;
  /** Standard marginal relief fraction. */
  marginalReliefFraction: number;
};

export type VatConfig = {
  standardRate: number;
  reducedRate: number;
  zeroRate: number;
  registrationThreshold: number;
  deregistrationThreshold: number;
};

export type TaxYearConfig = {
  /** Stable identifier, e.g. "2026-27". */
  id: string;
  /** Human label shown in the UI, e.g. "2026/27". */
  label: string;
  startsOn: string;
  endsOn: string;
  /** Income tax bands apply to this region only. */
  region: "england-wales-ni";
  /** Flip to true once each block has been checked against GOV.UK. */
  verifiedAgainstGovUk: boolean;
  incomeTax: IncomeTaxConfig;
  dividends: DividendConfig;
  nationalInsurance: NationalInsuranceConfig;
  corporationTax: CorporationTaxConfig;
  vat: VatConfig;
};

const TAX_YEAR_2026_27: TaxYearConfig = {
  id: "2026-27",
  label: "2026/27",
  startsOn: "2026-04-06",
  endsOn: "2027-04-05",
  region: "england-wales-ni",
  verifiedAgainstGovUk: false,

  incomeTax: {
    personalAllowance: 12570,
    taperThreshold: 100000,
    taperRate: 0.5,
    basicRateLimit: 37700,
    additionalRateThreshold: 125140,
    basicRate: 0.2,
    higherRate: 0.4,
    additionalRate: 0.45,
  },

  dividends: {
    allowance: 500,
    // Autumn Budget 2025 raised the ordinary and upper rates by 2pp for
    // 2026/27. The additional rate was left unchanged.
    ordinaryRate: 0.1075,
    upperRate: 0.3575,
    additionalRate: 0.3935,
  },

  nationalInsurance: {
    employee: {
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      mainRate: 0.08,
      upperRate: 0.02,
    },
    employer: {
      secondaryThreshold: 5000,
      rate: 0.15,
      employmentAllowance: 10500,
    },
    selfEmployed: {
      class2SmallProfitsThreshold: 7105,
      class2VoluntaryWeeklyRate: 3.65,
      class4LowerProfitsLimit: 12570,
      class4UpperProfitsLimit: 50270,
      class4MainRate: 0.06,
      class4UpperRate: 0.02,
    },
  },

  corporationTax: {
    smallProfitsRate: 0.19,
    mainRate: 0.25,
    lowerLimit: 50000,
    upperLimit: 250000,
    marginalReliefFraction: 3 / 200,
  },

  vat: {
    standardRate: 0.2,
    reducedRate: 0.05,
    zeroRate: 0,
    registrationThreshold: 90000,
    deregistrationThreshold: 88000,
  },
};

export const TAX_YEARS: Record<string, TaxYearConfig> = {
  [TAX_YEAR_2026_27.id]: TAX_YEAR_2026_27,
};

export const DEFAULT_TAX_YEAR = TAX_YEAR_2026_27.id;

export function getTaxYear(id: string = DEFAULT_TAX_YEAR): TaxYearConfig {
  const config = TAX_YEARS[id];
  if (!config) throw new Error(`Unknown tax year: ${id}`);
  return config;
}

export function listTaxYears(): TaxYearConfig[] {
  return Object.values(TAX_YEARS).sort((a, b) => b.id.localeCompare(a.id));
}

/**
 * Shown with every calculator result. Displayed, not buried — an estimate
 * presented without its assumptions is worse than no estimate.
 */
export const ESTIMATE_DISCLAIMER =
  "Estimate only. This calculator is a guide based on the rates shown and does not account for your full circumstances. It is not tax advice and should not be relied on for filing or planning decisions. Speak to an accountant before acting on it.";

export const REGION_DISCLAIMER =
  "Income tax rates and bands used here apply to England, Wales and Northern Ireland. Scotland sets different income tax rates and bands.";

export function taxYearAssumptions(config: TaxYearConfig): string[] {
  return [
    `Rates and thresholds for the ${config.label} UK tax year (${config.startsOn} to ${config.endsOn}).`,
    REGION_DISCLAIMER,
    "Assumes a full tax year and no other income, reliefs or adjustments.",
    "Excludes student loan repayments, pension contributions, salary sacrifice, benefits in kind and any other allowances or charges.",
  ];
}
