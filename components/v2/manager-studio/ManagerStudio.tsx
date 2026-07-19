"use client";

import { useEffect, useMemo, useState } from "react";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";
import type { ManagerCapabilityId } from "@/core/v2/manager-os/capabilities";

import { GalleryEditor } from "./GalleryEditor";
import { HeroPreview } from "./HeroPreview";
import { IdentityEditor } from "./IdentityEditor";
import { JournalEditor } from "./JournalEditor";
import { ResearchEditor } from "./ResearchEditor";
import { ProductsEditor } from "./ProductsEditor";
import { StudioProvider, useStudio } from "./StudioContext";

type CompletionMap = Partial<
  Record<ManagerCapabilityId, boolean>
>;

type FirmMission = {
  id: ManagerCapabilityId;
  number: string;
  shortTitle: string;
  title: string;
  description: string;
  reward: string;
};

const missions: FirmMission[] = [
  {
    id: "identity",
    number: "01",
    shortTitle: "Identity",
    title: "Build your identity",
    description:
      "Add your cover, profile photo, public name, handle and investment philosophy.",
    reward: "A trusted public identity",
  },
  {
    id: "gallery",
    number: "02",
    shortTitle: "Gallery",
    title: "Show your trading world",
    description:
      "Add images that represent your setup, process and trading environment.",
    reward: "Stronger investor confidence",
  },
  {
    id: "research",
    number: "03",
    shortTitle: "Research",
    title: "Publish market intelligence",
    description:
      "Share one useful market idea, analysis or investment thesis.",
    reward: "Visible research credibility",
  },
  {
    id: "journal",
    number: "04",
    shortTitle: "Journal",
    title: "Add execution notes",
    description:
      "Document your process, decisions and lessons from the market.",
    reward: "Proof of trading discipline",
  },
  {
    id: "products",
    number: "05",
    shortTitle: "Products",
    title: "Define your investment products",
    description:
      "Present the systems, tools or products connected to your firm.",
    reward: "A complete investor-ready firm",
  },
];

function buildCompletion(manager: any): CompletionMap {
  return {
    identity: Boolean(
      manager?.identity?.displayName &&
        manager?.identity?.username &&
        manager?.identity?.avatarUrl &&
        manager?.identity?.bannerUrl &&
        manager?.identity?.biography
    ),

    gallery: Boolean(
      manager?.social?.gallery?.length
    ),

    research: Boolean(
      manager?.social?.research?.length
    ),

    journal: Boolean(
      manager?.social?.journal?.length
    ),

    products: Boolean(
      manager?.social?.products?.length
    ),

    publishing:
      manager?.status === "LIVE" ||
      manager?.status === "VERIFIED",
  };
}

export function ManagerStudio() {
  return (
    <StudioProvider>
      <ManagerStudioContent />
    </StudioProvider>
  );
}

