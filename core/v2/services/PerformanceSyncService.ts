import { DemoAdapter } from "@/core/v2/adapters/DemoAdapter";
import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";
import { evaluatePerformance } from "@/core/v2/performance/PerformanceEngine";
import { EventBus } from "@/core/v2/events/EventBus";
import { registerBullionsListeners } from "@/core/v2/listeners";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";

export class PerformanceSyncService {
  constructor(
    private readonly adapter = new DemoAdapter()
  ) {}

  async sync(strategyId: string) {
    registerBullionsListeners();

    const snapshot = await this.adapter.getSnapshot(strategyId);

    await PerformanceRepository.saveSnapshot(snapshot);

    const evaluation = evaluatePerformance(snapshot);

    await StrategyRepository.updatePerformance(strategyId, {
      roi: evaluation.roi,
      winRate: evaluation.winRate,
      profitFactor: snapshot.profitFactor,
      maxDrawdown: snapshot.maxDrawdown,
    });

    await EventBus.emit("performance.updated", {
      strategyId,
      snapshotId: String(snapshot.timestamp),
    });

    return {
      snapshot,
      evaluation,
    };
  }
}
