"use client";

type Props = {
  portfolioUsd: number;
  profitUsd: number;
  managers: number;
  availableUsd: number;
};

export function InvestorHero({
  portfolioUsd,
  profitUsd,
  managers,
  availableUsd,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-[#b6ff00]/15 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,.08),transparent_35%),#080909]">
      <div className="grid gap-10 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
            Investor Workspace
          </p>

          <h1 className="mt-5 text-5xl font-black tracking-[-0.07em]">
            Build your first portfolio.
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/45">
            Allocate capital across verified strategy managers.
            Diversify your portfolio, automate execution and monitor
            performance from a single place.
          </p>

          <button
            onClick={() =>
              document
                .getElementById("copy-terminal")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
            }
            className="mt-9 h-14 rounded-full bg-[#b6ff00] px-9 text-[11px] font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.02]"
          >
            Start Investing
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <Metric
            label="Portfolio"
            value={`$${portfolioUsd.toLocaleString()}`}
          />

          <Metric
            label="Today"
            value={`${profitUsd >= 0 ? "+" : ""}$${profitUsd.toLocaleString()}`}
          />

          <Metric
            label="Managers"
            value={String(managers)}
          />

          <Metric
            label="Available"
            value={`$${availableUsd.toLocaleString()}`}
          />

        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-4 text-3xl font-black tracking-[-0.05em]">
        {value}
      </p>
    </div>
  );
}
