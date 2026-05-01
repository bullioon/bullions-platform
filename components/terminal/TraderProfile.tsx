"use client";

import { type Trader } from "@/lib/mockTraders";
import { SkullMark } from "@/components/ui/icons/SkullMark";
import { PerformanceChart } from "@/components/ui/PerformanceChart";

type Props = {
  trader: Trader;
  onCopy: (amount: number) => void;
};

export function TraderProfile({ trader, onCopy }: Props) {
  return (
    <section className="rounded-[34px] bg-[#18191d]/95 p-6 shadow-[0_25px_90px_rgba(0,0,0,.48)]">
      <div className="mb-6 flex items-center gap-4">
        <SkullMark size={64} />

        <div>
          <h2 className="text-2xl font-black text-white">{trader.name}</h2>
          <p className="text-sm text-white/40">{trader.tag}</p>
        </div>

        <div className="ml-auto text-right">
          <p className="text-2xl font-black text-lime-300">+{trader.roi}%</p>
          <p className="text-xs text-white/35">today</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-black/35 p-3">
          <p className="text-xs text-white/35">Balance</p>
          <p className="font-black text-white">${trader.balance.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-black/35 p-3">
          <p className="text-xs text-white/35">Top trade</p>
          <p className="font-black text-lime-300">+{trader.topTrade}%</p>
        </div>
        <div className="rounded-2xl bg-black/35 p-3">
          <p className="text-xs text-white/35">Max loss</p>
          <p className="font-black text-red-400">-{trader.maxLoss}%</p>
        </div>
      </div>

      <PerformanceChart />

      <button
        onClick={() => onCopy(100)}
        className="mt-5 w-full rounded-2xl bg-lime-400 py-4 font-black text-black shadow-[0_0_35px_rgba(163,255,18,.25)]"
      >
        Execute Copy
      </button>
    </section>
  );
}
