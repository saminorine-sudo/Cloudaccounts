import { getTaxYear, type TaxYearConfig } from "./rates";

/**
 * Core UK income tax and National Insurance engine.
 *
 * Pure functions only — no formatting, no React, no I/O — so the logic is
 * directly testable and reusable across every calculator.
 *
 * All amounts are annual, in pounds, and unrounded until presentation.
 */

export type TaxBandSlice = {
  label: string;
  /** Amount of income falling in this band. */
  amount: number;
  rate: number;
  tax: number;
};

/**
 * Splits an income range onto a set of ascending band boundaries.
 *
 * `start` and `end` are positions on the cumulative taxable-income axis, which
 * is what lets dividends be stacked correctly on top of other income.
 */
function sliceRange(
  start: number,
  end: number,
  bands: { label: string; upTo: number; rate: number }[],
): TaxBandSlice[] {
  const slices: TaxBandSlice[] = [];
  let lower = 0;

  for (const band of bands) {
    const upper = band.upTo;
    const amount = Math.max(0, Math.min(end, upper) - Math.max(start, lower));
    if (amount > 0) {
      slices.push({
        label: band.label,
        amount,
        rate: band.rate,
        tax: amount * band.rate,
      });
    }
    lower = upper;
    if (lower >= end) break;
  }

  return slices;
}

/**
 * Personal allowance after the high-income taper.
 *
 * The allowance is reduced by £1 for every £2 of adjusted net income above
 * the taper threshold, and is fully withdrawn once income reaches
 * threshold + (allowance / taperRate).
 */
export function personalAllowanceFor(
  totalIncome: number,
  config: TaxYearConfig,
): number {
  const { personalAllowance, taperThreshold, taperRate } = config.incomeTax;
  if (totalIncome <= taperThreshold) return personalAllowance;
  const reduction = (totalIncome - taperThreshold) * taperRate;
  return Math.max(0, personalAllowance - reduction);
}

export type IncomeTaxInput = {
  /** Salary, self-employment profit, pension, rent — anything non-dividend. */
  nonDividendIncome: number;
  /** Dividend income. Taxed as the top slice. */
  dividendIncome?: number;
  taxYearId?: string;
};

export type IncomeTaxResult = {
  taxYear: TaxYearConfig;
  totalIncome: number;
  personalAllowance: number;
  /** Allowance withdrawn by the high-income taper, if any. */
  personalAllowanceLost: number;
  taxableNonDividendIncome: number;
  taxableDividendIncome: number;
  /** Dividends covered by the nil-rate dividend allowance. */
  dividendAllowanceUsed: number;
  nonDividendBands: TaxBandSlice[];
  dividendBands: TaxBandSlice[];
  nonDividendTax: number;
  dividendTax: number;
  totalTax: number;
};

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const config = getTaxYear(input.taxYearId);
  const it = config.incomeTax;

  const nonDividendIncome = Math.max(0, input.nonDividendIncome);
  const dividendIncome = Math.max(0, input.dividendIncome ?? 0);
  const totalIncome = nonDividendIncome + dividendIncome;

  const personalAllowance = personalAllowanceFor(totalIncome, config);
  const personalAllowanceLost = it.personalAllowance - personalAllowance;

  // The allowance is set against non-dividend income first. That is the
  // allocation that produces the lowest liability in almost every case, and
  // it is what HMRC's own calculation does by default.
  const allowanceOnNonDividend = Math.min(personalAllowance, nonDividendIncome);
  const allowanceRemaining = personalAllowance - allowanceOnNonDividend;

  const taxableNonDividendIncome = nonDividendIncome - allowanceOnNonDividend;
  const taxableDividendIncome = Math.max(
    0,
    dividendIncome - allowanceRemaining,
  );

  const nonDividendBandDefs = [
    { label: "Basic rate", upTo: it.basicRateLimit, rate: it.basicRate },
    {
      label: "Higher rate",
      upTo: it.additionalRateThreshold,
      rate: it.higherRate,
    },
    {
      label: "Additional rate",
      upTo: Number.POSITIVE_INFINITY,
      rate: it.additionalRate,
    },
  ];

  const nonDividendBands = sliceRange(
    0,
    taxableNonDividendIncome,
    nonDividendBandDefs,
  );

  // Dividends stack on top of non-dividend income. The dividend allowance is
  // a nil-rate band: it consumes band space but carries no tax, so it shifts
  // the taxed portion of the dividends upward rather than exempting it.
  const dividendAllowanceUsed = Math.min(
    config.dividends.allowance,
    taxableDividendIncome,
  );
  const dividendStart = taxableNonDividendIncome + dividendAllowanceUsed;
  const dividendEnd = taxableNonDividendIncome + taxableDividendIncome;

  const dividendBands = sliceRange(dividendStart, dividendEnd, [
    {
      label: "Dividend ordinary rate",
      upTo: it.basicRateLimit,
      rate: config.dividends.ordinaryRate,
    },
    {
      label: "Dividend upper rate",
      upTo: it.additionalRateThreshold,
      rate: config.dividends.upperRate,
    },
    {
      label: "Dividend additional rate",
      upTo: Number.POSITIVE_INFINITY,
      rate: config.dividends.additionalRate,
    },
  ]);

  const nonDividendTax = sum(nonDividendBands.map((b) => b.tax));
  const dividendTax = sum(dividendBands.map((b) => b.tax));

  return {
    taxYear: config,
    totalIncome,
    personalAllowance,
    personalAllowanceLost,
    taxableNonDividendIncome,
    taxableDividendIncome,
    dividendAllowanceUsed,
    nonDividendBands,
    dividendBands,
    nonDividendTax,
    dividendTax,
    totalTax: nonDividendTax + dividendTax,
  };
}

