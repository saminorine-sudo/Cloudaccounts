import { describe, expect, it } from "vitest";

import { calculateCorporationTax } from "./corporation-tax";
import {
  estimateSalaryDividend,
  estimateSelfEmployed,
  estimateTakeHome,
} from "./estimators";
import {
  calculateEmployeeNi,
  calculateEmployerNi,
  calculateIncomeTax,
  calculateSelfEmployedNi,
  personalAllowanceFor,
} from "./income-tax";
import { getTaxYear } from "./rates";
import { calculateVat, checkVatThreshold } from "./vat";

const config = getTaxYear();
const p = (value: number) => Math.round(value * 100) / 100;

describe("personal allowance taper", () => {
  it("gives the full allowance below the taper threshold", () => {
    expect(personalAllowanceFor(50_000, config)).toBe(12_570);
    expect(personalAllowanceFor(100_000, config)).toBe(12_570);
  });

  it("withdraws £1 for every £2 above the threshold", () => {
    expect(personalAllowanceFor(110_000, config)).toBe(7_570);
    expect(personalAllowanceFor(120_000, config)).toBe(2_570);
  });

  it("removes the allowance entirely at £125,140", () => {
    expect(personalAllowanceFor(125_140, config)).toBe(0);
    expect(personalAllowanceFor(200_000, config)).toBe(0);
  });
});

describe("income tax on salary only", () => {
  it("charges nothing within the personal allowance", () => {
    expect(calculateIncomeTax({ nonDividendIncome: 12_570 }).totalTax).toBe(0);
  });

  it("charges basic rate to the top of the band", () => {
    // £50,270 − £12,570 allowance = £37,700 taxable, all at 20%.
    expect(calculateIncomeTax({ nonDividendIncome: 50_270 }).totalTax).toBe(
      7_540,
    );
  });

  it("charges higher rate above the basic rate band", () => {
    // £7,540 basic + £9,730 at 40% = £11,432.
    expect(calculateIncomeTax({ nonDividendIncome: 60_000 }).totalTax).toBe(
      11_432,
    );
  });

  it("handles the tapered allowance at £100,000", () => {
    // Allowance intact: taxable £87,430 → £7,540 + £19,892.
    expect(calculateIncomeTax({ nonDividendIncome: 100_000 }).totalTax).toBe(
      27_432,
    );
  });

  it("charges additional rate above £125,140", () => {
    // No allowance. £37,700 @ 20% + £87,440 @ 40% + £24,860 @ 45%.
    const result = calculateIncomeTax({ nonDividendIncome: 150_000 });
    expect(p(result.totalTax)).toBe(p(7_540 + 34_976 + 11_187));
    expect(result.personalAllowance).toBe(0);
  });
});

describe("dividend taxation", () => {
  it("taxes dividends as the top slice, above salary", () => {
    // Salary uses the whole allowance; £500 dividend allowance is a nil-rate
    // band that still consumes basic-rate space.
    const result = calculateIncomeTax({
      nonDividendIncome: 12_570,
      dividendIncome: 50_000,
    });

    expect(result.dividendAllowanceUsed).toBe(500);
    // £37,200 at the ordinary rate, £12,300 at the upper rate.
    expect(p(result.dividendTax)).toBe(p(37_200 * 0.1075 + 12_300 * 0.3575));
    expect(result.nonDividendTax).toBe(0);
  });

  it("charges no tax on dividends inside the allowance", () => {
    const result = calculateIncomeTax({
      nonDividendIncome: 12_570,
      dividendIncome: 500,
    });
    expect(result.dividendTax).toBe(0);
  });

  it("uses unused personal allowance against dividends", () => {
    // Salary of £5,000 leaves £7,570 of allowance to cover dividends.
    const result = calculateIncomeTax({
      nonDividendIncome: 5_000,
      dividendIncome: 10_000,
    });
    expect(result.taxableDividendIncome).toBe(10_000 - 7_570);
  });

  it("counts dividends towards the allowance taper", () => {
    const result = calculateIncomeTax({
      nonDividendIncome: 60_000,
      dividendIncome: 50_000,
    });
    expect(result.personalAllowance).toBe(7_570);
  });
});

