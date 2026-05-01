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
            Where investors meet elite traders.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-white/55">
            <span className="rounded-full bg-white/[0.05] px-4 py-2 ring-1 ring-white/5">
              💰 Copy performance
            </span>
            <span className="rounded-full bg-white/[0.05] px-4 py-2 ring-1 ring-white/5">
              📊 Monitor PnL
            </span>
            <span className="rounded-full bg-white/[0.05] px-4 py-2 ring-1 ring-white/5">
              🏆 Compete for funding
            </span>
          </div>

          <p className="mt-6 max-w-[760px] text-base leading-7 text-[#8f96a3]">
            Bullions gives investors a clean copy-trading dashboard and gives traders
            challenges, tools, prizes and a path to funding through consistency.
          </p>

          <div className="mt-10 grid w-full max-w-[620px] gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] bg-white/[0.04] p-4 text-left ring-1 ring-white/5">
              <p className="text-sm font-semibold text-white">For investors</p>
              <p className="mt-1 text-xs leading-5 text-[#8f96a3]">
                Compare traders, copy with one switch, track wallet growth.
              </p>
            </div>

            <div className="rounded-[22px] bg-white/[0.04] p-4 text-left ring-1 ring-white/5">
              <p className="text-sm font-semibold text-white">For traders</p>
              <p className="mt-1 text-xs leading-5 text-[#8f96a3]">
                Prove consistency, win weekly rewards, unlock funding.
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
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ONE LINE EXPLAINER */}
      <section
        id="system"
        className="rounded-[36px] bg-[#090a0c] p-8 ring-1 ring-white/5"
      >
        <p className="text-sm text-[#b6ff00]">The Bullions system</p>

        <h2 className="mt-3 max-w-[980px] text-5xl font-semibold leading-tight tracking-tight text-white">
          Investors copy performance.
          <span className="block text-white/45">
            Traders prove consistency.
          </span>
        </h2>

        <p className="mt-5 max-w-[760px] text-base leading-7 text-[#8f96a3]">
          Bullions is a two-sided trading ecosystem. Investors get a clean system
          to compare and copy traders. Traders get tools, challenges, prizes and
          a path to funding.
        </p>
      </section>

      {/* DIDACTIC MOCKUP */}
      <section className="grid gap-8 rounded-[36px] bg-[#050607] p-8 ring-1 ring-white/5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm text-[#b6ff00]">Understand it in 3 seconds</p>
          <h2 className="mt-3 text-5xl font-semibold leading-tight tracking-tight text-white">
            See the trader.
            <span className="block text-white/45">Copy the system.</span>
          </h2>
          <p className="mt-5 max-w-[560px] text-base leading-7 text-[#8f96a3]">
            The dashboard shows only what matters: balance, profit, trader status,
            risk, PnL chart and leaderboard. No noise.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[32px] bg-[#101114] p-5 ring-1 ring-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.12),transparent_38%)]" />

          <div className="relative rounded-[28px] bg-black/35 p-5 ring-1 ring-white/10">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-semibold italic text-white">bullions</span>
              <span className="rounded-full bg-[#b6ff00]/10 px-3 py-1 text-xs text-[#b6ff00]">
                Copy engine live
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[#111214] p-5">
                <p className="text-xs text-[#8f96a3]">Investor wallet</p>
                <h3 className="mt-2 text-4xl font-semibold text-white">$4,765</h3>
                <p className="mt-2 text-sm text-[#b6ff00]">+58.9% PnL</p>
              </div>

              <div className="rounded-[24px] bg-[#111214] p-5">
                <p className="text-xs text-[#8f96a3]">Copying trader</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Ghost Alpha</h3>
                <p className="mt-2 text-sm text-[#8f96a3]">
                  Risk medium · active
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-[#111214] p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-[#8f96a3]">Live performance</p>
                <p className="text-xs text-[#b6ff00]">Profit + Deposited</p>
              </div>

              <div className="relative h-[140px] overflow-hidden rounded-[18px] bg-black/30">
                <svg viewBox="0 0 520 140" className="h-full w-full">
                  <path
                    d="M20 100 C70 80 100 110 145 82 C190 50 230 65 270 55 C315 45 350 82 385 58 C430 28 470 35 500 18"
                    fill="none"
                    stroke="#b6ff00"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 100 C70 80 100 110 145 82 C190 50 230 65 270 55 C315 45 350 82 385 58 C430 28 470 35 500 18 L500 140 L20 140 Z"
                    fill="rgba(182,255,0,0.10)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INVESTOR VS TRADER */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[32px] bg-[#111214] p-8 ring-1 ring-white/5">
          <p className="text-sm text-[#b6ff00]">Investor side</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Copy, monitor, manage.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#8f96a3]">
            For users who want exposure to trading performance without guessing
            every entry alone.
          </p>

          <div className="mt-7 grid gap-3">
            {investorSteps.map(([n, title, text]) => (
              <div key={title} className="grid grid-cols-[48px_1fr] gap-4 rounded-[20px] bg-black/25 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#b6ff00] text-xs font-bold text-black">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-[#8f96a3]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-[#111214] p-8 ring-1 ring-white/5">
          <p className="text-sm text-[#b6ff00]">Trader side</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Compete, prove, get funded.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#8f96a3]">
            For traders who want free tools, weekly prizes and funding by
            proving discipline.
          </p>

          <div className="mt-7 grid gap-3">
            {traderSteps.map(([n, title, text]) => (
              <div key={title} className="grid grid-cols-[48px_1fr] gap-4 rounded-[20px] bg-black/25 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#b6ff00] text-xs font-bold text-black">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-[#8f96a3]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="rounded-[36px] bg-[#090a0c] p-8 ring-1 ring-white/5">
        <p className="text-sm text-[#b6ff00]">Key features</p>
        <h2 className="mt-3 text-5xl font-semibold tracking-tight text-white">
          Built to feel obvious.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map(([title, text]) => (
            <div key={title} className="rounded-[24px] bg-white/[0.04] p-6 ring-1 ring-white/5">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#8f96a3]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="rounded-[32px] bg-[#b6ff00] p-10 text-center text-black">
        <h2 className="text-4xl font-semibold tracking-tight">
          Open BullPad and see it live.
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-sm text-black/60">
          Login, deposit, compare traders, activate the Copy Engine and monitor
          your performance.
        </p>

        <a
          href="/bullpad"
          className="mx-auto mt-8 grid h-[56px] w-fit place-items-center rounded-full bg-black px-9 text-sm font-semibold text-white"
        >
          Launch BullPad
        </a>
      </section>
    </section>
  );
}
