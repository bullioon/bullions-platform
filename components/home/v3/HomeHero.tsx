export function HomeHero() {
  const capabilities = [
    "Direct Funding",
    "MT5 Verified",
    "SIX Monitored",
    "Capital Rules™",
  ];

  return (
    <section className="relative grid min-h-[860px] place-items-center overflow-hidden rounded-[40px] border border-white/10 bg-[#050606] px-6 py-24 text-center sm:min-h-[920px] sm:px-10 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(182,255,0,0.13),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(0,0,0,.7))]" />

      <div className="relative flex w-full max-w-5xl flex-col items-center">
        <div className="flex min-h-[180px] items-center justify-center sm:min-h-[220px]">
          <img
            src="/logo.png"
            alt="Bullions"
            className="h-32 w-32 object-contain drop-shadow-[0_0_40px_rgba(182,255,0,0.12)] sm:h-40 sm:w-40"
          />
        </div>

        <div className="mt-10 flex max-w-[900px] flex-wrap items-center justify-center gap-2.5 sm:mt-14 sm:gap-3">
          {capabilities.map((item) => (
            <div
              key={item}
              className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/[0.055] px-4 py-2.5 sm:px-5 sm:py-3"
            >
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#b6ff00] sm:text-[9px]">
                {item}
              </p>
            </div>
          ))}
        </div>

        <h1 className="mt-12 text-5xl font-black leading-[0.9] tracking-[-0.075em] sm:mt-14 sm:text-7xl lg:text-[96px]">
          Your edge
          <span className="block text-[#b6ff00]">
            deserves capital.
          </span>

          <span className="mt-5 block text-white/25">
            Your capital
          </span>

          <span className="block text-white">
            deserves discipline.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-white/42 sm:text-base">
          Bullions removes the capital barrier for skilled traders and the
          selection burden for investors.
        </p>

        <div className="mt-12 grid w-full max-w-[760px] gap-3 sm:grid-cols-2">
          <a
            href="#trader"
            className="flex h-16 items-center justify-center rounded-full bg-[#b6ff00] px-8 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01] hover:bg-[#c3ff2e]"
          >
            I Create Performance
          </a>

          <a
            href="#investor"
            className="flex h-16 items-center justify-center rounded-full border border-white/12 bg-white/[0.035] px-8 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.07]"
          >
            I Provide Capital
          </a>
        </div>

        <div className="mt-10 grid w-full max-w-[850px] grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            "$50K Accounts",
            "$200K Accounts",
            "Weekly Rewards",
            "Up to 3 Traders",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-4"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.13em] text-white/50">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
