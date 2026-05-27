import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { Footer } from "@/components/layout/Footer";
import { TerminalArena } from "@/components/terminal/TerminalArena";

export default function BullPadPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 pt-10 pb-5 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.08),transparent_28%)]" />

      <div className="relative">
        <TopFloatingMenu />
        <TerminalArena />
        <Footer />
      </div>
    </main>
  );
}
