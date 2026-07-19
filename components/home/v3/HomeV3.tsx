import { CopyExperience } from "./CopyExperience";
import { FeaturedFirms } from "./FeaturedFirms";
import { FinalCTA } from "./FinalCTA";
import { HomeHero } from "./HomeHero";
import { LiveTraderTicker } from "./LiveTraderTicker";
import { ProductProof } from "./ProductProof";
import { SixCapitalRules } from "./SixCapitalRules";
import { TraderJourney } from "./TraderJourney";

export function HomeV3() {
  return (
    <div className="mx-auto max-w-[1380px]">
      <LiveTraderTicker />

      <div className="pb-16 pt-12 sm:pb-24 sm:pt-20">
        <HomeHero />
      </div>

      <div className="space-y-10 sm:space-y-14">
        <FeaturedFirms />

        <CopyExperience />

        <TraderJourney />

        <SixCapitalRules />

        <ProductProof />

        <FinalCTA />
      </div>
    </div>
  );
}
