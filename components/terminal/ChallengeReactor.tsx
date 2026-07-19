"use client";

import Image from "next/image";

export function ChallengeReactor() {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#b6ff00]/10 bg-[#070807]">

      <div className="relative h-[340px] overflow-hidden border-b border-white/5">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,255,0,.18),transparent_65%)]" />

        <div className="absolute inset-0">
          <Image
            src="/space.jpg"
            alt="Challenge Reactor"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#070807] via-[#070807]/25 to-transparent" />
        </div>

      </div>

      <div className="space-y-8 p-8">

        <div>

          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#b6ff00]">
            Challenge Reactor
          </p>

          <h2 className="mt-4 text-5xl font-black text-white">
            ONLY SIX
          </h2>

          <p className="mt-3 max-w-sm text-lg leading-8 text-white/55">
            Become the strategy investors choose.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-5 text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-white/35">
              Challenge
            </div>

            <div className="mt-2 text-3xl font-black text-white">
              $50K
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-5 text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-white/35">
              Challenge
            </div>

            <div className="mt-2 text-3xl font-black text-white">
              $200K
            </div>
          </div>

        </div>

        <div>

          <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.25em] text-white/35">

            <span>Season 01</span>

            <span>14 Spots Remaining</span>

          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

            <div className="h-full w-[30%] rounded-full bg-[#b6ff00]" />

          </div>

        </div>

        <button className="h-14 w-full rounded-2xl bg-[#b6ff00] text-sm font-black uppercase tracking-[0.22em] text-black transition hover:scale-[1.02]">
          ENTER THE REACTOR →
        </button>

      </div>

    </section>
  );
}
