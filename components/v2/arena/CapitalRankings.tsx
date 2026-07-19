"use client";

import { useEffect, useState } from "react";

import {
  HeroCopyPreview,
  heroTraders,
  type HeroTrader,
} from "@/components/v2/arena/hero/HeroCopyPreview";

export function CapitalRankings() {
  const [traders, setTraders] = useState<HeroTrader[]>(heroTraders);
  const [selected, setSelected] = useState<HeroTrader>(heroTraders[0]);

  useEffect(() => {
    let alive = true;

    async function loadRankings() {
      try {
        const response = await fetch("/api/mission-control", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Mission Control returned ${response.status}`);
        }

        const data = await response.json();

        if (
          !alive ||
          !Array.isArray(data.leaderboards?.competition) ||
          data.leaderboards.competition.length === 0
        ) {
          return;
        }

        const rankings = data.leaderboards.competition as HeroTrader[];

        setTraders(rankings);
        setSelected((current) => {
          return (
            rankings.find((trader) => trader.id === current.id) ??
            rankings[0]
          );
        });
      } catch (error) {
        console.warn("[CapitalRankings] fallback rankings", error);
      }
    }

    loadRankings();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      id="capital-rankings"
      className="mx-auto max-w-[1180px] scroll-mt-28 px-4 py-10"
    >
      <div className="mb-8 text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#b6ff00]">
          Season 03
        </p>

        <h2 className="mt-4 max-w-[760px] text-4xl font-black tracking-[-0.065em] text-white md:text-6xl">
          Capital rankings.
        </h2>

        <p className="mt-4 max-w-[620px] text-sm leading-7 text-white/45 md:text-base">
          Verified traders competing for Bullions capital, distribution and
          placement inside the Strategy Universe.
        </p>
      </div>

      <HeroCopyPreview
        selected={selected}
        onSelect={setSelected}
        traders={traders}
      />
    </section>
  );
}
