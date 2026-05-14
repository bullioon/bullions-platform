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
          <p
            className={`mt-1 text-sm font-medium ${
              profitUsd >= 0 ? "text-[#b6ff00]" : "text-red-400"
            }`}
          >
            {profitUsd >= 0 ? "+" : "-"}$
            {Math.abs(profitUsd).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8f96a3]">Mode</p>
          <p className="mt-1 text-sm font-medium text-white">{isActive ? "Live" : "Paused"}</p>
        </div>
      </div>


      <div className="mt-5 rounded-[18px] bg-black/25 p-3 ring-1 ring-[#b6ff00]/10 sm:mt-7 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#b6ff00]">
              TORION Scan
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {isActive ? "Engine active" : "Waiting for activation"}
            </p>
          </div>

          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 sm:h-11 sm:w-11">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#b6ff00]" />
          </div>
        </div>

        <div className="mt-3 grid gap-1.5 sm:mt-4 sm:gap-2">
          {["Risk calibrated", "Entry optimized", "Lot size adjusted"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-full bg-white/[0.04] px-3 py-1.5 sm:py-2"
            >
              <span className="text-xs text-white/70">{item}</span>
              <span className="text-[10px] font-semibold text-[#b6ff00]">LIVE</span>
            </div>
          ))}
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06] sm:mt-4">
          <div className="h-full w-[72%] animate-pulse rounded-full bg-[#b6ff00]" />
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-white/35 sm:text-[11px]">
          <span>Next scan in 05s</span>
          <span>TORION adaptive AI</span>
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