describe("national insurance", () => {
  it("charges employee NI between the thresholds", () => {
    expect(p(calculateEmployeeNi(50_270).total)).toBe(p(37_700 * 0.08));
  });

  it("charges the reduced rate above the upper earnings limit", () => {
    expect(p(calculateEmployeeNi(60_000).total)).toBe(
      p(37_700 * 0.08 + 9_730 * 0.02),
    );
  });

  it("charges no employee NI below the primary threshold", () => {
    expect(calculateEmployeeNi(12_570).total).toBe(0);
  });

  it("charges employer NI above the secondary threshold", () => {
    expect(p(calculateEmployerNi(30_000).total)).toBe(p(25_000 * 0.15));
  });

  it("does not apply the employment allowance unless asked", () => {
    expect(calculateEmployerNi(30_000).employmentAllowanceApplied).toBe(0);
    expect(
      calculateEmployerNi(30_000, { applyEmploymentAllowance: true })
        .employmentAllowanceApplied,
    ).toBeGreaterThan(0);
  });

  it("never refunds more employment allowance than the liability", () => {
    const result = calculateEmployerNi(10_000, {
      applyEmploymentAllowance: true,
    });
    expect(result.total).toBe(0);
  });

  it("charges Class 4 on self-employed profit", () => {
    expect(p(calculateSelfEmployedNi(60_000).class4Total)).toBe(
      p(37_700 * 0.06 + 9_730 * 0.02),
    );
  });

  it("treats Class 2 as paid above the small profits threshold", () => {
    expect(calculateSelfEmployedNi(20_000).class2TreatedAsPaid).toBe(true);
    expect(calculateSelfEmployedNi(5_000).class2TreatedAsPaid).toBe(false);
    // Class 2 is voluntary below the threshold, so nothing is actually due.
    expect(calculateSelfEmployedNi(5_000).total).toBe(0);
  });
});

describe("corporation tax", () => {
  it("applies the small profits rate up to the lower limit", () => {
    expect(calculateCorporationTax({ profit: 40_000 }).tax).toBe(7_600);
    expect(calculateCorporationTax({ profit: 50_000 }).basis).toBe(
      "small-profits",
    );
  });

  it("applies the main rate at and above the upper limit", () => {
    expect(calculateCorporationTax({ profit: 250_000 }).tax).toBe(62_500);
    expect(calculateCorporationTax({ profit: 300_000 }).tax).toBe(75_000);
  });

  it("applies marginal relief between the limits", () => {
    // 25% of £100,000 less 3/200 × (£250,000 − £100,000).
    const result = calculateCorporationTax({ profit: 100_000 });
    expect(result.basis).toBe("marginal-relief");
    expect(p(result.marginalRelief)).toBe(2_250);
    expect(p(result.tax)).toBe(22_750);
    expect(p(result.effectiveRate * 100)).toBe(22.75);
  });

  it("reports a 26.5% marginal rate inside the relief band", () => {
    expect(p(calculateCorporationTax({ profit: 100_000 }).marginalRate * 100)).toBe(
      26.5,
    );
  });

  it("divides the limits between associated companies", () => {
    // One associate halves the limits to £25,000 and £125,000.
    const result = calculateCorporationTax({
      profit: 40_000,
      associatedCompanies: 1,
    });
    expect(result.lowerLimit).toBe(25_000);
    expect(result.upperLimit).toBe(125_000);
    expect(result.basis).toBe("marginal-relief");
    expect(p(result.tax)).toBe(p(10_000 - 0.015 * 85_000));
  });

  it("pro-rates the limits for a short accounting period", () => {
    const result = calculateCorporationTax({
      profit: 30_000,
      accountingPeriodDays: 182,
    });
    expect(p(result.lowerLimit)).toBe(p(50_000 * (182 / 365)));
  });

  it("is continuous at the band boundaries", () => {
    const atLower = calculateCorporationTax({ profit: 50_000 }).tax;
    const justAbove = calculateCorporationTax({ profit: 50_001 }).tax;
    expect(justAbove - atLower).toBeLessThan(1);

    const justBelowUpper = calculateCorporationTax({ profit: 249_999 }).tax;
    const atUpper = calculateCorporationTax({ profit: 250_000 }).tax;
    expect(atUpper - justBelowUpper).toBeLessThan(1);
  });

  it("charges nothing on nil profit", () => {
    expect(calculateCorporationTax({ profit: 0 }).tax).toBe(0);
  });
});

