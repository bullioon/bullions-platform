"use client";

import { UranioEvent } from "@/components/terminal/UranioEvent";

type Props = {
  depositedUsd: number;
  profitUsd: number;
  onDepositAmount: (amount: number) => void;
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="h-full rounded-full bg-[#b6ff00] shadow-[0_0_25px_rgba(182,255,0,0.25)]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function TierOpportunity({ depositedUsd, profitUsd, onDepositAmount }: Props) {
  const portfolio = Math.max(0, depositedUsd + profitUsd);

  if (depositedUsd < 500 && portfolio >= 350) {
    const progress = Math.min(100, Math.round((portfolio / 500) * 100));

    return (
      <section className="relative overflow-hidden rounded-[34px] border border-[#b6ff00]/15 bg-[#060806] p-6 shadow-[0_0_80px_rgba(182,255,0,0.07)]">
        <div className="absolute right-[-90px] top-[-90px] h-[240px] w-[240px] rounded-full bg-[#b6ff00]/10 blur-[90px]" />

        <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
              Hellion invite ready
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
              Step into Hellion
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">
              You’re close to the next engine class. Add $150 collateral and receive a $200 upgrade credit.
            </p>

            <div className="mt-5 max-w-xl">
              <div className="mb-2 flex justify-between text-xs text-white/35">
                <span>Hellion access</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          </div>

          <button
            onClick={() => onDepositAmount(150)}
            className="h-14 rounded-2xl bg-[#b6ff00] px-8 text-sm font-black text-black transition hover:scale-[1.01]"
          >
            Add $150 Collateral
          </button>
        </div>
      </section>
    );
  }

  if (depositedUsd >= 500 && depositedUsd < 1000 && portfolio >= 600) {
    const progress = Math.min(100, Math.round((portfolio / 1000) * 100));

    return (
      <section className="relative overflow-hidden rounded-[34px] border border-[#b6ff00]/15 bg-[#060806] p-6 shadow-[0_0_80px_rgba(182,255,0,0.07)]">
        <div className="absolute right-[-90px] top-[-90px] h-[260px] w-[260px] rounded-full bg-[#8b5cf6]/18 blur-[90px]" />
        <div className="absolute bottom-[-120px] left-[-120px] h-[260px] w-[260px] rounded-full bg-[#b6ff00]/8 blur-[100px]" />

        <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c4b5fd]">
                Torion invite ready
              </p>
              <span className="rounded-full border border-[#b6ff00]/15 bg-[#b6ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
                Uranio access
              </span>
            </div>

            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
              Unlock Torion class
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">
              Add $400 collateral, receive a $300 upgrade credit, and unlock premium access including Uranio event windows.
            </p>

            <div className="mt-5 max-w-xl">
              <div className="mb-2 flex justify-between text-xs text-white/35">
                <span>Torion access</span>
                <span>${Math.round(portfolio).toLocaleString()} / $1,000</span>
              </div>
              <ProgressBar value={progress} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">+$300 upgrade credit</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Unlimited withdrawals</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Uranio events</span>
            </div>
          </div>

          <button
            onClick={() => onDepositAmount(400)}
            className="h-14 rounded-2xl bg-[#b6ff00] px-8 text-sm font-black text-black transition hover:scale-[1.01]"
          >
            Unlock Torion
          </button>
        </div>
      </section>
    );
  }

  if (depositedUsd >= 1000) {
    return <UranioEvent isTorion onAddCollateral={() => onDepositAmount(380)} />;
  }

  return null;
}
