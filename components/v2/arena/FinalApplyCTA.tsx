export default function FinalApplyCTA() {
  return (
    <section
      id="challenge"
      className="relative overflow-hidden border-t border-white/10 bg-black"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6ff00]/10 blur-[150px]"
      />

      <div className="relative mx-auto flex min-h-[68vh] max-w-7xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#b6ff00]" />
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#b6ff00]">
            Season 03
          </p>
          <span className="h-px w-10 bg-[#b6ff00]" />
        </div>

        <h2 className="mt-8 text-6xl font-black leading-[0.84] tracking-[-0.075em] text-white sm:text-7xl md:text-8xl lg:text-[110px]">
          BUILD
          <span className="block text-[#b6ff00]">YOUR FIRM.</span>
        </h2>

        <p className="mt-8 max-w-xl text-base leading-7 text-white/45 sm:text-lg">
          Turn verified performance into capital, investors and recurring
          revenue.
        </p>

        <a
          href="/manager/strategies/new"
          className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-[#b6ff00] px-8 text-[10px] font-black uppercase tracking-[0.2em] text-black transition duration-300 hover:scale-[1.03] hover:shadow-[0_0_45px_rgba(182,255,0,0.22)]"
        >
          Apply for Season 03
        </a>

        <p className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-white/20">
          Six positions · Verified MT5 execution
        </p>
      </div>
    </section>
  );
}
