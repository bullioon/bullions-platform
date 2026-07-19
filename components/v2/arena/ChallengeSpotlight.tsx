"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/v2/ui/Button";

export function ChallengeSpotlight() {
  const [left, setLeft] = useState({ d: 19, h: 23, m: 59, s: 59 });

  useEffect(() => {
    const endsAt = Date.now() + 20 * 24 * 60 * 60 * 1000;

    const id = setInterval(() => {
      const diff = Math.max(0, endsAt - Date.now());

      setLeft({
        d: Math.floor(diff / (24 * 60 * 60 * 1000)),
        h: Math.floor((diff / (60 * 60 * 1000)) % 24),
        m: Math.floor((diff / (60 * 1000)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <section id="challenge" className="mx-auto max-w-[1180px] px-4">
      <div className="rounded-[36px] border border-[#d6b35a]/20 bg-[#080909] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d6b35a]">
              Mission
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.065em] md:text-5xl">
              Become a funded trader.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              Enter Season 03, trade your strategy, finish inside the leaders,
              receive capital, and earn from copiers.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <TimeBox value={left.d} label="D" />
            <TimeBox value={left.h} label="H" />
            <TimeBox value={left.m} label="M" />
            <TimeBox value={left.s} label="S" />
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-6">
          <Step n="01" title="Apply" desc="Register strategy" active />
          <Step n="02" title="Demo" desc="Receive account" />
          <Step n="03" title="Trade" desc="20 day season" />
          <Step n="04" title="Top Six" desc="Rank up" />
          <Step n="05" title="Capital" desc="Up to 200K" />
          <Step n="06" title="Earn" desc="30% from copiers" />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
              What happens if you make Top Six?
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Reward label="Funded Capital" value="$200K" />
              <Reward label="Copy Revenue" value="30%" green />
              <Reward label="Certification" value="Uranium" gold />
            </div>
          </div>

          <div className="rounded-[30px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.035] p-5">
            <div className="grid grid-cols-2 gap-3">
              <Mini label="Active Traders" value="127" />
              <Mini label="Seats Left" value="12 / 20" green />
              <Mini label="Season" value="03" />
              <Mini label="Entry From" value="$90" />
            </div>

            <Link href="/manager/strategies/new?source=challenge&returnTo=/challenge">
              <Button className="mt-5 w-full">Join Season 03</Button>
            </Link>
          </div>
        </div>

        <p className="mt-7 text-center text-xs font-semibold text-white/35">
          Today’s challengers become tomorrow’s leaders.
        </p>
      </div>
    </section>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-16 rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-2 text-center">
      <p className="text-2xl font-black tracking-[-0.05em]">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#d6b35a]">
        {label}
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
  active = false,
}: {
  n: string;
  title: string;
  desc: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border p-4 ${
        active
          ? "border-[#b6ff00]/30 bg-[#b6ff00]/[0.045]"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <p className={`text-[10px] font-black ${active ? "text-[#b6ff00]" : "text-white/25"}`}>
        {n}
      </p>
      <p className="mt-3 text-base font-black">{title}</p>
      <p className="mt-1 text-xs text-white/35">{desc}</p>
    </div>
  );
}

function Reward({
  label,
  value,
  green = false,
  gold = false,
}: {
  label: string;
  value: string;
  green?: boolean;
  gold?: boolean;
}) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-black tracking-[-0.055em] ${
          green ? "text-[#b6ff00]" : gold ? "text-[#d6b35a]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Mini({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>
      <p className={`mt-2 text-lg font-black ${green ? "text-[#b6ff00]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
