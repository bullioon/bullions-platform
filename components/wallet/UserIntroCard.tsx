"use client";

type Props = {
  name: string;
  username: string;
  emoji: string;
  balanceUsd: number;
  profitUsd: number;
  activeTrader?: string;
  systemActive?: boolean;
  onChangeEmoji: (emoji: string) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
};

const emojis = ["💀", "🐺", "🚀", "🧠", "⚡", "🐉", "🦅", "👑"];

function nextEmoji(current: string) {
  const index = emojis.indexOf(current);
  return emojis[(index + 1) % emojis.length];
}

export function UserIntroCard({
  name,
  username,
  emoji,
  balanceUsd,
  profitUsd,
  activeTrader,
  systemActive = false,
  onChangeEmoji,
  onDeposit,
  onWithdraw,
}: Props) {
  const liveWallet = balanceUsd + profitUsd;
  const isProfit = profitUsd >= 0;
  const roi = (profitUsd / Math.max(balanceUsd, 1)) * 100;

  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[#111214] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.10),transparent_34%)]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onChangeEmoji(nextEmoji(emoji))}
              className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.06] text-2xl transition active:scale-95"
            >
              {emoji}
            </button>

            <div>
              <p className="text-lg font-semibold text-white">{name}</p>
              <p className="text-sm text-[#8f96a3]">@{username}</p>
            </div>
          </div>

          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-[#8f96a3]">
            {systemActive ? "Live" : "Paused"}
          </span>
        </div>

        <div className="mt-10">
          <h1 className="text-[58px] font-semibold leading-none tracking-tight text-white">
            ${liveWallet.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </h1>

          <p className={isProfit ? "mt-3 text-base font-medium text-[#b6ff00]" : "mt-3 text-base font-medium text-red-400"}>
            {isProfit ? "+" : "-"}${Math.abs(profitUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} profit
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-[#8f96a3]">
          <span className={systemActive ? "text-[#b6ff00]" : "text-[#8f96a3]"}>
            ● {systemActive ? "Hellion Active" : "Hellion Paused"}
          </span>
          <span>•</span>
          <span>Risk Medium</span>
          <span>•</span>
          <span>Copying {activeTrader || "None"}</span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            onClick={onDeposit}
            className="h-[56px] rounded-full bg-[#b6ff00] text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.98]"
          >
            Deposit
          </button>

          <button
            onClick={onWithdraw}
            className="h-[56px] rounded-full border border-white/10 text-sm font-semibold text-white/70 transition hover:bg-white/[0.05] active:scale-[0.98]"
          >
            Withdraw
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-[#8f96a3]">Deposited</p>
            <p className="mt-1 text-sm font-medium text-white">
              ${balanceUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#8f96a3]">ROI</p>
            <p className="mt-1 text-sm font-medium text-white">+{roi.toFixed(1)}%</p>
          </div>

          <div>
            <p className="text-xs text-[#8f96a3]">Trader</p>
            <p className="mt-1 truncate text-sm font-medium text-white">
              {activeTrader || "None"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
