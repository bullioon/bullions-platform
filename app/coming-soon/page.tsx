"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const LAUNCH_AT = new Date(
  process.env.NEXT_PUBLIC_BULLIONS_LAUNCH_AT ||
    "2026-07-13T00:00:00Z"
).getTime();

function remainingTime(now: number) {
  const distance = Math.max(0, LAUNCH_AT - now);
  const seconds = Math.floor(distance / 1000);

  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    complete: distance === 0,
  };
}

function CountdownUnit({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] px-2 py-5 text-center backdrop-blur-xl sm:px-6 sm:py-7">
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#b6ff00]/45 to-transparent" />

      <p className="text-3xl font-black leading-none tracking-[-0.06em] text-white sm:text-5xl">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-3 text-[8px] font-black uppercase tracking-[0.28em] text-white/30 sm:text-[9px]">
        {label}
      </p>
    </div>
  );
}

export default function ComingSoonPage() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const remaining = useMemo(
    () => remainingTime(now ?? LAUNCH_AT),
    [now]
  );

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#030504] px-5 text-white sm:px-8">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_18%,rgba(182,255,0,0.16),transparent_30%),radial-gradient(circle_at_84%_78%,rgba(48,99,255,0.10),transparent_28%),linear-gradient(180deg,#050807_0%,#020303_100%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:54px_54px]" />

      {/* Orbital object */}
      <div className="pointer-events-none absolute left-1/2 top-[39%] h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[1px] sm:h-[720px] sm:w-[720px]">
        <div className="absolute inset-[12%] rounded-full border border-[#b6ff00]/15 shadow-[0_0_120px_rgba(182,255,0,0.12)]" />
        <div className="absolute inset-[25%] rounded-full border border-white/[0.06]" />
        <div className="absolute inset-[38%] rounded-full bg-[#b6ff00]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1500px] flex-col">
        <header className="flex items-center justify-between py-7 sm:py-9">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Bullions"
              width={38}
              height={38}
              priority
              className="h-9 w-9 object-contain"
            />

            <div>
              <p className="text-sm font-black uppercase tracking-[-0.03em] sm:text-base">
                Bullions
              </p>
              <p className="mt-0.5 text-[7px] font-black uppercase tracking-[0.28em] text-white/25 sm:text-[8px]">
                Financial Operating System
              </p>
            </div>
          </div>

          <div className="rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/[0.06] px-4 py-2 text-[8px] font-black uppercase tracking-[0.26em] text-[#b6ff00] sm:text-[9px]">
            V6 Incoming
          </div>
        </header>

        <section className="flex flex-1 items-center py-12 sm:py-20">
          <div className="w-full">
            <p className="text-[9px] font-black uppercase tracking-[0.42em] text-[#b6ff00] sm:text-[10px]">
              The next Bullions era
            </p>

            <h1 className="mt-6 max-w-[1100px] text-[18vw] font-black leading-[0.79] tracking-[-0.09em] sm:text-[112px] lg:text-[150px]">
              CAPITAL
              <br />
              EVOLVED.
            </h1>

            <div className="mt-8 flex max-w-3xl flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35 sm:text-xs">
              <span>Verified MT5 performance</span>
              <span className="text-[#b6ff00]/50">•</span>
              <span>Intelligent allocation</span>
              <span className="text-[#b6ff00]/50">•</span>
              <span>Live execution</span>
            </div>

            <p className="mt-7 max-w-2xl text-sm leading-7 text-white/42 sm:text-base">
              A new operating system for traders, capital and verified
              performance. Bullions V6 is currently entering private beta.
            </p>

            {now === null ? (
              <div className="mt-11 grid max-w-3xl grid-cols-4 gap-2 sm:gap-4">
                <CountdownUnit value={0} label="Days" />
                <CountdownUnit value={0} label="Hours" />
                <CountdownUnit value={0} label="Minutes" />
                <CountdownUnit value={0} label="Seconds" />
              </div>
            ) : remaining.complete ? (
              <div className="mt-12 inline-flex rounded-full border border-[#b6ff00]/30 bg-[#b6ff00]/10 px-7 py-4 text-xs font-black uppercase tracking-[0.25em] text-[#b6ff00]">
                Launch sequence initiated
              </div>
            ) : (
              <div className="mt-11 grid max-w-3xl grid-cols-4 gap-2 sm:gap-4">
                <CountdownUnit value={remaining.days} label="Days" />
                <CountdownUnit value={remaining.hours} label="Hours" />
                <CountdownUnit value={remaining.minutes} label="Minutes" />
                <CountdownUnit value={remaining.seconds} label="Seconds" />
              </div>
            )}
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/[0.07] py-7 text-[8px] font-black uppercase tracking-[0.24em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bullions 6X</p>
          <p>Private beta in progress</p>
        </footer>
      </div>
    </main>
  );
}