function ManagerStudioContent() {
  const { state } = useStudio();

  const [active, setActive] =
    useState<ManagerCapabilityId>("identity");

  const [completion, setCompletion] =
    useState<CompletionMap>({});

  const [loadingCompletion, setLoadingCompletion] =
    useState(true);

  useEffect(() => {
    if (!state.uid) {
      setLoadingCompletion(false);
      return;
    }

    let alive = true;

    async function refreshCompletion() {
      const manager =
        await ManagerRepository.get(state.uid);

      if (!alive || !manager) return;

      setCompletion(buildCompletion(manager));
      setLoadingCompletion(false);
    }

    refreshCompletion().catch(() => {
      if (alive) {
        setLoadingCompletion(false);
      }
    });

    const interval = window.setInterval(() => {
      refreshCompletion().catch(() => {});
    }, 2000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [state.uid]);

  const activeIndex = Math.max(
    0,
    missions.findIndex(
      (mission) => mission.id === active
    )
  );

  const activeMission =
    missions[activeIndex] || missions[0];

  const completedCount = missions.filter(
    (mission) => Boolean(completion[mission.id])
  ).length;

  const progress = Math.round(
    (completedCount / missions.length) * 100
  );

  const firstIncompleteIndex =
    missions.findIndex(
      (mission) => !completion[mission.id]
    );

  /*
   * The first incomplete mission is the furthest
   * unlocked step. Completed earlier steps always
   * remain available.
   */
  const unlockedIndex =
    firstIncompleteIndex === -1
      ? missions.length - 1
      : firstIncompleteIndex;

  const currentComplete = Boolean(
    completion[activeMission.id]
  );

  const nextMission = useMemo(() => {
    return (
      missions
        .slice(activeIndex + 1)
        .find(
          (mission) =>
            !completion[mission.id]
        ) || null
    );
  }, [activeIndex, completion]);

  function selectMission(
    mission: FirmMission,
    index: number
  ) {
    const complete = Boolean(
      completion[mission.id]
    );

    const accessible =
      complete || index <= unlockedIndex;

    if (!accessible) return;

    setActive(mission.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function continueToNextMission() {
    if (!currentComplete) return;

    const next =
      missions[activeIndex + 1];

    if (!next) return;

    setActive(next.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-14 pt-8 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1380px]">
        <TopFloatingMenu />

        <header className="mt-6 overflow-hidden rounded-[36px] border border-white/10 bg-[#080909] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
                Build Your Firm
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.065em] sm:text-5xl">
                Step {activeIndex + 1} of{" "}
                {missions.length}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                Complete one step at a time.
                Everything saves automatically,
                but you decide when to continue.
              </p>
            </div>

            <div className="min-w-[210px] rounded-[22px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                    Firm completion
                  </p>

                  <p className="mt-2 text-4xl font-black tracking-[-0.06em]">
                    {progress}%
                  </p>
                </div>

                <p className="text-xs font-semibold text-white/30">
                  {completedCount}/
                  {missions.length}
                </p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-[#b6ff00] transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-2 sm:grid-cols-5">
            {missions.map((mission, index) => {
              const complete = Boolean(
                completion[mission.id]
              );

              const selected =
                mission.id === active;

              const locked =
                !complete &&
                index > unlockedIndex;

              return (
                <button
                  key={mission.id}
                  type="button"
                  disabled={locked}
                  onClick={() =>
                    selectMission(
                      mission,
                      index
                    )
                  }
                  className={`rounded-[18px] border px-4 py-4 text-left transition ${
                    locked
                      ? "cursor-not-allowed border-white/[0.05] bg-white/[0.01] opacity-30"
                      : selected
                        ? "border-[#b6ff00]/35 bg-[#b6ff00]/[0.07]"
                        : complete
                          ? "border-[#b6ff00]/15 bg-[#b6ff00]/[0.025] hover:bg-[#b6ff00]/[0.05]"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full border text-[9px] font-black ${
                        complete
                          ? "border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00]"
                          : selected
                            ? "border-[#b6ff00]/35 text-[#b6ff00]"
                            : "border-white/10 text-white/25"
                      }`}
                    >
                      {complete
                        ? "✓"
                        : locked
                          ? "×"
                          : mission.number}
                    </span>

                    <span className="text-[8px] font-black uppercase tracking-[0.14em] text-white/25">
                      {complete
                        ? "Completed"
                        : locked
                          ? "Locked"
                          : selected
                            ? "Current"
                            : "Available"}
                    </span>
                  </div>

                  <p className="mt-3 truncate text-sm font-black">
                    {mission.shortTitle}
                  </p>
                </button>
              );
            })}
          </div>
        </header>

        <main className="mt-5 space-y-6">
          {active === "identity" ? (
            <HeroPreview />
          ) : null}

          <section
            key={active}
            className="w-full animate-[fadeIn_.18s_ease-out] rounded-[30px] border border-white/10 bg-[#080909] p-5 sm:p-7 lg:p-8"
          >
            <div className="border-b border-white/10 pb-5">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#b6ff00]">
                Step {activeIndex + 1} of{" "}
                {missions.length}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                {activeMission.title}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/35">
                {activeMission.description}
              </p>
            </div>

            <div className="mt-6">
              {active === "identity" ? (
                <IdentityEditor />
              ) : active === "gallery" ? (
                <GalleryEditor />
              ) : active === "research" ? (
                <ResearchEditor />
              ) : active === "journal" ? (
                <JournalEditor />
              ) : active === "products" ? (
                <ProductsEditor />
              ) : null}
            </div>
          </section>

          <section
            className={`flex flex-col gap-5 rounded-[28px] border p-6 sm:flex-row sm:items-center sm:justify-between ${
              currentComplete
                ? "border-[#b6ff00]/20 bg-[#b6ff00]/[0.045]"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div>
              <p
                className={`text-[9px] font-black uppercase tracking-[0.24em] ${
                  currentComplete
                    ? "text-[#b6ff00]"
                    : "text-white/25"
                }`}
              >
                {currentComplete
                  ? "Step complete"
                  : "Autosaving"}
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                {currentComplete
                  ? nextMission
                    ? `Next: ${nextMission.title}`
                    : "Your firm is complete"
                  : `Finish ${activeMission.title.toLowerCase()}`}
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
                {currentComplete
                  ? nextMission
                    ? nextMission.description
                    : "Your public firm is ready for the publishing step."
                  : `This step unlocks ${activeMission.reward.toLowerCase()}. Your work is saved automatically.`}
              </p>
            </div>

            {nextMission ? (
              <button
                type="button"
                disabled={!currentComplete}
                onClick={continueToNextMission}
                className="h-13 shrink-0 rounded-full bg-[#b6ff00] px-8 text-[10px] font-black uppercase tracking-[0.16em] text-black transition disabled:cursor-not-allowed disabled:opacity-25"
              >
                Continue →
              </button>
            ) : state.uid ? (
              <a
                href={`/m/${state.uid}`}
                target="_blank"
                rel="noreferrer"
                className={`flex h-13 shrink-0 items-center justify-center rounded-full px-8 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                  currentComplete
                    ? "bg-[#b6ff00] text-black"
                    : "pointer-events-none bg-white/10 text-white/25"
                }`}
              >
                Preview My Firm ↗
              </a>
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}
