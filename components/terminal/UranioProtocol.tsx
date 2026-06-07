"use client";

type Props = {
  portfolioUsd: number;
};

const URANIO_REQUIRED = 2500;
const URANIO_VISIBLE_FROM = 2100;

export function UranioProtocol({ portfolioUsd }: Props) {
  const tier =
    portfolioUsd >= 1000 ? "TORION" : portfolioUsd >= 500 ? "HELLION" : "BULLION";

  const isTorion = tier === "TORION";
  const showUranioProgress = isTorion && portfolioUsd >= URANIO_VISIBLE_FROM;

  if (tier === "BULLION") {
    return (
      <section className="rounded-[28px] border border-[#b6ff00]/12 bg-[#070807] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
          Upgrade window
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Unlock Torion faster</h3>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Reach $350 balance, add $500 and receive a $200 upgrade bonus toward Torion access.
        </p>
        <div className="mt-4 rounded-2xl bg-[#b6ff00]/10 p-4 text-sm font-semibold text-[#b6ff00] ring-1 ring-[#b6ff00]/15">
          Bonus path: add $500 → get $200 bonus → push toward Torion.
        </div>
      </section>
    );
  }

  if (tier === "HELLION") {
    return (
      <section className="rounded-[28px] border border-[#8b5cf6]/18 bg-[#090711] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c4b5fd]">
          Hellion upgrade
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Torion is close</h3>
        <p className="mt-3 text-sm leading-6 text-white/50">
          At $600 balance, upgrade with $400 and unlock a $300 Torion boost.
        </p>
        <div className="mt-4 rounded-2xl bg-[#8b5cf6]/10 p-4 text-sm font-semibold text-[#c4b5fd] ring-1 ring-[#8b5cf6]/20">
          Add $400 → get $300 bonus → activate Torion access.
        </div>
      </section>
    );
  }

  if (!showUranioProgress) {
    return (
      <section className="rounded-[28px] border border-white/[0.08] bg-[#070807] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
          Classified protocol
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">☢️ Uranio hidden</h3>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Torion detected. Uranio protocol becomes visible after $2,100 portfolio balance.
        </p>
      </section>
    );
  }

  const progress = Math.min(100, Math.round((portfolioUsd / URANIO_REQUIRED) * 100));
  const remaining = Math.max(0, URANIO_REQUIRED - portfolioUsd);
  const unlocked = portfolioUsd >= URANIO_REQUIRED;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#b6ff00]/12 bg-[#070807] p-5 ring-1 ring-white/[0.03]">
      <div className="absolute right-[-70px] top-[-70px] h-[170px] w-[170px] rounded-full bg-[#b6ff00]/10 blur-[70px]" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6ff00] shadow-[0_0_28px_rgba(182,255,0,0.75)]" />

          <div className="absolute inset-0 rounded-full border border-[#b6ff00]/25 animate-[spin_4s_linear_infinite]">
            <span className="absolute left-1/2 top-[-4px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.8)]" />
            <span className="absolute bottom-[-4px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#b6ff00] shadow-[0_0_14px_rgba(182,255,0,0.8)]" />
          </div>

          <div className="absolute inset-2 rotate-45 rounded-full border border-dashed border-[#b6ff00]/25 animate-[spin_6s_linear_infinite_reverse]">
            <span className="absolute right-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#b6ff00]" />
            <span className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/70" />
          </div>

          <div className="absolute inset-4 -rotate-12 rounded-full border border-[#b6ff00]/15 animate-[spin_9s_linear_infinite]">
            <span className="absolute right-[-3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#b6ff00]/80" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                Classified protocol
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                ☢️ Uranio
              </h3>
            </div>

            <span className={
              unlocked
                ? "rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]"
                : "rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/45"
            }>
              {unlocked ? "Active" : "Locked"}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-white/48">
            Rare opportunity engine reserved for large Torion deposits. Profit alone does not unlock Uranio.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.035] p-3 ring-1 ring-white/[0.05]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Required</p>
              <p className="mt-1 text-lg font-semibold text-white">${URANIO_REQUIRED.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.035] p-3 ring-1 ring-white/[0.05]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Remaining</p>
              <p className="mt-1 text-lg font-semibold text-[#b6ff00]">${remaining.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs text-white/35">
              <span>Access progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-[#b6ff00] shadow-[0_0_25px_rgba(182,255,0,0.30)] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!unlocked && (
            <div className="mt-4 rounded-2xl border border-[#b6ff00]/10 bg-[#b6ff00]/5 p-3 text-xs leading-5 text-white/50">
              ☢️ Uranio signal detected · access denied · allocation threshold not met.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
