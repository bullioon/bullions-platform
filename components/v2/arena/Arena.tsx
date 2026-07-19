"use client";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import BeforeYouApply from "@/components/v2/arena/BeforeYouApply";
import FinalApplyCTA from "@/components/v2/arena/FinalApplyCTA";
import { LiveTopSix } from "@/components/v2/arena/LiveTopSix";
import { PrizeDistribution } from "@/components/v2/arena/PrizeDistribution";
import { ProgramJourney } from "@/components/v2/arena/ProgramJourney";
import { TradingProgramHero } from "@/components/v2/arena/TradingProgramHero";
import YourEdge from "@/components/v2/arena/YourEdge";

export function Arena() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-10 pt-10 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_32%)]" />

      <div className="relative mx-auto max-w-[1480px] space-y-6">
        <TopFloatingMenu />
        <TradingProgramHero />
        <ProgramJourney />
        <LiveTopSix />
        <YourEdge />
        <PrizeDistribution />
        <BeforeYouApply />
        <FinalApplyCTA />
      </div>
    </main>
  );
}
