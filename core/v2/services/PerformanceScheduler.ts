import { StrategyRegistry } from "@/core/v2/registry/StrategyRegistry";
import { PerformanceSyncService } from "./PerformanceSyncService";

export class PerformanceScheduler {

  private readonly syncService =
    new PerformanceSyncService();

  async run() {

    const strategies =
      await StrategyRegistry.active();

    const results = [];

    for (const strategy of strategies) {

      try {

        const result =
          await this.syncService.sync(strategy.id);

        results.push({

          strategyId: strategy.id,

          success: true,

          challengeScore:
            result.evaluation.challengeScore,

        });

      } catch (error) {

        results.push({

          strategyId: strategy.id,

          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Unknown error",

        });

      }

    }

    return {

      processed: strategies.length,

      results,

    };

  }

}
