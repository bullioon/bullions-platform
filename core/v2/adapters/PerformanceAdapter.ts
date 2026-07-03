import type { PerformanceSnapshot } from "@/types/v2/domain/performance";

export interface PerformanceAdapter {
  getSnapshot(strategyId: string): Promise<PerformanceSnapshot>;
}
