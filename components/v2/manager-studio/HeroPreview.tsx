"use client";

import { useStudio } from "./StudioContext";

export function HeroPreview() {
  const { state } = useStudio();

  return (
    <section className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[#050606]">

      <div className="relative h-[520px] overflow-hidden">

        <div className="absolute inset-0 bg-[linear-gradient(180deg,#111_0%,#0b0b0b_40%,#050606_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(182,255,0,.12),transparent_28%)]" />

        <div className="absolute bottom-0 left-0 right-0 p-12">

          <div className="flex items-end justify-between">

            <div className="max-w-4xl">

              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#b6ff00]">
                Investment Manager
              </p>

              <h1 className="mt-4 text-7xl font-black tracking-[-0.08em]">
                {state.displayName}
              </h1>

              <p className="mt-5 text-2xl text-white/70">
                {state.tagline}
              </p>

              <p className="mt-8 max-w-3xl text-lg leading-9 text-white/45">
                {state.biography}
              </p>

            </div>

            <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-[#b6ff00] bg-black text-6xl font-black">
              {state.displayName.charAt(0)}
            </div>

          </div>

        </div>

      </div>

      <div className="grid grid-cols-4 border-t border-white/10">

        {[
          ["Allocator Score","92"],
          ["Strategies","3"],
          ["Following","$2.8M"],
          ["Runtime","A+"]
        ].map(([label,value])=>(
          <div
            key={label}
            className="border-r border-white/10 p-8 last:border-r-0"
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