/* -------------------------------------------------------------------------- */
/* National Insurance                                                         */
/* -------------------------------------------------------------------------- */

export type EmployeeNiResult = {
  mainBandEarnings: number;
  mainBandNi: number;
  upperBandEarnings: number;
  upperBandNi: number;
  total: number;
};

/**
 * Class 1 employee National Insurance on an annual basis.
 *
 * Note: for ordinary employees NI is assessed per pay period, so an annual
 * figure is an approximation where pay is uneven. For directors the annual
 * (cumulative) basis is the correct method, which is the case the
 * salary/dividend calculator is built around.
 */
export function calculateEmployeeNi(
  salary: number,
  taxYearId?: string,
): EmployeeNiResult {
  const { employee } = getTaxYear(taxYearId).nationalInsurance;
  const pay = Math.max(0, salary);

  const mainBandEarnings = Math.max(
    0,
    Math.min(pay, employee.upperEarningsLimit) - employee.primaryThreshold,
  );
  const upperBandEarnings = Math.max(0, pay - employee.upperEarningsLimit);

  const mainBandNi = mainBandEarnings * employee.mainRate;
  const upperBandNi = upperBandEarnings * employee.upperRate;

  return {
    mainBandEarnings,
    mainBandNi,
    upperBandEarnings,
    upperBandNi,
    total: mainBandNi + upperBandNi,
  };
}

export type EmployerNiResult = {
  liableEarnings: number;
  /** Liability before any Employment Allowance is applied. */
  grossNi: number;
  employmentAllowanceApplied: number;
  total: number;
};

/**
 * Class 1 employer National Insurance.
 *
 * `applyEmploymentAllowance` defaults to false. The Employment Allowance is
 * not available to a company whose only employee earning above the secondary
 * threshold is a single director, which is exactly the structure the
 * salary/dividend calculator models — so it must be opted into, never
 * assumed.
 */
export function calculateEmployerNi(
  salary: number,
  options?: { applyEmploymentAllowance?: boolean; taxYearId?: string },
): EmployerNiResult {
  const { employer } = getTaxYear(options?.taxYearId).nationalInsurance;
  const pay = Math.max(0, salary);

  const liableEarnings = Math.max(0, pay - employer.secondaryThreshold);
  const grossNi = liableEarnings * employer.rate;

  const employmentAllowanceApplied = options?.applyEmploymentAllowance
    ? Math.min(grossNi, employer.employmentAllowance)
    : 0;

  return {
    liableEarnings,
    grossNi,
    employmentAllowanceApplied,
    total: grossNi - employmentAllowanceApplied,
  };
}

export type SelfEmployedNiResult = {
  class4MainBandProfit: number;
  class4MainBandNi: number;
  class4UpperBandProfit: number;
  class4UpperBandNi: number;
  class4Total: number;
  /**
   * True when profits are at or above the small profits threshold, meaning
   * Class 2 is treated as paid and confers a qualifying year with no
   * contribution actually due.
   */
  class2TreatedAsPaid: boolean;
  /** What voluntary Class 2 would cost for a full year, if below the SPT. */
  class2VoluntaryAnnualCost: number;
  total: number;
};

export function calculateSelfEmployedNi(
  profit: number,
  taxYearId?: string,
): SelfEmployedNiResult {
  const { selfEmployed } = getTaxYear(taxYearId).nationalInsurance;
  const p = Math.max(0, profit);

  const class4MainBandProfit = Math.max(
    0,
    Math.min(p, selfEmployed.class4UpperProfitsLimit) -
      selfEmployed.class4LowerProfitsLimit,
  );
  const class4UpperBandProfit = Math.max(
    0,
    p - selfEmployed.class4UpperProfitsLimit,
  );

  const class4MainBandNi = class4MainBandProfit * selfEmployed.class4MainRate;
  const class4UpperBandNi = class4UpperBandProfit * selfEmployed.class4UpperRate;
  const class4Total = class4MainBandNi + class4UpperBandNi;

  return {
    class4MainBandProfit,
    class4MainBandNi,
    class4UpperBandProfit,
    class4UpperBandNi,
    class4Total,
    class2TreatedAsPaid: p >= selfEmployed.class2SmallProfitsThreshold,
    class2VoluntaryAnnualCost: selfEmployed.class2VoluntaryWeeklyRate * 52,
    // Class 2 is not charged above the small profits threshold, and below it
    // is voluntary — so it never adds to the amount actually due.
    total: class4Total,
  };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
