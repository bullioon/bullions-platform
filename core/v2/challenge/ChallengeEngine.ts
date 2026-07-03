import type { ChallengeEntry, ChallengeSeason } from "@/types/v2/domain/challenge";
import type { Strategy } from "@/types/v2/domain/strategy";

export function canEnterChallenge(
  strategy: Strategy,
  season: ChallengeSeason
) {
  return (
    season.status === "registration" &&
    strategy.status.state === "published" &&
    strategy.challenge?.status !== "enrolled"
  );
}

export function createChallengeEntry(
  strategy: Strategy,
  season: ChallengeSeason,
  tierId: "demo_50k" | "demo_200k" = "demo_50k"
): ChallengeEntry {
  return {
    id: `${season.id}_${strategy.id}`,
    seasonId: season.id,
    strategyId: strategy.id,

    tierId,

    paid: false,

    disqualified: false,
    disqualificationReason: null,

    payoutSharePct: 0,

    rank: null,
    score: 0,

    eligibleForTopFive: false,

    createdAt: Date.now(),
  };
}

export function isTopFive(entry: ChallengeEntry) {
  return entry.rank !== null && entry.rank <= 5;
}
