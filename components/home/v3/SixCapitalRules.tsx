const watched = [
  ["Trader A", "Stable"],
  ["Trader B", "Improving"],
  ["Trader C", "Risk Change"],
  ["Trader D", "Verified"],
];

export function SixCapitalRules() {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="relative overflow-hidden rounded-[38px] border border-[#c084fc]/20 bg-[#0b0810] p-7 sm:p-10">
        <div className="absolute right-0 top-0 h-[380px] w-[380px] rounded-full bg-[#c084fc]/10 blur-[130px]" />

        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c084fc]">
            SIX Intelligence
          </p>

          <h2 className="mt-4 text-5xl font-black leading-[0.94] tracking-[-0.07em]">
            The market changes.
            <span className="block text-white/25">
              SIX keeps watching.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
            The best trader today may not be the best trader next month.
            SIX continuously studies behavior, consistency and risk.
          </p>

          <div className="mt-9 space-y-3">
            {watched.map(([name, status], index) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-[20px] border border-white/10 bg-black/25 px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="relative grid h-9 w-9 place-items-center rounded-full border border-[#c084fc]/25 bg-[#c084fc]/10 text-[9px] font-black text-[#c084fc]">
                    {index + 1}

                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-[#b6ff00]" />
                  </span>

                  <p className="font-black">
                    {name}
                  </p>
                </div>

                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                  {status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-[38px] border border-[#f4c868]/20 bg-[#0e0c07] p-7 sm:p-10">
        <div className="absolute left-0 top-0 h-[380px] w-[380px] rounded-full bg-[#f4c868]/10 blur-[130px]" />

        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f4c868]">
            Capital Rules™
          </p>

          <h2 className="mt-4 text-5xl font-black leading-[0.94] tracking-[-0.07em]">
            Your capital
            <span className="block text-white/25">
              follows rules.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
            Allocations are managed through strict limits designed to maintain
            maximum control over concentration, behavior and risk.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              ["Exposure Limits", "Control concentration."],
              ["Risk Thresholds", "Respond to drawdown."],
              ["Behavior Monitoring", "Detect strategy changes."],
              ["Allocation Control", "Pause or rebalance."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-[22px] border border-white/10 bg-black/25 p-5"
              >
                <p className="font-black">
                  {title}
                </p>

                <p className="mt-2 text-sm text-white/35">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
