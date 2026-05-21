"use client";

type Tier = "BULLION" | "HELLION" | "TORION";

type Props = {
  tier: Tier;
  depositedUsd: number;
  allocatedUsd: number;
  availableUsd: number;
};

export function SurvivalPanel({
  tier,
  depositedUsd,
  allocatedUsd,
  availableUsd,
}: Props) {
  const maxPct = tier === "TORION" ? 80 : tier === "HELLION" ? 65 : 40;
  const usedPct = depositedUsd > 0 ? (allocatedUsd / depositedUsd) * 100 : 0;

  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-[24px] bg-[#111214] p-5 ring-1 ring-white/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#8f96a3]">Survival Protocol</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {tier}
          </h2>
        </div>

        <span className="rounded-full bg-[#b6ff00]/10 px-3 py-1 text-xs font-semibold text-[#b6ff00] ring-1 ring-[#b6ff00]/20">
          Max {maxPct}%
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-white/35">Deposited</p>
          <p className="mt-1 font-semibold text-white">${depositedUsd.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-xs text-white/35">Locked</p>
          <p className="mt-1 font-semibold text-white">${allocatedUsd.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-xs text-white/35">Protected</p>
          <p className="mt-1 font-semibold text-[#b6ff00]">${availableUsd.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#b6ff00]"
            style={{ width: `${Math.min(100, usedPct)}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-white/35">
          <span>Survival protocol active</span>
          <span>{usedPct.toFixed(0)}% allocated</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[18px] bg-black/25 p-3 ring-1 ring-white/5">
          <p className="text-[11px] text-white/35">
            Withdrawal Window
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            4D 12H 18M
          </p>

          <p className="mt-1 text-[11px] text-[#b6ff00]">
            Weekly unlock
          </p>
        </div>

        <div className="rounded-[18px] bg-black/25 p-3 ring-1 ring-white/5">
          <p className="text-[11px] text-white/35">
            Survival Score
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            82%
          </p>

          <p className="mt-1 text-[11px] text-[#b6ff00]">
            Stable recovery state
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-white/45">
        Bullions limits your allocation by tier to help you survive longer and avoid emotional overexposure.
      </p>
    </section>
  );
}
