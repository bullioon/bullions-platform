"use client";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { Hero } from "@/components/v2/arena/Hero";
import { ChallengeSpotlight } from "@/components/v2/arena/ChallengeSpotlight";
import { SixLiveInfo } from "@/components/v2/arena/SixLiveInfo";

export function Arena() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-10 pt-10 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_32%)]" />

      <div className="relative mx-auto max-w-[1480px] space-y-6">
        <TopFloatingMenu />
        <Hero />
        <ChallengeSpotlight />
        <SixLiveInfo />
      </div>
    </main>
  );
}
