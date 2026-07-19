"use client";

const stages = [
  {
    number: "01",
    title: "VERIFIED",
    description: "Your execution becomes a trusted, verified track record.",
  },
  {
    number: "02",
    title: "DISCOVERED",
    description: "Investors discover performance—not promises.",
  },
  {
    number: "03",
    title: "ALLOCATED",
    description: "Consistent execution attracts real capital.",
  },
  {
    number: "04",
    title: "SCALABLE",
    description: "Capital, reputation and recurring revenue grow together.",
  },
];

export default function YourEdge() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
                Your Edge
              </span>
            </div>

            <h2 className="max-w-xl text-5xl font-semibold leading-[0.92] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              Your edge is
              <span className="block text-white/35">the product.</span>
            </h2>

            <p className="mt-7 max-w-md text-base leading-7 text-white/55 sm:text-lg">
              Bullions turns verified performance into visibility, capital and
              an investment business.
            </p>

            <div className="mt-10 hidden items-center gap-4 text-xs uppercase tracking-[0.22em] text-white/30 lg:flex">
              <span>Performance</span>
              <span className="h-px flex-1 bg-white/10" />
              <span>Distribution</span>
            </div>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {stages.map((stage) => (
              <article
                key={stage.number}
                className="group grid gap-5 py-9 sm:grid-cols-[70px_1fr] sm:py-11"
              >
                <span className="pt-1 font-mono text-xs tracking-[0.2em] text-violet-300/60">
                  {stage.number}
                </span>

                <div>
                  <div className="flex items-center justify-between gap-6">
                    <h3 className="text-3xl font-semibold tracking-[-0.045em] text-white transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl lg:text-5xl">
                      {stage.title}
                    </h3>

                    <span className="text-2xl text-white/15 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-300">
                      →
                    </span>
                  </div>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/45 sm:text-base">
                    {stage.description}
                  </p>
                </div>
              </article>
            ))}

            <article className="relative py-11 sm:pl-[70px] sm:py-14">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
                The outcome
              </p>

              <h3 className="mt-5 text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
                BUILD
                <span className="block text-violet-300">YOUR FIRM.</span>
              </h3>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/50">
                Performance becomes reputation. Reputation attracts capital.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
