const MARKETS = [
  "Gold",
  "BTC",
  "ETH",
  "NAS100",
  "US30",
  "EURUSD",
  "GBPUSD",
  "XAGUSD",
];

type Props = {
  selected: string[];
  primary: string;
  onToggle: (market: string) => void;
  onPrimary: (market: string) => void;
};

export function StepMarkets({ selected, primary, onToggle, onPrimary }: Props) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080909] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
        Markets
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {MARKETS.map((market) => {
          const active = selected.includes(market);

          return (
            <button
              key={market}
              type="button"
              onClick={() => onToggle(market)}
              className={
                active
                  ? "rounded-2xl border border-[#b6ff00]/30 bg-[#b6ff00]/10 p-4 font-black text-[#b6ff00]"
                  : "rounded-2xl border border-white/10 bg-black/20 p-4 font-black text-white/50"
              }
            >
              {market}
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <p className="mb-3 text-sm font-black text-white/60">
          Primary Market
        </p>

        <div className="flex flex-wrap gap-3">
          {selected.length ? (
            selected.map((market) => (
              <button
                key={market}
                type="button"
                onClick={() => onPrimary(market)}
                className={
                  primary === market
                    ? "rounded-full bg-[#b6ff00] px-5 py-2 text-sm font-black text-black"
                    : "rounded-full border border-white/10 px-5 py-2 text-sm font-black text-white/50"
                }
              >
                {market}
              </button>
            ))
          ) : (
            <p className="text-sm text-white/30">
              Select at least one market first.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
