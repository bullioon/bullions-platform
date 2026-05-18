"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const nextSunday = new Date(now);

  const day = now.getDay();
  const daysUntilSunday = (7 - day) % 7 || 7;

  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0);

  const diff = Math.max(0, nextSunday.getTime() - now.getTime());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const emptyTime: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

export function ChallengeRegister() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(emptyTime);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const displayTime = mounted ? timeLeft : emptyTime;

  return (
    <section
      id="challenge"
      className="relative overflow-hidden rounded-[28px] bg-[#101114] p-7 ring-1 ring-white/5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.14),transparent_42%)]" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#b6ff00]">Next Challenge</p>

            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
              $10,000 Cash
            </h2>

            <p className="mt-2 max-w-[430px] text-sm leading-6 text-white/45">
              1st place wins cash. 2nd and 3rd receive direct $10K funding accounts.
            </p>
          </div>

          <span className="rounded-full bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/55 ring-1 ring-white/10">
            Prize pool
          </span>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="rounded-[22px] bg-black/35 p-5 ring-1 ring-[#b6ff00]/25 shadow-[0_0_35px_rgba(182,255,0,0.10)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b6ff00]">
                  1st place
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  $10,000 Cash
                </p>
              </div>

              <div className="rounded-full bg-[#b6ff00]/10 px-4 py-2 text-xs font-bold text-[#b6ff00] ring-1 ring-[#b6ff00]/20">
                CASH
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] bg-white/[0.055] p-4 ring-1 ring-white/5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                2nd place
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                $10K Funding
              </p>
            </div>

            <div className="rounded-[20px] bg-white/[0.055] p-4 ring-1 ring-white/5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                3rd place
              </p>
              <p className="mt-1 text-xl font-semibold text-white">
                $10K Funding
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-white/55">
          Resets every Sunday at 00:00.
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            [displayTime.days, "D"],
            [displayTime.hours, "H"],
            [displayTime.minutes, "M"],
            [displayTime.seconds, "S"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-[18px] bg-black/30 py-4 text-center ring-1 ring-white/5"
            >
              <p className="text-2xl font-semibold text-white">
                {String(value).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[11px] text-[#b6ff00]">{label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            window.open("https://discord.gg/bullions", "_blank", "noopener,noreferrer");
          }}
          className="mt-6 h-[58px] w-full rounded-full bg-[#b6ff00] text-sm font-semibold text-black shadow-[0_0_45px_rgba(182,255,0,0.20)] transition hover:opacity-90 active:scale-[0.98]"
        >
          Register for next challenge
        </button>
      </div>
    </section>
  );
}
