"use client";

import { useEffect, useState } from "react";

import { ChallengeLeaderboardRepository } from "@/core/v2/repositories/ChallengeLeaderboardRepository";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import { topFive } from "@/core/v2/challenge/ChallengeLeaderboardEngine";
import { Card } from "@/components/v2/ui/Card";

export function ChallengeLeaderboard({ seasonId }: { seasonId: string }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const entries = await ChallengeLeaderboardRepository.bySeason(seasonId);
      const top = topFive(entries);

      const enriched = await Promise.all(
        top.map(async (row) => {
          const strategy = await StrategyRepository.get(row.strategyId);

          return {
            ...row,
            strategyName: strategy?.identity.name || row.strategyId,
          };
        })
      );

      setRows(enriched);
    }

    load();
  }, [seasonId]);

  return (
    <Card>
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
        Top 5
      </p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-white/35">No entries yet.</p>
        ) : null}

        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
          >
            <div>
              <p className="font-black text-white">
                #{row.position} {row.strategyName}
              </p>

              <p className="text-sm text-white/40">
                Season entry
              </p>
            </div>

            <div className="text-right">
              <p className="font-black text-[#b6ff00]">
                {row.score.toFixed(2)}
              </p>

              <p className="text-xs text-white/30">
                Score
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
