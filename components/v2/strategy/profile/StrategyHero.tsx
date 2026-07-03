import type { StrategyProfile } from "@/types/v2/strategy";
import { Avatar } from "@/components/v2/ui/Avatar";
import { Badge } from "@/components/v2/ui/Badge";
import { Button } from "@/components/v2/ui/Button";
import { Metric } from "@/components/v2/ui/Metric";
import { Tabs } from "@/components/v2/ui/Tabs";

function usd(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export function StrategyHero({ strategy, editable = false }: { strategy: StrategyProfile; editable?: boolean }) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080909] p-7">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex min-w-0 items-center gap-7">
          <Avatar name={strategy.name} size="xl" tone="purple" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-5xl font-black tracking-[-0.06em] text-white">
                {strategy.name}
              </h1>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b66dff] text-lg font-black text-black">
                ✓
              </span>
            </div>

            <p className="mt-2 text-lg font-black text-white/35">
              @{strategy.name.toLowerCase().replaceAll(" ", "")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="purple">{strategy.tier}</Badge>
              <Badge tone="neutral">Managed by {strategy.managerName}</Badge>
              <Badge tone="success">Verified</Badge>
            </div>

            <p className="mt-5 max-w-3xl text-base leading-7 text-white/50">
              Institutional execution. Momentum driven. Risk-first strategy manager.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost">Follow Manager</Button>
          <Button>Add Strategy</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 border-t border-white/8 pt-6 sm:grid-cols-6">
        <Metric label="ROI" value={`+${strategy.roi.toFixed(1)}%`} tone="success" />
        <Metric label="Capital" value={usd(strategy.capitalFollowing)} />
        <Metric label="Allocators" value={strategy.allocators.toLocaleString()} />
        <Metric label="Win Rate" value={`${strategy.winRate}%`} />
        <Metric label="Max DD" value={`${strategy.maxDrawdown}%`} />
        <Metric label="PF" value={strategy.profitFactor.toFixed(2)} tone="purple" />
      </div>

      <div className="mt-6">
        <Tabs items={["Research", "Performance", "Methodology", "Products"]} active="Research" />
      </div>
    </section>
  );
}
