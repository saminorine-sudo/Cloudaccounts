"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalculatorShell,
  HeadlineResult,
  MoneyInput,
  OptionToggle,
  ResultRow,
  SplitBar,
} from "@/components/calculators/shell";
import { Alert } from "@/components/ui/feedback";
import { track } from "@/lib/analytics";
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatPercent,
} from "@/lib/format";
import { calculateCorporationTax } from "@/lib/tax/corporation-tax";
import {
  estimateSalaryDividend,
  estimateSelfEmployed,
  estimateTakeHome,
} from "@/lib/tax/estimators";
import { getTaxYear, taxYearAssumptions } from "@/lib/tax/rates";
import { calculateVat, checkVatThreshold, vatRateOptions } from "@/lib/tax/vat";

const config = getTaxYear();
const baseAssumptions = taxYearAssumptions(config);

/**
 * Records that a calculator was used — never what was entered.
 * Debounced so dragging a number does not fire an event per keystroke.
 */
function useUsageTracking(calculator: string, trigger: unknown) {
  useEffect(() => {
    const timer = setTimeout(
      () => track({ name: "calculator_used", calculator }),
      1500,
    );
    return () => clearTimeout(timer);
  }, [calculator, trigger]);
}

/* -------------------------------------------------------------------------- */
/* Corporation Tax                                                            */
/* -------------------------------------------------------------------------- */

