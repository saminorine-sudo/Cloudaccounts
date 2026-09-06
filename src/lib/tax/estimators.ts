import { calculateCorporationTax } from "./corporation-tax";
import {
  calculateEmployeeNi,
  calculateEmployerNi,
  calculateIncomeTax,
  calculateSelfEmployedNi,
  type IncomeTaxResult,
} from "./income-tax";
import { getTaxYear, type TaxYearConfig } from "./rates";

/* -------------------------------------------------------------------------- */
/* Self-employed / sole trader                                                */
/* -------------------------------------------------------------------------- */

export type SelfEmployedResult = {
  taxYear: TaxYearConfig;
  profit: number;
  incomeTax: IncomeTaxResult;
  nationalInsurance: ReturnType<typeof calculateSelfEmployedNi>;
  totalTax: number;
  takeHome: number;
  effectiveRate: number;
  /** Tax on the next £1 of profit — the number people actually plan with. */
  marginalRate: number;
};

/**
 * Income tax and Class 4 National Insurance on self-employment profit.
 *
 * `otherIncome` matters: it pushes profit into higher bands and can taper the
 * personal allowance, so leaving it out understates the liability for anyone
 * with employment income alongside a sole trade.
 */
export function estimateSelfEmployed(input: {
  profit: number;
  otherIncome?: number;
  taxYearId?: string;
}): SelfEmployedResult {
  const config = getTaxYear(input.taxYearId);
  const profit = Math.max(0, input.profit);
  const otherIncome = Math.max(0, input.otherIncome ?? 0);

  const incomeTax = calculateIncomeTax({
    nonDividendIncome: profit + otherIncome,
    taxYearId: input.taxYearId,
  });

  // Class 4 is charged on trading profit only, not on other income.
  const nationalInsurance = calculateSelfEmployedNi(profit, input.taxYearId);

  // Attribute only the income tax arising on the trading profit, so the
  // headline take-home figure describes the trade rather than all income.
  const incomeTaxWithoutTrade = calculateIncomeTax({
    nonDividendIncome: otherIncome,
    taxYearId: input.taxYearId,
  });
  const incomeTaxOnProfit = incomeTax.totalTax - incomeTaxWithoutTrade.totalTax;

  const totalTax = incomeTaxOnProfit + nationalInsurance.total;

  return {
    taxYear: config,
    profit,
    incomeTax,
    nationalInsurance,
    totalTax,
    takeHome: profit - totalTax,
    effectiveRate: profit > 0 ? totalTax / profit : 0,
    marginalRate: selfEmployedMarginalRate(profit + otherIncome, config),
  };
}

function selfEmployedMarginalRate(
  income: number,
  config: TaxYearConfig,
): number {
  const it = config.incomeTax;
  const ni = config.nationalInsurance.selfEmployed;

  const taxableIncome = Math.max(
    0,
    income -
      (income <= it.taperThreshold
        ? it.personalAllowance
        : Math.max(0, it.personalAllowance - (income - it.taperThreshold) * it.taperRate)),
  );

  let incomeTaxRate: number;
  if (taxableIncome <= 0) incomeTaxRate = 0;
  else if (taxableIncome <= it.basicRateLimit) incomeTaxRate = it.basicRate;
  else if (taxableIncome <= it.additionalRateThreshold)
    incomeTaxRate = it.higherRate;
  else incomeTaxRate = it.additionalRate;

  // Between the taper threshold and the point the allowance runs out, each
  // extra pound also costs 50p of allowance — the well-known 60% band.
  const allowanceFullyLostAt =
    it.taperThreshold + it.personalAllowance / it.taperRate;
  if (income > it.taperThreshold && income < allowanceFullyLostAt) {
    incomeTaxRate = it.higherRate * (1 + it.taperRate);
  }

  let niRate: number;
  if (income <= ni.class4LowerProfitsLimit) niRate = 0;
  else if (income <= ni.class4UpperProfitsLimit) niRate = ni.class4MainRate;
  else niRate = ni.class4UpperRate;

  return incomeTaxRate + niRate;
}

/* -------------------------------------------------------------------------- */
/* Employed take-home pay                                                     */
/* -------------------------------------------------------------------------- */

export type TakeHomeResult = {
  taxYear: TaxYearConfig;
  grossSalary: number;
  incomeTax: IncomeTaxResult;
  nationalInsurance: ReturnType<typeof calculateEmployeeNi>;
  totalDeductions: number;
  takeHomeAnnual: number;
  takeHomeMonthly: number;
  takeHomeWeekly: number;
  effectiveRate: number;
};

/**
 * Take-home pay on a salary.
 *
 * Excludes student loan repayments, pension contributions, salary sacrifice
 * and benefits in kind. The UI states this — an unqualified "take-home" figure
 * that ignores a student loan is wrong for a large share of the audience.
 */
