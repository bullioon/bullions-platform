import type { Manager } from "@/types/v2/domain/manager";

export type GalleryImage = NonNullable<
  NonNullable<Manager["social"]>["gallery"]
>[number];

type Props = {
  image: GalleryImage;
  featured?: boolean;
  onOpen: () => void;
};

function categoryLabel(category?: string) {
  const labels: Record<string, string> = {
    desk: "Trading Desk",
    research: "Research",
    process: "Process",
    markets: "Markets",
    event: "Events",
    lifestyle: "Manager Life",
  };

  return category ? labels[category] || "Manager Context" : "Manager Context";
}

export function GalleryItem({
  image,
  featured = false,
  onOpen,
}: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.025] text-left ${
        featured
          ? "h-[420px] md:row-span-2"
          : "h-[202px]"
      }`}
    >
      <img
        src={image.url}
        alt={image.title || categoryLabel(image.category)}
        className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.045] group-hover:opacity-100"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#b6ff00]">
          {categoryLabel(image.category)}
        </p>

        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="text-lg font-black text-white">
            {image.title || "Manager context"}
          </p>

          <span className="translate-y-2 text-xs font-black uppercase tracking-[0.15em] text-white/0 transition group-hover:translate-y-0 group-hover:text-white/50">
            Open ↗
          </span>
        </div>
      </div>
    </button>
  );
}
