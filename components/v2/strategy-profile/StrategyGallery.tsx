import type { Strategy } from "@/types/v2/domain/strategy";
import type { Manager } from "@/types/v2/domain/manager";

type Props = {
  strategy: Strategy;
  manager: Manager | null;
};

function categoryLabel(
  category:
    | "desk"
    | "research"
    | "process"
    | "markets"
    | "event"
    | "lifestyle"
    | undefined
) {
  if (!category) return "Manager Life";

  const labels = {
    desk: "Trading Desk",
    research: "Research",
    process: "Process",
    markets: "Markets",
    event: "Events",
    lifestyle: "Manager Life",
  };

  return labels[category];
}

export function StrategyGallery({
  strategy,
  manager,
}: Props) {
  const images = manager?.social?.gallery ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#080909] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            Manager Context
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Behind {strategy.identity.name}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
            A closer look at the person, process and environment
            behind this strategy.
          </p>
        </div>

        {images.length ? (
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
            {images.length} photo{images.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {images.length ? (
        <div className="grid gap-3 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <GalleryImage
            item={images[0]}
            featured
          />

          {images.slice(1, 5).map((item) => (
            <GalleryImage
              key={item.id}
              item={item}
            />
          ))}
        </div>
      ) : (
        <div className="grid min-h-[260px] place-items-center rounded-[26px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
          <div className="max-w-md">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-xl text-white/30">
              ◫
            </div>

            <h3 className="mt-5 text-xl font-black text-white">
              Gallery coming soon
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/35">
              This manager has not published visual context yet.
              Trading desk, research process, events and professional
              moments will appear here.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function GalleryImage({
  item,
  featured = false,
}: {
  item: NonNullable<
    NonNullable<Manager["social"]>["gallery"]
  >[number];
  featured?: boolean;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] ${
        featured
          ? "h-72 md:row-span-2"
          : "h-[138px]"
      }`}
    >
      <img
        src={item.url}
        alt={item.title || categoryLabel(item.category)}
        className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.035] group-hover:opacity-100"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
          {categoryLabel(item.category)}
        </p>

        {item.title ? (
          <p className="mt-1 line-clamp-1 text-sm font-black text-white">
            {item.title}
          </p>
        ) : null}
      </div>
    </article>
  );
}
