import type { PerformanceAdapter } from "./PerformanceAdapter";
import type { PerformanceSnapshot } from "@/types/v2/domain/performance";

export class MT5Adapter implements PerformanceAdapter {

  async getSnapshot(
    strategyId:string
  ):Promise<PerformanceSnapshot>{

    throw new Error("MT5 adapter not connected.");

  }

}
