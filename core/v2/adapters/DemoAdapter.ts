import type { PerformanceAdapter } from "./PerformanceAdapter";
import type { PerformanceSnapshot } from "@/types/v2/domain/performance";

export class DemoAdapter implements PerformanceAdapter {

  async getSnapshot(strategyId:string):Promise<PerformanceSnapshot>{

    return{

      strategyId,

      timestamp:Date.now(),

      balance:100000,

      equity:102450,

      deposits:100000,

      withdrawals:0,

      closedPnL:1800,

      floatingPnL:650,

      trades:42,

      wins:31,

      losses:11,

      profitFactor:2.45,

      maxDrawdown:3.8,

    };

  }

}