describe("vat", () => {
  it("adds VAT to a net amount", () => {
    const result = calculateVat({ amount: 1_000, direction: "add" });
    expect(result.vat).toBe(200);
    expect(result.gross).toBe(1_200);
  });

  it("extracts VAT from a gross amount", () => {
    const result = calculateVat({ amount: 1_200, direction: "remove" });
    expect(p(result.net)).toBe(1_000);
    expect(p(result.vat)).toBe(200);
  });

  it("round-trips add and remove", () => {
    const added = calculateVat({ amount: 837.42, direction: "add" });
    const removed = calculateVat({ amount: added.gross, direction: "remove" });
    expect(p(removed.net)).toBe(p(837.42));
  });

  it("supports the reduced and zero rates", () => {
    expect(
      calculateVat({ amount: 100, direction: "add", rateKey: "reduced" }).vat,
    ).toBe(5);
    expect(
      calculateVat({ amount: 100, direction: "add", rateKey: "zero" }).vat,
    ).toBe(0);
  });

  it("flags turnover above the registration threshold", () => {
    expect(checkVatThreshold(95_000).mustRegister).toBe(true);
    expect(checkVatThreshold(50_000).mustRegister).toBe(false);
  });

  it("warns when approaching the threshold", () => {
    expect(checkVatThreshold(85_000).approaching).toBe(true);
    expect(checkVatThreshold(40_000).approaching).toBe(false);
  });
});

describe("self-employed estimator", () => {
  it("combines income tax and Class 4 NI", () => {
    const result = estimateSelfEmployed({ profit: 60_000 });
    expect(p(result.totalTax)).toBe(p(11_432 + 37_700 * 0.06 + 9_730 * 0.02));
    expect(p(result.takeHome)).toBe(p(60_000 - result.totalTax));
  });

  it("charges nothing on profit within the allowance", () => {
    expect(estimateSelfEmployed({ profit: 10_000 }).totalTax).toBe(0);
  });

  it("accounts for other income pushing profit into higher bands", () => {
    const alone = estimateSelfEmployed({ profit: 20_000 });
    const withSalary = estimateSelfEmployed({
      profit: 20_000,
      otherIncome: 45_000,
    });
    expect(withSalary.totalTax).toBeGreaterThan(alone.totalTax);
  });
});

describe("take-home pay", () => {
  it("deducts income tax and employee NI", () => {
    const result = estimateTakeHome({ grossSalary: 35_000 });
    const expectedTax = (35_000 - 12_570) * 0.2;
    const expectedNi = (35_000 - 12_570) * 0.08;
    expect(p(result.incomeTax.totalTax)).toBe(p(expectedTax));
    expect(p(result.nationalInsurance.total)).toBe(p(expectedNi));
    expect(p(result.takeHomeAnnual)).toBe(p(35_000 - expectedTax - expectedNi));
  });

  it("derives monthly pay from the annual figure", () => {
    const result = estimateTakeHome({ grossSalary: 48_000 });
    expect(p(result.takeHomeMonthly)).toBe(p(result.takeHomeAnnual / 12));
  });
});

describe("salary and dividend split", () => {
  it("follows profit through corporation tax to the director", () => {
    const result = estimateSalaryDividend({
      companyProfitBeforeSalary: 100_000,
      salary: 12_570,
    });

    const employerNi = (12_570 - 5_000) * 0.15;
    expect(p(result.employerNi.total)).toBe(p(employerNi));
    expect(p(result.profitAfterSalaryAndNi)).toBe(
      p(100_000 - 12_570 - employerNi),
    );
    // Dividends default to the full distributable profit.
    expect(p(result.dividendsTaken)).toBe(p(result.distributableProfit));
    expect(result.retainedInCompany).toBe(0);
  });

  it("treats salary and employer NI as deductible for corporation tax", () => {
    const lowSalary = estimateSalaryDividend({
      companyProfitBeforeSalary: 80_000,
      salary: 12_570,
    });
    const highSalary = estimateSalaryDividend({
      companyProfitBeforeSalary: 80_000,
      salary: 50_000,
    });
    expect(highSalary.corporationTax.tax).toBeLessThan(
      lowSalary.corporationTax.tax,
    );
  });

  it("flags dividends beyond distributable profit", () => {
    const result = estimateSalaryDividend({
      companyProfitBeforeSalary: 60_000,
      salary: 12_570,
      dividends: 200_000,
    });
    expect(result.exceedsDistributableProfit).toBe(true);
  });

  it("retains undistributed profit in the company", () => {
    const result = estimateSalaryDividend({
      companyProfitBeforeSalary: 100_000,
      salary: 12_570,
      dividends: 10_000,
    });
    expect(p(result.retainedInCompany)).toBe(
      p(result.distributableProfit - 10_000),
    );
  });

  it("never reports take-home above company profit", () => {
    const result = estimateSalaryDividend({
      companyProfitBeforeSalary: 150_000,
      salary: 12_570,
    });
    expect(result.takeHome).toBeLessThan(150_000);
    expect(p(result.takeHome + result.totalTaxAndNi)).toBe(p(150_000));
  });

  it("caps salary at available profit", () => {
    const result = estimateSalaryDividend({
      companyProfitBeforeSalary: 20_000,
      salary: 50_000,
    });
    expect(result.salary).toBe(20_000);
  });
});
