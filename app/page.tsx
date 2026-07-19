import { HomeExperience } from "@/components/home/HomeExperience";
import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-28 pt-8 text-white md:pb-14">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1480px]">
        <TopFloatingMenu />
        <HomeExperience />
      </div>
    </main>
  );
}
