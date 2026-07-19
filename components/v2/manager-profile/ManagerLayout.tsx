"use client";

import Link from "next/link";

import { managerTemplate } from "@/core/v2/templates/managerTemplate";
import type { ManagerProfile } from "@/types/v2/profile/managerProfile";
import { managerSectionRegistry } from "@/components/v2/manager-profile/sections";

const labels: Record<string, string> = {
  hero: "Overview",
  philosophy: "Philosophy",
  trust: "Trust",
  products: "Strategies",
  research: "Intelligence",
  gallery: "Gallery",
  journal: "Journal",
};

export function ManagerLayout({
  profile,
}: {
  profile: ManagerProfile;
}) {
  const hasGallery =
    (profile.manager.social?.gallery?.length ?? 0) > 0;

  const visibleSections = managerTemplate.filter(
    (id) => id !== "gallery" || hasGallery
  );

  return (
    <div>
      <div className="sticky top-[84px] z-40 mb-8 overflow-x-auto rounded-full border border-white/[0.07] bg-[#080909]/85 p-1.5 shadow-[0_14px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <nav className="flex min-w-max items-center gap-1">
          {visibleSections.map((id) => (
            <a
              key={id}
              href={`#hq-${id === "hero" ? "overview" : id}`}
              className="rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/35 transition hover:bg-white/[0.06] hover:text-white"
            >
              {labels[id] || id}
            </a>
          ))}
        </nav>
      </div>

      <div className="space-y-8">
        {visibleSections.map((id) => {
          const section = managerSectionRegistry[id];

          if (!section) return null;

          return (
            <div
              key={id}
              id={`hq-${id === "hero" ? "overview" : id}`}
              className="scroll-mt-36"
            >
              {section.render(profile)}
            </div>
          );
        })}
      </div>

      <section className="relative mt-8 overflow-hidden rounded-[38px] border border-[#b6ff00]/15 bg-[#080a08] px-7 py-12 text-center sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(182,255,0,0.13),transparent_42%)]" />

        <div className="relative mx-auto max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
            Capital Allocation
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
            Ready to allocate?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/40">
            Add verified strategies to your fund and manage every allocation from BullPad.
          </p>

          <Link
            href="/bullpad"
            className="mt-8 inline-flex h-14 items-center justify-center gap-8 rounded-full bg-[#b6ff00] px-9 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.015] hover:bg-[#c7ff42]"
          >
            <span>Open BullPad</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
