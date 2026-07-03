import type { StrategyDraft } from "@/types/v2/strategyDraft";

export function createDraft(): StrategyDraft {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `draft_${Date.now()}`,

    identity: {
      name: "",
      subtitle: "",
      description: "",
    },

    markets: {
      selected: [],
      primary: "",
    },

    investment: {
      riskProfile: "Moderate",
      holdingTime: "Intraday",
      minimumAllocation: 500,
      capacity: 250000,
    },

    status: "draft",
  };
}
