"use client";

import Image from "next/image";

const investorSteps = [
  ["01", "Deposit", "Fund your Bullions wallet with crypto."],
  ["02", "Compare", "See traders by ROI, risk and consistency."],
  ["03", "Copy", "Turn on the Copy Engine with one switch."],
  ["04", "Monitor", "Track PnL, profit, deposits and history."],
];

const traderSteps = [
  ["01", "Register", "Join weekly challenges and prove your edge."],
  ["02", "Perform", "Trade with consistency, risk control and rules."],
  ["03", "Rank", "Climb the leaderboard with verified performance."],
  ["04", "Get funded", "Unlock prizes and funding opportunities."],
];

const features = [
  ["Live Leaderboard", "Compare the best traders in seconds."],
  ["Copy Engine", "Start or stop copying anytime."],
  ["Investor Dashboard", "Your wallet, PnL and history in one place."],
  ["Trader Challenges", "Weekly 10,000 USDT prize pool."],
  ["Risk View", "Know who is aggressive, stable or consistent."],
  ["Funding Path", "Free opportunities for traders who prove discipline."],
];

export function BullionsHomeHero() {
  return (
    <section id="home" className="mx-auto max-w-[1480px] space-y-8 pb-16">
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden rounded-[36px] bg-[#020303] px-6 py-24 ring-1 ring-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,255,0,0.18),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(115deg,transparent_0%,transparent_47%,rgba(255,255,255,.12)_48%,transparent_50%)] bg-[size:140px_140px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="absolute h-[520px] w-[520px] rounded-full bg-[#b6ff00]/20 blur-[180px] animate-glow-breath" />

          <div className="relative flex flex-col items-center justify-center gap-2">
            <Image
              src="/logo.png"
              alt="Bullions logo"
              width={170}
              height={170}
              priority
              className="animate-soft-blink-glow object-contain"
            />

            <div className="w-[420px] max-w-[82vw]">
              <Image
                src="/bullions.png"
                alt="Bullions"
                width={900}
                height={320}
                priority
                className="h-auto w-full object-contain animate-fade-up"
              />
            </div>
          </div>

          <p className="mt-6 text-lg font-medium text-white/85">
            Copy traders who survive. Not gamblers who get lucky.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-white/55">
            <span className="rounded-full bg-white/[0.05] px-4 py-2 ring-1 ring-white/5">
              💰 Copy survival
            </span>
            <span className="rounded-full bg-white/[0.05] px-4 py-2 ring-1 ring-white/5">
              🧠 AI risk layer
            </span>
            <span className="rounded-full bg-white/[0.05] px-4 py-2 ring-1 ring-white/5">
              🏆 Traders get rewarded
            </span>
          </div>

          <p className="mt-6 max-w-[760px] text-base leading-7 text-[#8f96a3]">
            Bullions uses AI risk tools, live trader ranking and survival protocols to help investors copy performance without gambling every entry alone.
          </p>

          <div className="mt-10 grid w-full max-w-[620px] gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] bg-white/[0.04] p-4 text-left ring-1 ring-white/5">
              <p className="text-sm font-semibold text-white">For investors</p>
              <p className="mt-1 text-xs leading-5 text-[#8f96a3]">
                Stop guessing entries. Copy traders filtered by performance, risk and consistency.
              </p>
            </div>

            <div className="rounded-[22px] bg-white/[0.04] p-4 text-left ring-1 ring-white/5">
              <p className="text-sm font-semibold text-white">For traders</p>
              <p className="mt-1 text-xs leading-5 text-[#8f96a3]">
                If you make investors money, the system gives you visibility, prizes and funding.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/bullpad"
              className="grid h-[58px] place-items-center rounded-full bg-[#b6ff00] px-9 text-sm font-semibold text-black shadow-[0_0_45px_rgba(182,255,0,0.22)]"
            >
              Enter BullPad
            </a>

            <a
              href="#system"
              className="grid h-[58px] place-items-center rounded-full border border-white/10 px-9 text-sm font-semibold text-white/70 hover:bg-white/[0.05]"
            >
              See Why It Works
            </a>
          </div>
        </div>
      </section>

      {/* LIVE CONVERSION SECTION */}
      <section
        id="system"
        className="relative overflow-hidden rounded-[36px] bg-[#090a0c] p-8 md:p-12 ring-1 ring-white/5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.08),transparent_42%)]" />

        <div className="relative z-10">
          <p className="text-sm text-[#b6ff00]">
            Private copy-trading infrastructure
          </p>

          <h2 className="mt-4 max-w-[980px] text-5xl font-semibold leading-tight tracking-tight text-white md:text-7xl">
            Performance attracts capital.
            <span className="block text-white/40">
              Consistency keeps it.
            </span>
          </h2>

          <p className="mt-7 max-w-[780px] text-lg leading-8 text-[#8f96a3]">
            Bullions is a live dashboard for comparing traders, following performance,
            managing allocation and monitoring PnL through one clean system.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Live ranking", "Compare traders by performance, risk profile and consistency before copying."],
              ["Copy Engine", "Activate, pause and monitor copied traders from one dashboard."],
              ["Trader rewards", "Traders earn visibility through results, discipline and leaderboard performance."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[26px] bg-white/[0.035] p-6 ring-1 ring-white/5"
              >
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#8f96a3]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDGE SECTION */}
      <section className="rounded-[36px] bg-[#090a0c] p-8 ring-1 ring-white/5">
        <p className="text-sm text-[#b6ff00]">Why this hits different</p>

        <h2 className="mt-3 max-w-[1100px] text-5xl font-semibold leading-tight tracking-tight text-white">
          The trader is not the product.
          <span className="block text-white/45">
            The survival system around the trader is.
          </span>
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["No blind copying", "You see ranking, risk, PnL, allocation limits and performance before activating the engine."],
            ["AI risk tools", "TORION scans behavior, volatility and exposure so users are not just following random signals."],
            ["Aligned incentives", "The platform rewards traders who help investors win, not traders who only know how to market themselves."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-[24px] bg-white/[0.04] p-6 ring-1 ring-white/5"
            >
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#8f96a3]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOMO CTA */}
      <section className="relative overflow-hidden rounded-[32px] bg-[#b6ff00] p-10 text-center text-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_40%)]" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-black/55">
            Private access
          </p>

          <h2 className="mx-auto mt-3 max-w-[920px] text-4xl font-semibold tracking-tight">
            A private trading system for capital, consistency and live performance.
          </h2>

          <p className="mx-auto mt-4 max-w-[680px] text-sm leading-6 text-black/60">
            Compare traders, activate copy mode and monitor performance from one clean dashboard.
          </p>

          <a
            href="/bullpad"
            className="mx-auto mt-8 grid h-[56px] w-fit place-items-center rounded-full bg-black px-9 text-sm font-semibold text-white"
          >
            Open BullPad
          </a>
        </div>
      </section>
    </section>
  );
}
