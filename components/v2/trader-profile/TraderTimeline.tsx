export function TraderTimeline() {
  const items = [
    ["Today", "Published Gold Outlook"],
    ["Yesterday", "Reached Top #2"],
    ["2 days ago", "+18 Allocators"],
    ["1 week ago", "Passed Challenge"],
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080909] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
        Activity
      </p>

      <div className="mt-6 space-y-5">
        {items.map(([time, event]) => (
          <div key={event} className="border-l border-white/10 pl-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/25">
              {time}
            </p>
            <p className="mt-2 text-sm font-black text-white/60">{event}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
