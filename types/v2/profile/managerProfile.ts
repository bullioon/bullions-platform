import type { Manager } from "@/types/v2/manager";
import type { Strategy } from "@/types/v2/domain/strategy";

export interface ManagerProfile {
  manager: Manager;

  strategies: Strategy[];

  stats: {
    strategies: number;
    verifiedStrategies: number;
    totalCapital: number;
    totalAllocators: number;
  };
}
