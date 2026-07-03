"use client";

import { useEffect, useState } from "react";

import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";
import { canEnterChallenge, createChallengeEntry } from "@/core/v2/challenge/ChallengeEngine";
import type { Strategy } from "@/types/v2/domain/strategy";
import { Button } from "@/components/v2/ui/Button";
import { Card } from "@/components/v2/ui/Card";
import { ChallengeLeaderboard } from "./ChallengeLeaderboard";

export function ChallengeCard({
  strategy,
}: {
  strategy: Strategy;
}) {
  const [season, setSeason] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    async function load() {
      const active = await ChallengeRepository.getActiveSeason();

      if (!active) return;

      setSeason(active);

      const entry = await ChallengeRepository.getEntry(
        active.id,
        strategy.id
      );

      setEntered(Boolean(entry));
    }

    load();
  }, [strategy.id]);

  async function enter() {
    if (!season) return;

    setLoading(true);

    const entry = createChallengeEntry(strategy, season);

    await ChallengeRepository.saveEntry(entry);

    setEntered(true);
    setLoading(false);
  }

  if (!season) {
    return (
      <Card>
        <p className="text-white/40">
          No active season.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
        Weekly Challenge
      </p>

      <h2 className="mt-3 text-3xl font-black text-white">
        {season.name}
      </h2>

      <p className="mt-5 text-sm text-white/45">
        Prize Pool ${season.prizePoolUsd.toLocaleString()}
      </p>

      <p className="mt-2 text-sm text-white/45">
        Entry Fee ${season.entryFeeUsd}
      </p>

      <div className="mt-8">
        {entered ? (
          <Button variant="ghost">
            Registered ✓
          </Button>
        ) : (
          <Button
            disabled={!canEnterChallenge(strategy, season) || loading}
            onClick={enter}
          >
            {loading ? "Registering..." : "Enter Challenge"}
          </Button>
        )}
      </div>
      </Card>

      <ChallengeLeaderboard seasonId={season.id} />
    </div>
  );
}
