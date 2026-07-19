"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const journey = [
  {
    number: "01",
    title: "Apply",
    description: "Register your strategy.",
  },
  {
    number: "02",
    title: "Get MT5",
    description: "Receive a verified account.",
  },
  {
    number: "03",
    title: "Trade",
    description: "Build your 30-day record.",
  },
  {
    number: "04",
    title: "Reach Top 6",
    description: "Rank through performance.",
  },
  {
    number: "05",
    title: "Build Your Firm",
    description: "Turn proof into capital.",
  },
];

type OutcomeItem = {
  number: string;
  label: string;
  description: string;
  accent: "green" | "purple";
};

const outcomes: OutcomeItem[] = [
  {
    number: "$200K",
    label: "Capital",
    description: "Access a Bullions capital allocation.",
    accent: "green",
  },
  {
    number: "TOP 6",
    label: "Distribution",
    description: "Enter the Strategy Universe.",
    accent: "purple",
  },
  {
    number: "LIVE",
    label: "Investor Visibility",
    description: "Get discovered through verified performance.",
    accent: "purple",
  },
  {
    number: "30%",
    label: "Recurring Revenue",
    description: "Earn from capital following your strategy.",
    accent: "green",
  },
];

export function ProgramJourney() {
  const [left, setLeft] = useState({
    d: 19,
    h: 23,
    m: 59,
    s: 59,
  });

  useEffect(() => {
    const endsAt = Date.now() + 20 * 24 * 60 * 60 * 1000;

    const updateTimer = () => {
      const diff = Math.max(0, endsAt - Date.now());

      setLeft({
        d: Math.floor(diff / (24 * 60 * 60 * 1000)),
        h: Math.floor((diff / (60 * 60 * 1000)) % 24),
        m: Math.floor((diff / (60 * 1000)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    updateTimer();

    const id = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="program-overview"
      className="mx-auto w-full max-w-[1180px] scroll-mt-28 px-4 py-8"
    >
      <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#080909] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
        <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
          <div className="border-b border-white/10 p-6 md:p-9 lg:border-b-0 lg:border-r">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b6ff00]">
                  The Program
                </p>

                <h2 className="mt-4 max-w-[580px] text-4xl font-black tracking-[-0.065em] text-white md:text-5xl">
                  Prove your edge.
                  <span className="block text-white/30">
                    Build your firm.
                  </span>
                </h2>
              </div>

              <SeasonTimer left={left} />
            </div>

            <div className="mt-9">
              {journey.map((step, index) => (
                <JourneyStep
                  key={step.number}
                  {...step}
                  active={index === 0}
                  last={index === journey.length - 1}
                />
              ))}
            </div>
          </div>

          <div className="relative p-6 md:p-9">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.11),transparent_36%)]" />

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.34em] text-violet-300">
                    What You Win
                  </p>

                  <h3 className="mt-4 max-w-[560px] text-3xl font-black tracking-[-0.06em] text-white md:text-5xl">
                    Performance should create opportunity.
                  </h3>
                </div>

                <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                  Top 6
                </span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {outcomes.map((outcome) => (
                  <Outcome key={outcome.label} {...outcome} />
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-4 rounded-[26px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#b6ff00]">
                    Season 03
                  </p>

                  <p className="mt-2 text-sm font-bold text-white">
                    Six positions. One verified path to capital.
                  </p>
                </div>

                <Link
                  href="/manager/strategies/new?source=challenge&returnTo=/challenge"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#b6ff00] px-6 text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.02] hover:bg-white"
                >
                  Apply Now&nbsp;&nbsp;→
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyStep({
  number,
  title,
  description,
  active,
  last,
}: {
  number: string;
  title: string;
  description: string;
  active: boolean;
  last: boolean;
}) {
  return (
    <div className="relative grid grid-cols-[42px_1fr] gap-4">
      <div className="relative flex justify-center">
        <div
          className={[
            "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-[9px] font-black",
            active
              ? "border-[#b6ff00]/40 bg-[#b6ff00]/10 text-[#b6ff00]"
              : "border-white/10 bg-[#0c0d0d] text-white/35",
          ].join(" ")}
        >
          {number}
        </div>

        {!last && (
          <div className="absolute bottom-0 top-9 w-px bg-white/10" />
        )}
      </div>

      <div className={last ? "pb-0 pt-1" : "pb-6 pt-1"}>
        <p
          className={[
            "text-base font-black",
            active ? "text-white" : "text-white/75",
          ].join(" ")}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/35">
          {description}
        </p>
      </div>
    </div>
  );
}

function Outcome({
  number,
  label,
  description,
  accent,
}: {
  number: string;
  label: string;
  description: string;
  accent: "green" | "purple";
}) {
  const isGreen = accent === "green";

  return (
    <article
      className={[
        "rounded-[25px] border p-5",
        isGreen
          ? "border-[#b6ff00]/15 bg-[#b6ff00]/[0.025]"
          : "border-violet-400/15 bg-violet-500/[0.035]",
      ].join(" ")}
    >
      <p
        className={[
          "text-3xl font-black tracking-[-0.06em]",
          isGreen ? "text-[#b6ff00]" : "text-violet-300",
        ].join(" ")}
      >
        {number}
      </p>

      <p className="mt-4 text-sm font-black text-white">
        {label}
      </p>

      <p className="mt-2 text-xs leading-5 text-white/35">
        {description}
      </p>
    </article>
  );
}

function SeasonTimer({
  left,
}: {
  left: {
    d: number;
    h: number;
    m: number;
    s: number;
  };
}) {
  return (
    <div>
      <p className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-white/25">
        Season closes in
      </p>

      <div className="flex gap-1.5">
        <TimeBox value={left.d} label="D" />
        <TimeBox value={left.h} label="H" />
        <TimeBox value={left.m} label="M" />
        <TimeBox value={left.s} label="S" />
      </div>
    </div>
  );
}

function TimeBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-11 rounded-xl border border-white/10 bg-white/[0.025] px-2 py-2 text-center">
      <p className="text-sm font-black text-white">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-0.5 text-[7px] font-black uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>
    </div>
  );
}
