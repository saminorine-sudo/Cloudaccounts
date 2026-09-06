import { Icon } from "@/components/ui/icon";

/**
 * Hero visual: a stylised financial summary panel.
 *
 * Built entirely from markup and SVG rather than photography. Stock images of
 * handshakes, calculators and coins are the clearest signal of a template
 * site, and a real product surface communicates "modern accounting firm" more
 * credibly than a staged photo would. It also ships no image bytes and cannot
 * shift layout.
 *
 * Entirely decorative, so it is hidden from assistive technology — the
 * information it depicts is stated in the surrounding copy.
 */

/**
 * Bar heights are in pixels rather than percentages: a percentage height
 * resolves against an auto-height flex parent and collapses to zero.
 */
const CHART_HEIGHT = 112;

const months = [
  { label: "Apr", value: 46 },
  { label: "May", value: 58 },
  { label: "Jun", value: 51 },
  { label: "Jul", value: 69 },
  { label: "Aug", value: 78 },
  { label: "Sep", value: 92 },
];

export function HeroVisual() {
  return (
    <div className="relative" aria-hidden="true">
      {/* Soft green wash behind the panel. */}
      <div className="absolute -inset-x-8 -inset-y-10 rounded-[2.5rem] bg-gradient-to-br from-brand-100/70 via-brand-50/50 to-transparent blur-2xl" />

      <div className="relative rounded-2xl bg-white p-5 shadow-pop ring-1 ring-line sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
              Year to date
            </p>
            <p className="mt-1.5 font-display text-3xl font-bold tracking-tight text-ink">
              £284,610
            </p>
            <p className="mt-1 text-xs text-muted">Turnover · FY 2026/27</p>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
            <svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 8.5 6 5l2 2 3-3.5" />
              <path d="M8.5 3.5H11V6" />
            </svg>
            18.4%
          </span>
        </div>

        {/* Monthly bars. Static heights — no runtime layout work. */}
        <div className="mt-6 flex items-end gap-2">
          {months.map((month, index) => {
            const isLatest = index === months.length - 1;
            return (
              <div
                key={month.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="flex w-full items-end"
                  style={{ height: CHART_HEIGHT }}
                >
                  <div
                    className={`w-full rounded-t-[3px] ${
                      isLatest ? "bg-brand-600" : "bg-brand-200"
                    }`}
                    style={{
                      height: Math.round((month.value / 100) * CHART_HEIGHT),
                    }}
                  />
                </div>
                <span
                  className={`text-[0.6875rem] ${
                    isLatest ? "font-semibold text-ink" : "text-muted"
                  }`}
                >
                  {month.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5">
          <div>
            <p className="text-[0.6875rem] uppercase tracking-wider text-muted">
              Gross margin
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold text-ink">
              62.4%
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] uppercase tracking-wider text-muted">
              Cash position
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold text-ink">
              £71,280
            </p>
          </div>
        </div>
      </div>

      {/* Floating cards — offset so the composition reads as layered depth. */}
      <div className="absolute -bottom-9 -left-4 hidden w-56 rounded-xl bg-white p-3.5 shadow-pop ring-1 ring-line sm:block lg:-left-10">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white">
            <Icon name="check" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ink">
              VAT return filed
            </p>
            <p className="truncate text-[0.6875rem] text-muted">
              Q2 · submitted on time
            </p>
          </div>
        </div>
      </div>

      <div className="absolute -right-3 top-7 hidden w-52 rounded-xl bg-brand-800 p-3.5 text-white shadow-pop ring-1 ring-white/10 md:block lg:-right-8">
        <p className="text-[0.6875rem] uppercase tracking-wider text-brand-300">
          Corporation Tax
        </p>
        <p className="mt-1 font-display text-xl font-bold">£11,340</p>
        <p className="mt-0.5 text-[0.6875rem] text-brand-100/70">
          Estimated · set aside monthly
        </p>
      </div>
    </div>
  );
}
