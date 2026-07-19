import Link from "next/link";

const rankedFirms = [
  {
    rank: "01",
    name: "AXBullions",
    subtitle: "Multi-asset performance firm",
    href: "/m/axbullions",
    image: "/mt5.jpeg",
    badge: "MT5 VERIFIED",
  },
  {
    rank: "02",
    name: "Bullions",
    subtitle: "Gold and index strategy",
    href: "/m/bullions",
    image: "/bullpad.jpg",
    badge: "SIX MONITORED",
  },
];

export function FeaturedFirms() {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#070808] p-5 sm:p-7">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#b6ff00]/[0.05] blur-[110px]" />

      <div className="relative flex items-center justify-between gap-5 px-1 pb-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            Top Ranking
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
            Firms earning attention.
          </h2>
        </div>

        <Link
          href="/universe"
          className="shrink-0 text-[9px] font-black uppercase tracking-[0.18em] text-white/35 transition hover:text-[#b6ff00]"
        >
          Discover more →
        </Link>
      </div>

      <div className="relative grid gap-3 md:grid-cols-2">
        {rankedFirms.map((firm) => (
          <Link
            key={firm.name}
            href={firm.href}
            className="group relative min-h-[270px] overflow-hidden rounded-[26px] border border-white/10 bg-black"
          >
            <img
              src={firm.image}
              alt={firm.name}
              className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-55"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.92))]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.65),transparent_70%)]" />

            <div className="relative flex min-h-[270px] flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-black tracking-[0.18em] text-white/30">
                  {firm.rank}
                </span>

                <span className="rounded-full border border-[#b6ff00]/20 bg-black/40 px-3 py-2 text-[7px] font-black uppercase tracking-[0.16em] text-[#b6ff00] backdrop-blur">
                  {firm.badge}
                </span>
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
                  Ranked firm
                </p>

                <div className="mt-2 flex items-end justify-between gap-5">
                  <div>
                    <h3 className="text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl">
                      {firm.name}
                    </h3>

                    <p className="mt-2 text-xs text-white/40">
                      {firm.subtitle}
                    </p>
                  </div>

                  <span className="text-2xl text-white/30 transition group-hover:translate-x-1 group-hover:text-[#b6ff00]">
                    →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
