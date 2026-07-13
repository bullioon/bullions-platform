import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { CapitalRankingsClient } from "@/components/v2/capital-rankings/CapitalRankingsClient";

export const dynamic = "force-dynamic";

export default function DiscoverPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-10 pt-10 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1480px] space-y-7">
        <TopFloatingMenu />
        <CapitalRankingsClient />
      </div>
    </main>
  );
}
