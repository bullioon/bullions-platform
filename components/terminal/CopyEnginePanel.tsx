type Props = {
  isActive: boolean;
  traderName?: string;
  selectedTraderName?: string;
  depositedUsd: number;
  profitUsd: number;
  onToggle: () => void;
  onDisconnect: () => void;
};

export function CopyEnginePanel({
  isActive,
  traderName,
  selectedTraderName,
  depositedUsd,
  profitUsd,
  onToggle,
  onDisconnect,
}: Props) {
  const displayTrader = traderName || selectedTraderName;
  const canRun = Boolean(displayTrader) && depositedUsd > 0;

  return (
    <section className="rounded-[24px] bg-[#111214] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm text-[#8f96a3]">Copy Engine</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {isActive ? "System active" : "System paused"}
          </h2>
          <p className="mt-2 text-sm text-[#8f96a3]">
            {displayTrader ? `Ready to copy ${displayTrader}` : "Select a trader from the leaderboard."}
          </p>
        </div>

        <button
          onClick={onToggle}
          disabled={!canRun}
          className={`relative h-10 w-20 rounded-full transition disabled:opacity-30 ${
            isActive ? "bg-[#b6ff00]" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-1 h-8 w-8 rounded-full bg-black transition ${
              isActive ? "left-11" : "left-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[#8f96a3]">Deposited</p>
          <p className="mt-1 text-sm font-medium text-white">${depositedUsd.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-xs text-[#8f96a3]">Profit</p>
          <p className="mt-1 text-sm font-medium text-[#b6ff00]">
            +${profitUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8f96a3]">Mode</p>
          <p className="mt-1 text-sm font-medium text-white">{isActive ? "Live" : "Paused"}</p>
        </div>
      </div>

      {traderName && (
        <button
          onClick={onDisconnect}
          className="mt-8 h-[56px] w-full rounded-full border border-white/10 text-sm font-semibold text-white/70 transition hover:bg-white/[0.05]"
        >
          Disconnect trader
        </button>
      )}
    </section>
  );
}
