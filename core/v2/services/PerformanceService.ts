import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";

export const PerformanceService = {
  async syncStrategyPerformance(strategyId: string) {
    const latest = await PerformanceRepository.latest(strategyId);

    if (!latest) {
      return null;
    }

    const pnl = Number(latest.closedPnL || 0) + Number(latest.floatingPnL || 0);
    const deposits = Number(latest.deposits || 0);

    const roi = deposits > 0 ? (pnl / deposits) * 100 : 0;
    const winRate =
      Number(latest.trades || 0) > 0
        ? (Number(latest.wins || 0) / Number(latest.trades || 0)) * 100
        : 0;

    await StrategyRepository.updatePerformance(strategyId, {
      roi,
      winRate,
      profitFactor: Number(latest.profitFactor || 0),
      maxDrawdown: Number(latest.maxDrawdown || 0),
    });

    return {
      roi,
      winRate,
      profitFactor: Number(latest.profitFactor || 0),
      maxDrawdown: Number(latest.maxDrawdown || 0),
    };
  },
};
