const rewards = [
  "Verified $50K or $200K MT5 account",
  "Weekly rewards and eligible withdrawals",
  "Direct funding opportunities",
  "Crypto rewards and prizes",
  "A public investment firm",
  "Capital from followers and investors",
];

const journey = [
  "Join Challenge",
  "Trade MT5",
  "Build Performance",
  "Climb Ranking",
  "Unlock Rewards",
  "Manage Capital",
];

export function TraderJourney() {
  return (
    <section
      id="trader"
      className="grid gap-5 rounded-[38px] border border-[#b6ff00]/20 bg-[#080a08] p-7 sm:p-10 lg:grid-cols-[1fr_1fr]"
    >
      <div className="flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
            For traders
          </p>

          <h2 className="mt-4 text-5xl font-black leading-[0.94] tracking-[-0.075em] sm:text-7xl">
            You bring
            <span className="block text-white/25">
              the performance.
            </span>

            <span className="block text-[#b6ff00]">
              Bullions brings capital.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
            Your Challenge is not the destination. It is your gateway to
            rewards, visibility, followers and managed capital.
          </p>
        </div>

        <a
          href="/challenge"
          className="mt-8 flex h-14 w-fit items-center justify-center rounded-full bg-[#b6ff00] px-9 text-[10px] font-black uppercase tracking-[0.17em] text-black"
        >
          Get My MT5 Account →
        </a>
      </div>

      <div className="space-y-4">
        <div className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-white/10 bg-black">
          <img
            src="/mt5.jpeg"
            alt="MetaTrader 5"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.9))]" />

          <div className="relative flex min-h-[360px] flex-col justify-end p-7">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#60a5fa]">
              Your Challenge Account
            </p>

            <p className="mt-3 text-5xl font-black tracking-[-0.07em]">
              $200,000
            </p>

            <p className="mt-2 text-sm text-white/40">
              MetaTrader 5 · Verified performance
            </p>

            <div className="mt-7 grid grid-cols-3 gap-2">
              {[
                ["ROI", "+4.21%"],
                ["Rank", "#06"],
                ["Status", "Live"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-white/10 bg-black/45 p-4 backdrop-blur"
                >
                  <p className="text-[8px] font-black uppercase tracking-[0.14em] text-white/25">
                    {label}
                  </p>

                  <p className="mt-2 text-lg font-black">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {rewards.map((reward) => (
            <div
              key={reward}
              className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/20 px-4 py-4"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[9px] font-black text-[#b6ff00]">
                ✓
              </span>

              <p className="text-xs font-semibold text-white/55">
                {reward}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {journey.map((step, index) => (
            <div
              key={step}
              className="rounded-[20px] border border-white/10 bg-black/20 p-5"
            >
              <p className="text-[9px] font-black text-[#b6ff00]">
                {String(index + 1).padStart(2, "0")}
              </p>

              <p className="mt-5 text-sm font-black">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
