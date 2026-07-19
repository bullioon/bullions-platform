export function FinalCTA() {
  return (
    <section className="relative overflow-hidden rounded-[38px] bg-[#b6ff00] p-8 text-black sm:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.5),transparent_42%)]" />

      <div className="relative">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/45">
          Choose your path
        </p>

        <h2 className="mt-5 max-w-5xl text-5xl font-black leading-[0.93] tracking-[-0.075em] sm:text-7xl">
          Performance earns trust.
          <span className="block text-black/45">
            Trust attracts capital.
          </span>

          <span className="block">
            Discipline keeps it.
          </span>
        </h2>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="/challenge"
            className="flex h-14 items-center justify-center rounded-full bg-black px-9 text-[10px] font-black uppercase tracking-[0.17em] text-white"
          >
            Join Challenge
          </a>

          <a
            href="/discover"
            className="flex h-14 items-center justify-center rounded-full border border-black/15 px-9 text-[10px] font-black uppercase tracking-[0.17em] text-black"
          >
            Build My Fund
          </a>
        </div>
      </div>
    </section>
  );
}
