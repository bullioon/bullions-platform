export function CopyExperience() {
  const firms = [
    {
      name: "AXBullions",
      allocation: "45%",
      status: "Stable",
    },
    {
      name: "Bullions",
      allocation: "35%",
      status: "Active",
    },
    {
      name: "Mia Capital",
      allocation: "20%",
      status: "Watching",
    },
  ];

  return (
    <section
      id="investor"
      className="relative grid min-h-[650px] gap-8 overflow-hidden rounded-[38px] border border-white/10 bg-[#070808] p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
    >
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#b6ff00]/[0.055] blur-[130px]" />

      <div className="relative">
        <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
          Copy
        </p>

        <h2 className="mt-5 text-5xl font-black leading-[0.91] tracking-[-0.075em] sm:text-7xl">
          Don’t follow
          <span className="block text-white/25">
            one trader.
          </span>

          <span className="block text-[#b6ff00]">
            Build your team.
          </span>
        </h2>

        <p className="mt-7 max-w-lg text-sm leading-7 text-white/42">
          Choose up to three verified firms, define the allocation and let
          Bullions organize the portfolio around your capital.
        </p>

        <a
          href="/discover"
          className="mt-9 flex h-14 w-fit items-center justify-center rounded-full bg-[#b6ff00] px-9 text-[10px] font-black uppercase tracking-[0.17em] text-black transition hover:scale-[1.02]"
        >
          Discover firms →
        </a>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0c0c] p-5 shadow-[0_30px_100px_rgba(0,0,0,.5)] sm:p-7">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                Bullions fund
              </p>

              <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                My Capital Team
              </p>
            </div>

            <span className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/[0.07] px-3 py-2 text-[8px] font-black uppercase tracking-[0.15em] text-[#b6ff00]">
              3 firms
            </span>
          </div>

          <div className="py-7">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
              Portfolio allocation
            </p>

            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="w-[45%] bg-[#b6ff00]" />
              <div className="w-[35%] bg-[#78aa00]" />
              <div className="w-[20%] bg-[#395000]" />
            </div>
          </div>

          <div className="space-y-2">
            {firms.map((firm, index) => (
              <div
                key={firm.name}
                className="grid grid-cols-[42px_1fr_auto] items-center gap-4 rounded-[20px] border border-white/[0.08] bg-black/25 px-4 py-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[9px] font-black text-white/45">
                  0{index + 1}
                </div>

                <div>
                  <p className="text-sm font-black">
                    {firm.name}
                  </p>

                  <p className="mt-1 text-[8px] font-black uppercase tracking-[0.14em] text-white/25">
                    {firm.status}
                  </p>
                </div>

                <p className="text-xl font-black tracking-[-0.04em] text-[#b6ff00]">
                  {firm.allocation}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-[20px] border border-white/[0.08] bg-black/25 p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
                Capital
              </p>

              <p className="mt-2 text-xl font-black">
                $10,000
              </p>
            </div>

            <div className="rounded-[20px] border border-white/[0.08] bg-black/25 p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
                Control
              </p>

              <p className="mt-2 text-xl font-black text-[#b6ff00]">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
