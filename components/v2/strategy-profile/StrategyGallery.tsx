import type { Strategy } from "@/types/v2/domain/strategy";

type Props = {
  strategy: Strategy;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=900&auto=format&fit=crop",
];

export function StrategyGallery({ strategy }: Props) {
  const images = fallbackImages;

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#080909] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            Manager Context
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Inside {strategy.identity.name}
          </h2>
        </div>

        <button className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/45">
          View Gallery
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div className="group relative h-72 overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.035] md:row-span-2">
          <img
            src={images[0]}
            className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
              Trading Desk
            </p>
            <p className="mt-1 text-lg font-black text-white">Execution environment</p>
          </div>
        </div>

        {images.slice(1).map((src, index) => (
          <div
            key={src}
            className="group relative h-[138px] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.035]"
          >
            <img
              src={src}
              className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 text-xs font-black uppercase tracking-[0.18em] text-white/75">
              {["Research", "Process", "Markets"][index]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
