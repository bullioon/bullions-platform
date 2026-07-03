"use client";

import { type Trader } from "@/lib/mockTraders";

type Tier = "BULLION" | "HELLION" | "TORION" | "URANIO";

type Props = {
  traders: Trader[];
  selectedIds: string[];
  tier?: Tier;
  onAdd: (traderId: string) => void;
  onRemove: (traderId: string) => void;
  onActivate?: (managers: { traderId: string; allocationPct: number }[]) => void;
};

export function FundBuilder({ traders, selectedIds, tier = "BULLION", onRemove, onActivate }: Props) {
  
const selected = selectedIds

    .map((id) => traders.find((t) => t.id === id))
    .filter(Boolean) as Trader[];

  const maxManagers =
    tier === "URANIO" ? 5 : tier === "TORION" ? 3 : tier === "HELLION" ? 2 : 1;

  const avgScore =
    selected.length > 0
      ? selected.reduce((sum, t) => sum + Number(t.topTrade || 0), 0) / selected.length
      : 0;

  const expectedReturn =
    selected.length > 0
      ? selected.reduce((sum, t) => sum + Number(t.roi || 0), 0) / selected.length
      : 0;

  const avgRisk =
    selected.length > 0
      ? selected.reduce((sum, t) => sum + Number(t.maxLoss || 0), 0) / selected.length
      : 0;

  const risk =
    selected.length === 0 ? "NONE" : avgRisk <= 3 ? "LOW" : avgRisk <= 6 ? "MEDIUM" : "HIGH";

  const diversification =
    selected.length >= 3 ? "HIGH" : selected.length === 2 ? "MEDIUM" : selected.length === 1 ? "LOW" : "NONE";

  function allocationFor(index: number) {
    if (selected.length === 1) return 100;
    if (selected.length === 2) return tier === "BULLION" ? 100 : [70, 30][index];
    if (selected.length === 3) return [40, 35, 25][index];
    if (selected.length === 4) return [35, 25, 20, 20][index];
    if (selected.length === 5) return [30, 25, 20, 15, 10][index];
    return 0;
  }

  return (
    <section className="rounded-[32px] border border-[#b6ff00]/12 bg-[#070807] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            Your Fund
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
            Your Fund
          </h3>
          <p className="mt-1 text-sm text-white/35">
            Bullions AI allocation engine. Deploy capital from Fund Setup.
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.04] px-4 py-3 text-right ring-1 ring-white/8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
            Selected
          </p>
          <p className="mt-1 text-xl font-black text-white">
            {selected.length}/{maxManagers}
          </p>
        </div>
      </div>

      {selected.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
          <p className="text-xl font-black text-white">No managers added</p>
          <p className="mt-2 text-sm text-white/35">
            Add Bullions Managers from COPY above.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {selected.map((trader, index) => {
            const allocation = allocationFor(index);
            const anyTrader = trader as any;

            return (
              <div key={trader.id} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase text-white">
                      {trader.avatar || "⚔️"} {trader.name}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {anyTrader.specialty || trader.tag}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemove(trader.id)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 hover:text-white"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-white/35">Allocation</span>
                    <span className="font-black text-[#b6ff00]">{allocation}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#b6ff00]" style={{ width: `${allocation}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <FundMetric label="Fund Score" value={selected.length ? avgScore.toFixed(0) : "--"} />
        <FundMetric label="Risk" value={risk} />
        <FundMetric label="Diversification" value={diversification} />
        <FundMetric label="Expected Return" value={selected.length ? `+${expectedReturn.toFixed(1)}%` : "--"} />
      </div>
    </section>
  );
}

function FundMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/8">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
