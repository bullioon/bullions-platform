"use client";

import Link from "next/link";

export function HomeMissionControlCard({
  strategy,
}: {
  strategy: {
    id: string;
    name: string;
    roi: number;
    rank: number | null;
    runtimeActive: boolean;
  };
}) {
  return (
    <section className="mb-8 overflow-hidden rounded-[34px] border border-[#b6ff00]/20 bg-gradient-to-br from-[#b6ff00]/10 via-black to-black p-7">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
            Mission Control
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
            {strategy.runtimeActive
              ? "Challenge LIVE"
              : "Waiting for MT5"}
          </h2>

          <p className="mt-3 text-white/50">
            {strategy.name}
          </p>
        </div>

        <div className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#b6ff00]">
          {strategy.runtimeActive ? "LIVE" : "SETUP"}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric
          label="ROI"
          value={`${strategy.roi.toFixed(2)}%`}
        />

        <Metric
          label="Rank"
          value={
            strategy.rank
              ? `#${strategy.rank}`
              : "--"
          }
        />

        <Metric
          label="Status"
          value={
            strategy.runtimeActive
              ? "Connected"
              : "Waiting"
          }
        />

        <Metric
          label="Strategy"
          value={strategy.name}
        />
      </div>

      <Link
        href={`/trading-desk?strategyId=${strategy.id}`}
        className="mt-8 flex h-14 items-center justify-center rounded-full bg-[#b6ff00] text-[11px] font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01]"
      >
        Open Mission Control
      </Link>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-black">
        {value}
      </p>
    </div>
  );
}