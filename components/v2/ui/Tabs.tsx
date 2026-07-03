type TabsProps = {
  items: string[];
  active?: string;
};

export function Tabs({ items, active = items[0] }: TabsProps) {
  return (
    <div className="flex gap-8 border-b border-white/10 px-1">
      {items.map((item) => {
        const isActive = item === active;

        return (
          <button
            key={item}
            className={
              isActive
                ? "border-b-2 border-[#b6ff00] pb-4 text-sm font-black uppercase tracking-[0.14em] text-white"
                : "pb-4 text-sm font-black uppercase tracking-[0.14em] text-white/30 transition hover:text-white/70"
            }
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
