"use client";

import { useState } from "react";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { managerCapabilities } from "@/core/v2/manager-os/capabilities";

import { GalleryEditor } from "./GalleryEditor";
import { HeroPreview } from "./HeroPreview";
import { IdentityEditor } from "./IdentityEditor";
import { StudioProvider } from "./StudioContext";

export function ManagerStudio() {
  const [active, setActive] =
    useState("identity");

  const activePlugin =
    managerCapabilities.find(
      (plugin) => plugin.id === active
    );

  return (
    <StudioProvider>
      <div className="min-h-screen bg-[#050606] px-4 pb-16 pt-8 text-white">
        <div className="mx-auto max-w-[1800px]">
          <TopFloatingMenu />

          <div className="mt-7 grid gap-8 xl:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="h-fit xl:sticky xl:top-8">
              <div className="mb-7 px-2">
                <p className="text-[9px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
                  Manager Studio
                </p>

                <h1 className="mt-3 text-3xl font-black tracking-[-0.055em]">
                  Build your HQ
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/35">
                  Identity, visual proof and manager content.
                </p>
              </div>

              <nav className="grid gap-2">
                {managerCapabilities.map(
                  (plugin) => (
                    <button
                      key={plugin.id}
                      type="button"
                      onClick={() =>
                        setActive(plugin.id)
                      }
                      className={`rounded-[20px] px-5 py-4 text-left transition ${
                        active === plugin.id
                          ? "bg-[#b6ff00] text-black"
                          : "text-white/40 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <p className="font-black">
                        {plugin.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 opacity-65">
                        {plugin.description}
                      </p>
                    </button>
                  )
                )}
              </nav>
            </aside>

            <main className="min-w-0 space-y-6">
              {active === "identity" ? (
                <HeroPreview />
              ) : null}

              <section className="rounded-[32px] border border-white/10 bg-[#080909] p-6 sm:p-8 lg:p-10">
                <div className="border-b border-white/10 pb-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
                    Manager Capability
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                    {activePlugin?.title}
                  </h2>

                  <p className="mt-2 text-sm text-white/35">
                    {activePlugin?.description}
                  </p>
                </div>

                <div className="mt-7">
                  {active === "identity" ? (
                    <IdentityEditor />
                  ) : active === "gallery" ? (
                    <GalleryEditor />
                  ) : (
                    <div className="rounded-[26px] border border-dashed border-white/10 p-10 text-white/35">
                      {activePlugin?.title} capability coming soon.
                    </div>
                  )}
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </StudioProvider>
  );
}
