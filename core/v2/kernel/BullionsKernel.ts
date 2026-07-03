import { PerformanceScheduler } from "@/core/v2/services/PerformanceScheduler";

export const BullionsKernel = {
  async pulse() {
    const performance = await new PerformanceScheduler().run();

    return {
      timestamp: Date.now(),
      performance,
    };
  },
};
