export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[#040505] px-8 py-28 sm:px-14 lg:px-20 lg:py-36">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(182,255,0,.10),transparent_34%)]" />

      <div className="relative flex flex-col items-center text-center">

        <img
          src="/logo.png"
          alt="Bullions"
          className="h-36 w-36 object-contain transition duration-700 hover:scale-[1.03]"
        />

        <div className="mt-10 flex flex-wrap justify-center gap-3">

          {[
            "DIRECT FUNDING",
            "MT5 VERIFIED",
            "SIX MONITORED",
            "CAPITAL RULES™",
          ].map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/5 px-5 py-2 text-[9px] font-black tracking-[0.24em] text-[#b6ff00]"
            >
              {pill}
            </span>
          ))}

        </div>

        <h1 className="mt-12 max-w-5xl text-6xl font-black leading-[0.9] tracking-[-0.08em] sm:text-8xl lg:text-[110px]">

          The Operating System

          <span className="block text-[#b6ff00]">
            for Capital.
          </span>

        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/45">
          Performance earns capital. Bullions connects disciplined traders with
          investors through verified data, intelligent allocation and
          institutional-grade infrastructure.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">

          <a
            href="/challenge"
            className="flex h-16 min-w-[260px] items-center justify-center rounded-full bg-[#b6ff00] text-[11px] font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.02]"
          >
            Get Funded
          </a>

          <a
            href="/discover"
            className="flex h-16 min-w-[260px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.06]"
          >
            Build My Fund
          </a>

        </div>

      </div>

    </section>
  );
}
