"use client";

import { useEffect, useState } from "react";

import {
  Badge,
  Button,
  Glow,
  Heading,
  Section,
} from "@/components/ui";

const states = [
  {
    label: "Watching Strategy Universe",
    detail: "Tracking performance and behavior.",
    signal: "248 signals monitored",
  },
  {
    label: "Analyzing risk",
    detail: "Comparing drawdown and exposure.",
    signal: "Risk stable",
  },
  {
    label: "Behavior changed",
    detail: "Position sizing moved outside normal range.",
    signal: "Review active",
  },
  {
    label: "Capital protected",
    detail: "Allocation controls remain ready.",
    signal: "Protection online",
  },
];

export function Six() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % states.length);
    }, 3200);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const active = states[activeIndex];

  return (
    <Section className="border-[#c084fc]/20 bg-[#09070d]">
      <Glow tone="purple" className="-left-32 -top-28" />

      <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <Badge tone="purple">SIX Intelligence</Badge>

          <Heading className="mt-6">
            Capital
            <span className="block text-white/25">
              never sleeps.
            </span>
          </Heading>

          <p className="mt-6 max-w-lg text-sm leading-7 text-white/40">
            SIX watches behavior, consistency and risk while capital is active.
          </p>

          <Button
            href="/risk"
            variant="secondary"
            className="mt-8 border-[#c084fc]/25 text-[#d8b4fe] hover:border-[#c084fc]/45 hover:bg-[#c084fc]/10"
          >
            See SIX in action →
          </Button>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-[#c084fc]/20 bg-[#070609] shadow-[0_30px_120px_rgba(192,132,252,.08)]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#b6ff00] shadow-[0_0_16px_rgba(182,255,0,.8)]" />

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
                SIX Live
              </p>
            </div>

            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/20">
              Runtime 06
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-[28px] border border-white/[0.08] bg-black/30 p-6 sm:p-8">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#c084fc]">
                Current state
              </p>

              <div
                key={active.label}
                className="animate-[fadeIn_.45s_ease-out]"
              >
                <h3 className="mt-5 text-3xl font-black leading-[0.95] tracking-[-0.055em] text-white sm:text-5xl">
                  {active.label}
                </h3>

                <p className="mt-4 max-w-lg text-sm leading-6 text-white/35">
                  {active.detail}
                </p>

                <div className="mt-8 flex items-center justify-between gap-4 rounded-[20px] border border-white/[0.08] bg-white/[0.025] px-5 py-4">
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/25">
                    SIX signal
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#b6ff00]">
                    {active.signal}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {states.map((state, index) => (
                <button
                  key={state.label}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition duration-300 ${
                    index === activeIndex
                      ? "bg-[#c084fc]"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  aria-label={`Show ${state.label}`}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.15em] text-white/20">
              <span>Strategy Universe</span>
              <span>Updated now</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
