import type { Strategy } from "@/types/v2/domain/strategy";

export function createEmptyStrategy(): Strategy {

  const now = Date.now();

  return {

    id: "",

    identity: {
      name: "",
      subtitle: "",
      description: "",
      avatarUrl: "",
      bannerUrl: "",
    },

    manager: {
      uid: "",
      username: "",
      displayName: "",
    },

    markets: {
      primary: "",
      secondary: [],
    },

    investment: {
      riskProfile: "Moderate",
      holdingTime: "Intraday",
      minimumAllocation: 500,
      capacity: 250000,
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
