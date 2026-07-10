import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import type { ManagerProfile } from "@/types/v2/profile/managerProfile";

export const ManagerService = {
  async getProfile(managerUid: string): Promise<ManagerProfile | null> {
    const manager = await ManagerRepository.get(managerUid);

    if (!manager) return null;

    const strategies = (await StrategyRepository.list()).filter(
      (strategy) => strategy.manager?.uid === managerUid
    );

    return {
      manager,
      strategies,
      stats: {
        strategies: strategies.length,
        verifiedStrategies: strategies.filter(
          (s) => s.status.verified
        ).length,
        totalCapital: strategies.reduce(
          (sum, s) => sum + Number(s.performance.capitalFollowing || 0),
          0
        ),
        totalAllocators: strategies.reduce(
          (sum, s) => sum + Number(s.performance.allocators || 0),
          0
        ),
      },
    };
  },
};
