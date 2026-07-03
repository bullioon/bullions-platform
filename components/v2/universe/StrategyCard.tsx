import type { StrategyCardData } from "@/types/v2/strategyCard";
import { Badge } from "@/components/v2/ui/Badge";
import { Button } from "@/components/v2/ui/Button";
import { Metric } from "@/components/v2/ui/Metric";

function usd(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function StrategyCard({ strategy }: { strategy: StrategyCardData }) {
  const isOfficial = strategy.variant === "official";
  const isChallenge = strategy.variant === "challenge";

  return (
    <article
      className={
        isOfficial
          ? "group relative overflow-hidden rounded-[30px] border border-[#b6ff00]/20 bg-[#080909] p-5 shadow-[0_0_60px_rgba(182,255,0,0.06)]"
          : "group relative overflow-hidden rounded-[30px] border border-white/10 bg-[#080909] p-5"
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,109,255,0.12),transparent_36%)] opacity-80" />
      {isOfficial ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(182,255,0,0.14),transparent_34%)]" />
      ) : null}

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <div
              className={
                isOfficial
                  ? "flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b6ff00]/30 bg-[#b6ff00]/10 text-xl font-black text-[#b6ff00]"
                  : "flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b66dff]/30 bg-[#b66dff]/10 text-xl font-black text-[#d8b4ff]"
              }
            >
              {strategy.name.slice(0, 1)}
            </div>

            <div>
              <h3 className="text-2xl font-black tracking-[-0.04em] text-white">
                {strategy.name}
              </h3>
              <p className="mt-1 text-sm text-white/40">{strategy.subtitle}</p>
            </div>
          </div>

          <Badge tone={isOfficial ? "success" : isChallenge ? "warning" : "purple"}>
            {isOfficial ? "Official" : isChallenge ? "Challenge" : "Community"}
          </Badge>
        </div>

        <p className="mt-5 text-xs text-white/35">
          Managed by <span className="font-black text-white/65">{strategy.managerName}</span>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-5 border-y border-white/8 py-5">
          <Metric label="ROI" value={`+${strategy.roi.toFixed(1)}%`} tone="success" />
          <Metric label="Max DD" value={`${strategy.maxDrawdown.toFixed(1)}%`} />
          <Metric label="PF" value={strategy.profitFactor.toFixed(2)} tone="purple" />
          <Metric label="Capital" value={usd(strategy.capitalFollowing)} />
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d8b4ff]">
            SIX
          </p>
          <p className="mt-2 text-sm font-black text-white">{strategy.sixTitle}</p>
          <p className="mt-1 text-sm leading-6 text-white/40">{strategy.sixBody}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" className="flex-1">
            View Profile
          </Button>
          <Button variant={isOfficial ? "primary" : "outline"} className="flex-1">
            Allocate →
          </Button>
        </div>
      </div>
    </article>
  );
}
