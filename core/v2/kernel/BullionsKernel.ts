import { ChallengeRuntimeService } from "@/core/v2/challenge/ChallengeRuntimeService";
import { buildMissionRuntime } from "@/core/v2/runtime/MissionRuntime";
import { RuntimeRepository } from "@/core/v2/runtime/RuntimeRepository";
import { FundPerformanceService } from "@/core/v2/services/FundPerformanceService";
import { PerformanceScheduler } from "@/core/v2/services/PerformanceScheduler";

export const BullionsKernel = {
  async pulse() {
    /*
     * Bullions pipeline:
     *
     * 1. Synchronize strategy performance.
     * 2. Rebuild and persist strategy runtimes.
     * 3. Recalculate challenge scores and positions.
     * 4. Recalculate every active fund.
     * 5. Build Mission Control.
     */

    const performance =
      await new PerformanceScheduler().run();

    const runtimes =
      await RuntimeRepository.syncAllStrategyRuntimes();

    const challenge =
      await ChallengeRuntimeService.syncActiveSeason();

    const funds =
      await FundPerformanceService.syncAllActiveFunds();

    const missionControl =
      await buildMissionRuntime();

    return {
      timestamp: Date.now(),

      performance,

      runtimes: {
        processed: runtimes.length,
        strategyIds: runtimes.map(
          (runtime) => runtime.strategyId
        ),
      },

      challenge: {
        seasonId: challenge.seasonId,
        checked: challenge.checked,
        ranked: challenge.ranked,
        topFive: challenge.topFive ?? [],
      },

      funds: {
        checked: funds.checked,
        synced: funds.synced,
        failed: funds.failed,
      },

      missionControl: {
        rankings: missionControl.rankings.length,
        featured: missionControl.featured.strategyId,
      },
    };
  },

  async missionControl() {
    return buildMissionRuntime();
  },
};
