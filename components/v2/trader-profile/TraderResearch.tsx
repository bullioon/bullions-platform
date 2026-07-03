export function TraderResearch() {
  const items = [
    ["Gold Outlook", "2 hours ago"],
    ["Fed Expectations", "Yesterday"],
    ["BTC Liquidity", "3 days ago"],
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080909] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
        This Week
      </p>

      <h2 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">
        Latest research
      </h2>

      <div className="mt-6 divide-y divide-white/10">
        {items.map(([title, date]) => (
          <div key={title} className="flex items-center justify-between py-4">
            <p className="text-lg font-black text-white">{title}</p>
            <p className="text-xs font-semibold text-white/30">{date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
