import type { StrategyDraft } from "@/types/v2/strategyDraft";

export function updateDraftIdentity(
  draft: StrategyDraft,
  identity: Partial<StrategyDraft["identity"]>
): StrategyDraft {
  return {
    ...draft,
    identity: {
      ...draft.identity,
      ...identity,
    },
  };
}

export function updateDraftMarkets(
  draft: StrategyDraft,
  markets: Partial<StrategyDraft["markets"]>
): StrategyDraft {
  return {
    ...draft,
    markets: {
      ...draft.markets,
      ...markets,
    },
  };
}

export function updateDraftInvestment(
  draft: StrategyDraft,
  investment: Partial<StrategyDraft["investment"]>
): StrategyDraft {
  return {
    ...draft,
    investment: {
      ...draft.investment,
      ...investment,
    },
  };
}
