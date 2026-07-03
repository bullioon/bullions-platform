import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import type { Strategy } from "@/types/v2/domain/strategy";

export const StrategyRegistry = {
  async active(): Promise<Strategy[]> {
    const strategies = await StrategyRepository.list();

    return strategies.filter((strategy) => {
      const isPublished = strategy.status?.state === "published";
      const hasId = Boolean(strategy.id);

      return isPublished && hasId;
    });
  },
};
