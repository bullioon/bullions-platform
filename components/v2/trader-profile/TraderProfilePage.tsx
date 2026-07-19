import type { Strategy } from "@/types/v2/domain/strategy";
import { TraderHero } from "./TraderHero";
import { TraderStatsBar } from "./TraderStatsBar";
import { TraderResearch } from "./TraderResearch";
import { TraderGallery } from "./TraderGallery";
import { TraderTimeline } from "./TraderTimeline";

export function TraderProfilePage({ strategy }: { strategy: Strategy }) {
  return (
    <main className="min-h-screen bg-[#050606] px-5 py-6 text-white">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <TraderHero strategy={strategy} />
        <TraderStatsBar strategy={strategy} />
<section className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="space-y-5">
            <TraderResearch />
            <TraderGallery />
          </div>

          <TraderTimeline />
        </section>
      </div>
    </main>
  );
}
