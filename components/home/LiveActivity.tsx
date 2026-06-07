const activities = [
  "🚀 Ghost Alpha copied by 3 investors",
  "💰 Withdrawal processed $381",
  "🔥 Hellion account upgraded",
  "📈 Bullions Bot +4.2% today",
  "🏆 New Beat The Bot participant",
];

export function LiveActivity() {
  return (
    <section className="mx-auto mt-8 w-full max-w-5xl rounded-[28px] border border-[#b6ff00]/10 bg-white/[0.035] p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#b6ff00]" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b6ff00]">
          Live activity
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {activities.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-3 text-sm text-white/75"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