export function estimateTakeHome(input: {
  grossSalary: number;
  taxYearId?: string;
}): TakeHomeResult {
  const config = getTaxYear(input.taxYearId);
  const grossSalary = Math.max(0, input.grossSalary);

  const incomeTax = calculateIncomeTax({
    nonDividendIncome: grossSalary,
    taxYearId: input.taxYearId,
  });
  const nationalInsurance = calculateEmployeeNi(grossSalary, input.taxYearId);

  const totalDeductions = incomeTax.totalTax + nationalInsurance.total;
  const takeHomeAnnual = grossSalary - totalDeductions;

  return {
    taxYear: config,
    grossSalary,
    incomeTax,
    nationalInsurance,
    totalDeductions,
    takeHomeAnnual,
    takeHomeMonthly: takeHomeAnnual / 12,
    takeHomeWeekly: takeHomeAnnual / 52,
    effectiveRate: grossSalary > 0 ? totalDeductions / grossSalary : 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Salary and dividend split for director-shareholders                        */
/* -------------------------------------------------------------------------- */

export type SalaryDividendResult = {
  taxYear: TaxYearConfig;
  companyProfitBeforeSalary: number;
  salary: number;
  dividendsTaken: number;

  employerNi: ReturnType<typeof calculateEmployerNi>;
  profitAfterSalaryAndNi: number;
  corporationTax: ReturnType<typeof calculateCorporationTax>;
  /** Post-tax profit available to distribute in the period. */
  distributableProfit: number;
  /** True when the dividends requested exceed distributable profit. */
  exceedsDistributableProfit: boolean;

  employeeNi: ReturnType<typeof calculateEmployeeNi>;
  incomeTax: IncomeTaxResult;

  personalTax: number;
  totalTaxAndNi: number;
  takeHome: number;
  /** Total tax and NI as a proportion of company profit before salary. */
  effectiveRate: number;
  retainedInCompany: number;
};

/**
 * Models a director-shareholder taking a salary plus dividends from their own
 * company, following the money the whole way through:
 *
 *   profit → salary and employer NI (deductible) → Corporation Tax →
 *   distributable profit → dividends → personal income tax and employee NI
 *
 * `applyEmploymentAllowance` defaults to false because the allowance is not
 * available where the only employee paid above the secondary threshold is a
 * single director.
 */
export function estimateSalaryDividend(input: {
  companyProfitBeforeSalary: number;
  salary: number;
  /** Dividends to take. Omit to distribute all available post-tax profit. */
  dividends?: number;
  otherPersonalIncome?: number;
  applyEmploymentAllowance?: boolean;
  associatedCompanies?: number;
  taxYearId?: string;
}): SalaryDividendResult {
  const config = getTaxYear(input.taxYearId);

  const companyProfitBeforeSalary = Math.max(0, input.companyProfitBeforeSalary);
  const salary = Math.max(0, Math.min(input.salary, companyProfitBeforeSalary));
  const otherPersonalIncome = Math.max(0, input.otherPersonalIncome ?? 0);

  const employerNi = calculateEmployerNi(salary, {
    applyEmploymentAllowance: input.applyEmploymentAllowance,
    taxYearId: input.taxYearId,
  });

  // Salary and employer NI are deductible against Corporation Tax.
  const profitAfterSalaryAndNi = Math.max(
    0,
    companyProfitBeforeSalary - salary - employerNi.total,
  );

  const corporationTax = calculateCorporationTax({
    profit: profitAfterSalaryAndNi,
    associatedCompanies: input.associatedCompanies,
    taxYearId: input.taxYearId,
  });

  const distributableProfit = corporationTax.profitAfterTax;
  const requestedDividends = input.dividends ?? distributableProfit;
  const dividendsTaken = Math.max(0, requestedDividends);
  const exceedsDistributableProfit = dividendsTaken > distributableProfit + 0.5;

  const employeeNi = calculateEmployeeNi(salary, input.taxYearId);
  const incomeTax = calculateIncomeTax({
    nonDividendIncome: salary + otherPersonalIncome,
    dividendIncome: dividendsTaken,
    taxYearId: input.taxYearId,
  });

  const personalTax = incomeTax.totalTax + employeeNi.total;
  const totalTaxAndNi =
    corporationTax.tax + employerNi.total + personalTax;

  // Take-home describes what the director receives from the company, so any
  // other personal income and the tax on it is excluded from the headline.
  const incomeTaxOnOtherIncomeAlone = calculateIncomeTax({
    nonDividendIncome: otherPersonalIncome,
    taxYearId: input.taxYearId,
  }).totalTax;
  const takeHome =
    salary +
    dividendsTaken -
    (incomeTax.totalTax - incomeTaxOnOtherIncomeAlone) -
    employeeNi.total;

  return {
    taxYear: config,
    companyProfitBeforeSalary,
    salary,
    dividendsTaken,
    employerNi,
    profitAfterSalaryAndNi,
    corporationTax,
    distributableProfit,
    exceedsDistributableProfit,
    employeeNi,
    incomeTax,
    personalTax,
    totalTaxAndNi,
    takeHome,
    effectiveRate:
      companyProfitBeforeSalary > 0
        ? totalTaxAndNi / companyProfitBeforeSalary
        : 0,
    retainedInCompany: Math.max(0, distributableProfit - dividendsTaken),
  };
}

/**
 * Salary levels worth comparing for a director-shareholder.
 *
 * These are presented as reference points to model, not recommendations —
 * the right salary depends on NI record, other income, the Employment
 * Allowance position and pension planning, none of which a calculator sees.
 */
export function suggestedDirectorSalaries(
  config: TaxYearConfig,
): { label: string; salary: number; note: string }[] {
  const ni = config.nationalInsurance;
  return [
    {
      label: "Secondary threshold",
      salary: ni.employer.secondaryThreshold,
      note: "The point at which employer National Insurance starts.",
    },
    {
      label: "Personal allowance",
      salary: config.incomeTax.personalAllowance,
      note: "Uses the full personal allowance against salary.",
    },
    {
      label: "Higher rate threshold",
      salary: ni.employee.upperEarningsLimit,
      note: "The top of the basic rate band.",
    },
  ];
}
