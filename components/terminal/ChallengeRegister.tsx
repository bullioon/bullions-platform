"use client";

import { ChallengeTiers } from "@/core/v2/challenge/tiers";
import { useEffect, useState } from "react";
import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";

const PRODUCTS = [
  {
    id: "demo_50k",
    badge: "50K DEMO",
    label: "$50,000",
    prize: "MONTHLY CASH PRIZE",
    entry: `$${ChallengeTiers.demo_50k.feeUsd}`,
    description: "Access a $50,000 demo challenge account.",
  },
  {
    id: "demo_200k",
    badge: "200K DEMO",
    label: "$200,000",
    prize: "MONTHLY CASH PRIZE",
    entry: "$1,080",
    description: "Access a $200,000 demo challenge account.",
  },
];

function getNextMonth() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

function formatCountdown(ms: number) {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);

  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

export function ChallengeRegister() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = now ? formatCountdown(getNextMonth() - now) : { d: 0, h: 0, m: 0, s: 0 };

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#070807] p-5">
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-white/35">
              TRADER CHALLENGE
            </p>
            <h3 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">
              Monthly Challenge
            </h3>
            <p className="mt-1 text-sm font-semibold text-white/35">
              Top 5 traders earn from Sunday allocator withdrawals.
            </p>
          </div>

          <div className="rounded-full bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/40 ring-1 ring-white/10">
            20 spots / month
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            ["D", remaining.d],
            ["H", remaining.h],
            ["M", remaining.m],
            ["S", remaining.s],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-black/25 p-3 text-center">
              <p className="text-2xl font-black text-white">{String(value).padStart(2, "0")}</p>
              <p className="mt-1 text-[10px] font-black text-white/35">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="group rounded-[22px] border border-white/8 bg-white/[0.025] p-4 transition hover:border-[#b6ff00]/45 hover:bg-[#b6ff00]/[0.035]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/45 ring-1 ring-white/8 group-hover:text-[#b6ff00]">
                    {p.badge}
                  </span>

                  <div className="mt-3 flex items-end gap-3">
                    <h4 className="text-3xl font-black tracking-[-0.04em] text-white">{p.label}</h4>
                    <p className="pb-1 text-xs font-black uppercase tracking-[0.18em] text-white/35 group-hover:text-[#b6ff00]">
                      {p.prize}
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-white/35">
                    {p.description}
                  </p>

                  <p className="mt-2 text-xs text-white/30">
                    Rules: 30% max daily loss · 40% max drawdown · News allowed · Copy/EA allowed
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Entry</p>
                  <p className="mt-1 text-2xl font-black text-white">{p.entry}</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  const season = await ChallengeRepository.getActiveSeason();

                  if (!season) {
                    alert("No active season.");
                    return;
                  }

                  await ChallengeRepository.createEntry({
                    seasonId: season.id,
                    strategyId: "aa07ccd7-bae1-471c-84ab-185d881e9f97",
                    tierId: p.id as "demo_50k" | "demo_200k",
                  });

                  alert(`Challenge entry created: ${p.label}`);
                }}
                className="mt-4 h-11 w-full rounded-full bg-white/10 text-xs font-black uppercase tracking-[0.2em] text-white/55 transition hover:scale-[1.01] group-hover:bg-[#b6ff00] group-hover:text-black"
              >
                Enter Challenge
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}