import type { StrategyCardData } from "@/types/v2/strategyCard";
import { StrategyCard } from "@/components/v2/universe/StrategyCard";

type StrategyRowProps = {
  title: string;
  subtitle?: string;
  strategies: StrategyCardData[];
};

export function StrategyRow({ title, subtitle, strategies }: StrategyRowProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-5">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-white">
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-1 text-sm text-white/35">{subtitle}</p>
          ) : null}
        </div>

        <button className="text-xs font-black uppercase tracking-[0.18em] text-white/30 transition hover:text-[#b6ff00]">
          View all →
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {strategies.slice(0, 6).map((strategy) => (
          <div key={strategy.id} className="w-[340px] shrink-0">
            <StrategyCard strategy={strategy} />
          </div>
        ))}
      </div>
    </section>
  );
}
