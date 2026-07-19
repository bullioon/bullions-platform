import Link from "next/link";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { MyStrategies } from "@/components/v2/manager/strategies/MyStrategies";

export default function ManagerStrategiesPage() {
  return (
    <main className="min-h-screen bg-[#050606] px-4 pb-28 pt-8 text-white md:pb-14">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1380px]">
        <TopFloatingMenu />

        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/firm"
            className="text-[9px] font-black uppercase tracking-[0.17em] text-white/35 transition hover:text-[#b6ff00]"
          >
            ← Firm HQ
          </Link>

          <Link
            href="/manager/profile"
            className="text-[9px] font-black uppercase tracking-[0.17em] text-white/35 transition hover:text-[#b6ff00]"
          >
            Edit Profile →
          </Link>
        </div>

        <MyStrategies />
      </div>
    </main>
  );
}