export function CorporationTaxCalculator() {
  const [profit, setProfit] = useState(60_000);
  const [associates, setAssociates] = useState<"0" | "1" | "2">("0");

  const result = useMemo(
    () =>
      calculateCorporationTax({
        profit,
        associatedCompanies: Number(associates),
      }),
    [profit, associates],
  );

  useUsageTracking("corporation-tax", profit);

  const basisLabel = {
    "small-profits": "Small profits rate",
    "marginal-relief": "Marginal relief applies",
    "main-rate": "Main rate",
  }[result.basis];

  return (
    <CalculatorShell
      title="Corporation Tax estimator"
      description="Estimate the Corporation Tax due on your company's taxable profit, including marginal relief between the lower and upper limits."
      taxYear={config}
      assumptions={[
        ...baseAssumptions,
        "Assumes taxable total profits after all adjustments — not turnover, and not profit before allowable expenses.",
        "Excludes losses brought forward, capital allowances, R&D relief and group relief.",
        "Assumes a 12-month accounting period.",
      ]}
      inputs={
        <>
          <MoneyInput
            label="Annual taxable profit"
            hint="Profit after allowable business expenses."
            value={profit}
            onChange={setProfit}
          />

          <OptionToggle
            name="associates"
            label="Other associated companies"
            value={associates}
            onChange={setAssociates}
            options={[
              { value: "0", label: "None" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
            ]}
          />

          <Alert tone="info">
            The lower and upper limits are shared between associated companies,
            which can push a small company into the marginal relief band.
          </Alert>
        </>
      }
      results={
        <>
          <HeadlineResult
            label="Estimated Corporation Tax"
            value={formatCurrency(result.tax)}
            sublabel={`${basisLabel} · effective rate ${formatPercent(result.effectiveRate)}`}
          />

          <div className="mt-6">
            <ResultRow label="Taxable profit" value={formatCurrency(profit)} />
            {result.marginalRelief > 0 ? (
              <>
                <ResultRow
                  label="Tax at the main rate"
                  value={formatCurrency(result.taxBeforeRelief)}
                />
                <ResultRow
                  label="Less marginal relief"
                  value={`− ${formatCurrency(result.marginalRelief)}`}
                />
              </>
            ) : null}
            <ResultRow
              label="Corporation Tax"
              value={formatCurrency(result.tax)}
              emphasis
            />
            <ResultRow
              label="Profit after tax"
              value={formatCurrency(result.profitAfterTax)}
            />
            <ResultRow
              label="Tax on your next £1 of profit"
              value={formatPercent(result.marginalRate)}
              note="The rate that matters when deciding whether to bring costs forward."
            />
          </div>

          <SplitBar
            total={profit}
            segments={[
              {
                label: "Retained",
                value: result.profitAfterTax,
                className: "bg-brand-600",
              },
              { label: "Tax", value: result.tax, className: "bg-slate-400" },
            ]}
          />
        </>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* VAT                                                                        */
/* -------------------------------------------------------------------------- */

export function VatCalculator() {
  const [amount, setAmount] = useState(1_000);
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [rateKey, setRateKey] = useState<"standard" | "reduced" | "zero">(
    "standard",
  );

  const result = useMemo(
    () => calculateVat({ amount, direction, rateKey }),
    [amount, direction, rateKey],
  );

  useUsageTracking("vat", amount);

  const rateOption = vatRateOptions(config).find((o) => o.key === rateKey)!;

  return (
    <CalculatorShell
      title="VAT calculator"
      description="Add VAT to a net figure, or work out the VAT contained in a gross figure."
      taxYear={config}
      assumptions={[
        `Rates for the ${config.label} tax year.`,
        "Assumes the supply is taxable at the selected rate. Whether a specific supply is standard-rated, reduced-rated, zero-rated or exempt is a question of liability, which this tool does not determine.",
        "Zero-rated is not the same as exempt: zero-rated supplies count towards your taxable turnover, exempt supplies do not.",
      ]}
      ctaLabel="Not sure which rate applies? Talk to an accountant."
      inputs={
        <>
          <OptionToggle
            name="vat-direction"
            label="What would you like to do?"
            value={direction}
            onChange={setDirection}
            options={[
              { value: "add", label: "Add VAT" },
              { value: "remove", label: "Remove VAT" },
            ]}
          />

          <MoneyInput
            label={direction === "add" ? "Net amount" : "Gross amount"}
            hint={
              direction === "add"
                ? "The price before VAT."
                : "The price including VAT."
            }
            value={amount}
            onChange={setAmount}
          />

          <OptionToggle
            name="vat-rate"
            label="VAT rate"
            value={rateKey}
            onChange={setRateKey}
            options={[
              { value: "standard", label: "20%" },
              { value: "reduced", label: "5%" },
              { value: "zero", label: "0%" },
            ]}
          />

          <p className="text-xs leading-relaxed text-muted">
            {rateOption.hint}
          </p>
        </>
      }
      results={
        <>
          <HeadlineResult
            label={direction === "add" ? "Gross amount" : "Net amount"}
            value={formatCurrencyPrecise(
              direction === "add" ? result.gross : result.net,
            )}
            sublabel={`VAT at ${formatPercent(result.rate, 0)}`}
          />

          <div className="mt-6">
            <ResultRow
              label="Net (excluding VAT)"
              value={formatCurrencyPrecise(result.net)}
            />
            <ResultRow label="VAT" value={formatCurrencyPrecise(result.vat)} />
            <ResultRow
              label="Gross (including VAT)"
              value={formatCurrencyPrecise(result.gross)}
              emphasis
            />
          </div>

          <VatThresholdChecker />
        </>
      }
    />
  );
}

function VatThresholdChecker() {
  const [turnover, setTurnover] = useState(70_000);
  const check = useMemo(() => checkVatThreshold(turnover), [turnover]);

  return (
    <div className="mt-7 border-t border-line pt-6">
      <h3 className="text-sm font-semibold text-ink">
        Registration threshold check
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Enter your VAT-taxable turnover for the last rolling twelve months.
      </p>

      <div className="mt-3">
        <MoneyInput
          label="Rolling 12-month taxable turnover"
          value={turnover}
          onChange={setTurnover}
        />
      </div>

      <Alert
        tone={check.mustRegister ? "warning" : check.approaching ? "warning" : "info"}
        className="mt-4"
      >
        {check.message} This checks the backward-looking test only — you must
        also register if you expect to exceed the threshold in the next 30 days
        on its own.
      </Alert>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Self-employed                                                              */
/* -------------------------------------------------------------------------- */

export function SelfEmployedCalculator() {
  const [profit, setProfit] = useState(45_000);
  const [otherIncome, setOtherIncome] = useState(0);

  const result = useMemo(
    () => estimateSelfEmployed({ profit, otherIncome }),
    [profit, otherIncome],
  );

  useUsageTracking("self-employed", profit);

  return (
    <CalculatorShell
      title="Self-employed tax estimator"
      description="Estimate the Income Tax and Class 4 National Insurance on your self-employment profit."
      taxYear={config}
      assumptions={[
        ...baseAssumptions,
        "Profit means income after allowable business expenses, not turnover.",
        "Class 2 National Insurance is treated as paid where profits are above the small profits threshold, so it adds nothing to the amount due.",
        "Excludes payments on account, which affect when you pay rather than how much.",
      ]}
      inputs={
        <>
          <MoneyInput
            label="Annual profit from self-employment"
            hint="Turnover less allowable business expenses."
            value={profit}
            onChange={setProfit}
          />

          <MoneyInput
            label="Other income this tax year"
            hint="Employment, pension or rental income. This pushes your profit into higher bands."
            value={otherIncome}
            onChange={setOtherIncome}
          />
        </>
      }
      results={
        <>
          <HeadlineResult
            label="Estimated tax and National Insurance"
            value={formatCurrency(result.totalTax)}
            sublabel={`Effective rate on profit ${formatPercent(result.effectiveRate)}`}
          />

          <div className="mt-6">
            <ResultRow label="Profit" value={formatCurrency(profit)} />
            <ResultRow
              label="Income Tax on this profit"
              value={formatCurrency(
                result.totalTax - result.nationalInsurance.total,
              )}
            />
            <ResultRow
              label="Class 4 National Insurance"
              value={formatCurrency(result.nationalInsurance.class4Total)}
            />
            <ResultRow
              label="Total due"
              value={formatCurrency(result.totalTax)}
              emphasis
            />
            <ResultRow
              label="Profit after tax"
              value={formatCurrency(result.takeHome)}
            />
            <ResultRow
              label="Tax on your next £1 of profit"
              value={formatPercent(result.marginalRate)}
            />
          </div>

          {!result.nationalInsurance.class2TreatedAsPaid && profit > 0 ? (
            <Alert tone="info" className="mt-5">
              Your profit is below the Class 2 small profits threshold. Class 2
              is not due, but you can pay it voluntarily (around{" "}
              {formatCurrency(
                result.nationalInsurance.class2VoluntaryAnnualCost,
              )}{" "}
              a year) to protect your State Pension record.
            </Alert>
          ) : null}

          <SplitBar
            total={profit}
            segments={[
              {
                label: "Keep",
                value: Math.max(0, result.takeHome),
                className: "bg-brand-600",
              },
              {
                label: "Tax & NI",
                value: result.totalTax,
                className: "bg-slate-400",
              },
            ]}
          />
        </>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Take-home pay                                                              */
/* -------------------------------------------------------------------------- */

export function TakeHomeCalculator() {
  const [salary, setSalary] = useState(40_000);
  const result = useMemo(
    () => estimateTakeHome({ grossSalary: salary }),
    [salary],
  );

  useUsageTracking("take-home", salary);

  return (
    <CalculatorShell
      title="Take-home pay calculator"
      description="Estimate what lands in your account from a salary, after Income Tax and employee National Insurance."
      taxYear={config}
      assumptions={[
        ...baseAssumptions,
        "Excludes student loan repayments, pension contributions, salary sacrifice and benefits in kind — any of these will change the figure.",
        "Assumes a standard tax code and a full year on the same salary.",
      ]}
      inputs={
        <MoneyInput
          label="Gross annual salary"
          value={salary}
          onChange={setSalary}
        />
      }
      results={
        <>
          <HeadlineResult
            label="Estimated take-home pay"
            value={formatCurrency(result.takeHomeMonthly)}
            sublabel={`per month · ${formatCurrency(result.takeHomeAnnual)} a year`}
          />

          <div className="mt-6">
            <ResultRow label="Gross salary" value={formatCurrency(salary)} />
            <ResultRow
              label="Income Tax"
              value={`− ${formatCurrency(result.incomeTax.totalTax)}`}
            />
            <ResultRow
              label="Employee National Insurance"
              value={`− ${formatCurrency(result.nationalInsurance.total)}`}
            />
            <ResultRow
              label="Take-home pay"
              value={formatCurrency(result.takeHomeAnnual)}
              emphasis
            />
            <ResultRow
              label="Effective deduction rate"
              value={formatPercent(result.effectiveRate)}
            />
          </div>

          {result.incomeTax.personalAllowanceLost > 0 ? (
            <Alert tone="warning" className="mt-5">
              At this salary you lose{" "}
              {formatCurrency(result.incomeTax.personalAllowanceLost)} of your
              personal allowance. Between £100,000 and £125,140 each extra pound
              is effectively taxed at 60%, which is where pension contributions
              are often worth reviewing.
            </Alert>
          ) : null}

          <SplitBar
            total={salary}
            segments={[
              {
                label: "Take-home",
                value: result.takeHomeAnnual,
                className: "bg-brand-600",
              },
              {
                label: "Tax",
                value: result.incomeTax.totalTax,
                className: "bg-slate-400",
              },
              {
                label: "NI",
                value: result.nationalInsurance.total,
                className: "bg-slate-300",
              },
            ]}
          />
        </>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Salary and dividends                                                       */
/* -------------------------------------------------------------------------- */

export function SalaryDividendCalculator() {
  const [profit, setProfit] = useState(80_000);
  const [salary, setSalary] = useState(12_570);

  const result = useMemo(
    () =>
      estimateSalaryDividend({
        companyProfitBeforeSalary: profit,
        salary,
      }),
    [profit, salary],
  );

  useUsageTracking("salary-dividend", `${profit}-${salary}`);

  return (
    <CalculatorShell
      title="Salary and dividend estimator"
      description="For director-shareholders: follow company profit through employer NI, Corporation Tax and personal tax to what actually reaches you."
      taxYear={config}
      assumptions={[
        ...baseAssumptions,
        "Assumes a single director-shareholder taking all remaining post-tax profit as dividends.",
        "The Employment Allowance is NOT applied, because it is unavailable where the only employee paid above the secondary threshold is a single director.",
        "Ignores pension contributions, benefits in kind and any other income.",
        "Dividends can only be paid from distributable reserves. This models profit for the period, not accumulated reserves.",
      ]}
      inputs={
        <>
          <MoneyInput
            label="Company profit before director's salary"
            hint="Profit after all other business expenses."
            value={profit}
            onChange={setProfit}
          />

          <MoneyInput
            label="Director's salary"
            hint="Common reference points are the secondary threshold (£5,000) and the personal allowance (£12,570)."
            value={salary}
            onChange={setSalary}
            max={profit}
          />

          <div className="flex flex-wrap gap-2">
            {[
              { label: "£5,000", value: 5_000 },
              { label: "£12,570", value: 12_570 },
              { label: "£50,270", value: 50_270 },
            ].map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSalary(Math.min(preset.value, profit))}
                className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-brand-300 hover:text-brand-800"
              >
                Set {preset.label}
              </button>
            ))}
          </div>
        </>
      }
      results={
        <>
          <HeadlineResult
            label="Estimated take-home"
            value={formatCurrency(result.takeHome)}
            sublabel={`From ${formatCurrency(profit)} of company profit · ${formatPercent(result.effectiveRate)} lost to tax and NI`}
          />

          <div className="mt-6">
            <ResultRow
              label="Director's salary"
              value={formatCurrency(result.salary)}
            />
            <ResultRow
              label="Employer National Insurance"
              value={`− ${formatCurrency(result.employerNi.total)}`}
            />
            <ResultRow
              label="Corporation Tax"
              value={`− ${formatCurrency(result.corporationTax.tax)}`}
              note={
                result.corporationTax.basis === "marginal-relief"
                  ? "Marginal relief applied"
                  : undefined
              }
            />
            <ResultRow
              label="Dividends available"
              value={formatCurrency(result.distributableProfit)}
            />
            <ResultRow
              label="Employee National Insurance"
              value={`− ${formatCurrency(result.employeeNi.total)}`}
            />
            <ResultRow
              label="Income Tax (salary and dividends)"
              value={`− ${formatCurrency(result.incomeTax.totalTax)}`}
            />
            <ResultRow
              label="Take-home"
              value={formatCurrency(result.takeHome)}
              emphasis
            />
          </div>

          <SplitBar
            total={profit}
            segments={[
              {
                label: "You keep",
                value: result.takeHome,
                className: "bg-brand-600",
              },
              {
                label: "Tax & NI",
                value: result.totalTaxAndNi,
                className: "bg-slate-400",
              },
            ]}
          />

          <Alert tone="warning" className="mt-5">
            The right salary depends on your National Insurance record, other
            income, pension plans and whether the Employment Allowance is
            available to your company. This compares scenarios — it is not a
            recommendation.
          </Alert>
        </>
      }
    />
  );
}
