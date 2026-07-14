"use client";

import { useStudio } from "./StudioContext";

function initials(name: string) {
  const clean = name.trim();

  if (!clean) return "6X";

  return clean
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function HeroPreview() {
  const { state } = useStudio();

  const displayName =
    state.displayName.trim() || "Manager name";

  const username =
    state.username.trim() || "manager";

  const tagline =
    state.tagline.trim() ||
    "Investment manager on Bullions.";

  const biography =
    state.biography.trim() ||
    "Add a biography to explain your investment process, markets and risk philosophy.";

  return (
    <section className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[#050606]">
      <div className="relative h-[330px] overflow-hidden">
        {state.bannerUrl ? (
          <img
            src={state.bannerUrl}
            alt={`${displayName} cover preview`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#111_0%,#0b0b0b_40%,#050606_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(182,255,0,.12),transparent_28%)]" />
          </>
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(5,6,6,.22)_45%,rgba(5,6,6,.94)_100%)]" />

        <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#b6ff00]">
                Investment Manager
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-[-0.07em] sm:text-5xl">
                {displayName}
              </h1>

              <p className="mt-2 text-base font-semibold text-white/35">
                @{username}
              </p>

              <p className="mt-4 text-lg text-white/70 sm:text-xl">
                {tagline}
              </p>

              <p className="mt-4 max-w-3xl line-clamp-2 text-sm leading-6 text-white/45">
                {biography}
              </p>
            </div>

            <div className="grid h-24 w-24 sm:h-28 sm:w-28 shrink-0 place-items-center overflow-hidden rounded-[34px] border-4 border-[#050606] bg-[#111312] text-4xl font-black text-[#b6ff00] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              {state.avatarUrl ? (
                <img
                  src={state.avatarUrl}
                  alt={`${displayName} avatar preview`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials(displayName)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid border-t border-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Allocator Score", "92"],
          ["Strategies", "3"],
          ["Following", "$2.8M"],
          ["Runtime", "A+"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="border-b border-white/10 p-6 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b-0"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">
              {label}
            </p>

            <p className="mt-3 text-3xl font-black">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
