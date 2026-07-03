import type { StrategyDraft } from "@/types/v2/strategyDraft";

export function validateDraft(draft: StrategyDraft): string[] {
  const errors: string[] = [];

  if (draft.identity.name.trim().length < 3) {
    errors.push("Strategy name is required.");
  }

  if (draft.identity.subtitle.trim().length < 3) {
    errors.push("Strategy subtitle is required.");
  }

  if (draft.markets.selected.length === 0) {
    errors.push("Select at least one market.");
  }

  if (!draft.markets.primary) {
    errors.push("Select a primary market.");
  }

  if (draft.investment.minimumAllocation <= 0) {
    errors.push("Minimum allocation must be greater than zero.");
  }

  if (draft.investment.capacity <= 0) {
    errors.push("Capacity must be greater than zero.");
  }

  return errors;
}

export function publishDraft(draft: StrategyDraft): StrategyDraft {
  const errors = validateDraft(draft);

  if (errors.length) {
    throw new Error(errors[0]);
  }

  return {
    ...draft,
    status: "published",
  };
}
