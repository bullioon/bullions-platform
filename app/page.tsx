import { DiscordProof } from "@/components/home/DiscordProof";
import { TierAccessSection } from "@/components/home/TierAccessSection";
import { PrivateRoomCTA } from "@/components/home/PrivateRoomCTA";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { Footer } from "@/components/layout/Footer";
import { HomeIconStrip } from "@/components/home/HomeIconStrip";
import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { BullionsHomeHero } from "@/components/home/BullionsHomeHero";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 py-5 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.08),transparent_28%)]" />

      <div className="relative">
        <TopFloatingMenu />
        <BullionsHomeHero />
      </div>
          <TierAccessSection />
      <DiscordProof />
      <PrivateRoomCTA />
      <HomeIconStrip />
          <HomeHowItWorks />
      <Footer />
    </main>
  );
}
