import { BuildFund } from "./BuildFund/BuildFund";
import { BullPad } from "./BullPad/BullPad";
import { Challenge } from "./Challenge/Challenge";
import { CinematicBlock } from "./Cinematic";
import { FinalCTA } from "./FinalCTA/FinalCTA";
import { Hero } from "./Hero/Hero";
import { Six } from "./Six/Six";
import { TopRanking } from "./TopRanking/TopRanking";
import { Verified } from "./Verified/Verified";

export function HomeV4() {
  return (
    <main className="mx-auto max-w-[1380px] space-y-10 pb-24 sm:space-y-14">
      <Hero />

      <CinematicBlock
        eyebrow="INTRO"
        title="Where capital meets performance."
        subtitle="Bullions connects verified traders with disciplined capital."
        video="/videos/intro.mp4"
        cta="Enter Bullions"
        href="/discover"
      />

      <TopRanking />

      <CinematicBlock
        eyebrow="COPY"
        title="Build your own fund."
        subtitle="Choose verified firms, define allocations and stay in control."
        video="/videos/copy.mp4"
        cta="Build My Fund"
        href="/discover"
        align="right"
      />

      <BuildFund />

      <CinematicBlock
        eyebrow="TRADER"
        title="Performance deserves capital."
        subtitle="Trade the Challenge, climb the ranking and earn allocation."
        video="/videos/trader.mp4"
        cta="Join Challenge"
        href="/challenge"
      />

      <Challenge />
      <Six />
      <Verified />
      <BullPad />
      <FinalCTA />
    </main>
  );
}
