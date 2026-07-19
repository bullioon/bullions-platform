import type { Strategy } from "@/types/v2/domain/strategy";
import type { StrategyDraft } from "@/types/v2/strategyDraft";

export function strategyFromDraft(draft: StrategyDraft): Strategy {
  const now = Date.now();

  return {
    id: draft.id,

    identity: {
      name: draft.identity.name,
      subtitle: draft.identity.subtitle,
      description: draft.identity.description,
      avatarUrl: "",
      bannerUrl: "",
    },

    manager: {
      uid: "local-manager",
      username: "axbellions",
      displayName: "Ax Bellions",
    },

    markets: {
      primary: draft.markets.primary,
      secondary: draft.markets.selected.filter(
        (market) => market !== draft.markets.primary
      ),
    },

    investment: {
      riskProfile: draft.investment.riskProfile,
      holdingTime: draft.investment.holdingTime,
      minimumAllocation: draft.investment.minimumAllocation,
      capacity: draft.investment.capacity,
    },

    performance: {
      roi: null,
      winRate: null,
      profitFactor: null,
      maxDrawdown: null,
      capitalFollowing: 0,
      allocators: 0,
    },

    status: {
      state: "draft",
      visibility: "private",
      verified: false,
      tier: "Tier C",
    },

    challenge: {
      status: "not_enrolled",
      challengeId: null,
      rank: null,
      eligibleForLeaderboard: false,
      entryFeeUsd: 0,
      prizeUsd: 0,
    },

    createdAt: now,
    updatedAt: now,
  };
}
