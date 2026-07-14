"use client";

import { useEffect, useState } from "react";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";
import {
  managerCapabilities,
  type ManagerCapabilityId,
} from "@/core/v2/manager-os/capabilities";

import { GalleryEditor } from "./GalleryEditor";
import { HeroPreview } from "./HeroPreview";
import { IdentityEditor } from "./IdentityEditor";
import { JournalEditor } from "./JournalEditor";
import { ResearchEditor } from "./ResearchEditor";
import { StudioProvider, useStudio } from "./StudioContext";

type CompletionMap = Partial<Record<ManagerCapabilityId, boolean>>;

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

  const activePlugin = managerCapabilities.find(
    (plugin) => plugin.id === active
  );

  useEffect(() => {
    let alive = true;

    async function loadCompletion() {
      if (!state.uid) return;

      const manager = await ManagerRepository.get(state.uid);

      if (!alive || !manager) return;

      setCompletion({
        identity: Boolean(
          manager.identity.displayName &&
            manager.identity.username &&
            manager.identity.avatarUrl
        ),
        gallery: Boolean(manager.social?.gallery?.length),
        journal: Boolean(manager.social?.journal?.length),
        research: Boolean(manager.social?.research?.length),
        strategies: false,
        products: false,
        publishing:
          manager.status === "LIVE" ||
          manager.status === "VERIFIED",
      });
    }

    loadCompletion().catch(() => {});

    return () => {
      alive = false;
    };
  }, [state.uid, active]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-14 pt-8 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1480px]">
        <TopFloatingMenu />

        <div className="mt-5 grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="h-fit xl:sticky xl:top-24">
            <div className="rounded-[26px] border border-white/10 bg-[#080909] p-3">
              <div className="border-b border-white/10 px-3 pb-4 pt-2">
                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
                  Manager Studio
                </p>

                <p className="mt-2 text-sm leading-5 text-white/35">
                  Build and publish your headquarters.
                </p>
              </div>

              <nav className="mt-3 space-y-1">
                {managerCapabilities.map((plugin) => {
                  const selected = active === plugin.id;
                  const completed = Boolean(completion[plugin.id]);

                  return (
                    <button
                      key={plugin.id}
                      type="button"
                      onClick={() => setActive(plugin.id)}
                      className={`flex w-full items-center gap-3 rounded-[17px] px-4 py-3 text-left transition ${
                        selected
                          ? "bg-[#b6ff00] text-black"
                          : "text-white/45 hover:bg-white/[0.045] hover:text-white"
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px] font-black ${
                          selected
                            ? "border-black/20 bg-black/10 text-black"
                            : completed
                              ? "border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00]"
                              : "border-white/10 text-white/20"
                        }`}
                      >
                        {completed ? "✓" : "·"}
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-black">
                          {plugin.title}
                        </span>

                        <span
                          className={`mt-0.5 block truncate text-[10px] ${
                            selected ? "text-black/55" : "text-white/25"
                          }`}
                        >
                          {completed ? "Complete" : plugin.stage}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              {state.uid ? (
                <a
                  href={`/m/${state.uid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-[9px] font-black uppercase tracking-[0.15em] text-white/55 transition hover:text-white"
                >
                  View Public HQ ↗
                </a>
              ) : null}
            </div>
          </aside>

          <main className="min-w-0 space-y-5">
            {active === "identity" ? <HeroPreview /> : null}

            <section
              key={active}
              className="animate-[fadeIn_.18s_ease-out] rounded-[30px] border border-white/10 bg-[#080909] p-5 sm:p-7 lg:p-8"
            >
              <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
                    Manager Capability
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                    {activePlugin?.title}
                  </h1>

                  <p className="mt-2 text-sm text-white/35">
                    {activePlugin?.description}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] ${
                    completion[active]
                      ? "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]"
                      : "border-white/10 bg-white/[0.03] text-white/30"
                  }`}
                >
                  {completion[active] ? "Complete" : "In progress"}
                </span>
              </div>

              <div className="mt-6">
                {active === "identity" ? (
                  <IdentityEditor />
                ) : active === "gallery" ? (
                  <GalleryEditor />
                ) : active === "journal" ? (
                  <JournalEditor />
                ) : active === "research" ? (
                  <ResearchEditor />
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 p-10 text-sm text-white/35">
                    {activePlugin?.title} capability coming soon.
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
