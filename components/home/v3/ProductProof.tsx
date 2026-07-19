export function ProductProof() {
  return (
    <>
      <section className="relative min-h-[560px] overflow-hidden rounded-[38px] border border-white/10 bg-black">
        <img
          src="/mt5.jpeg"
          alt="MetaTrader 5 verified account"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,7,.98),rgba(5,6,7,.75)_48%,rgba(5,6,7,.20))]" />

        <div className="relative flex min-h-[560px] max-w-2xl flex-col justify-center p-8 sm:p-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#60a5fa]">
            Verified by MetaTrader 5
          </p>

          <h2 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.07em] sm:text-7xl">
            Real accounts.
            <span className="block text-white/25">
              Real trades.
            </span>

            <span className="block text-white">
              Real proof.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
            No uploaded screenshots. No self-reported performance. Bullions
            reads connected trading data directly.
          </p>

          <div className="mt-9 flex flex-wrap gap-2">
            {[
              "Balance",
              "Equity",
              "ROI",
              "Drawdown",
              "Trades",
              "Profit Factor",
            ].map((metric) => (
              <span
                key={metric}
                className="rounded-full border border-white/10 bg-black/35 px-4 py-3 text-[9px] font-black uppercase tracking-[0.13em] text-white/45 backdrop-blur"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[500px] overflow-hidden rounded-[38px] border border-white/10 bg-black">
        <img
          src="/bullpad.jpg"
          alt="BullPad intelligence workspace"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,7,.98),rgba(5,6,7,.72)_52%,rgba(5,6,7,.18))]" />

        <div className="relative flex min-h-[500px] max-w-2xl flex-col justify-center p-8 sm:p-12">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
            BullPad
          </p>

          <h2 className="mt-5 text-5xl font-black leading-[0.94] tracking-[-0.07em] sm:text-7xl">
            Build conviction.
            <span className="block text-white/25">
              Before risking capital.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/45">
            Research markets, study verified traders, use SIX and organize your
            investment ideas inside one private workspace.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {[
              "Research",
              "Journal",
              "SIX",
              "Markets",
              "Ideas",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-black/35 px-4 py-3 text-[9px] font-black uppercase tracking-[0.14em] text-white/50"
              >
                {item}
              </span>
            ))}
          </div>

          <a
            href="/bullpad"
            className="mt-9 flex h-14 w-fit items-center justify-center rounded-full bg-[#b6ff00] px-9 text-[10px] font-black uppercase tracking-[0.17em] text-black"
          >
            Open BullPad →
          </a>
        </div>
      </section>
    </>
  );
}
