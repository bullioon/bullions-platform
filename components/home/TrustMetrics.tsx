const metrics = [
  ["$127,492", "Copied capital"],
  ["412", "Active allocations"],
  ["$18,430", "Withdrawals paid"],
];

export function TrustMetrics() {
  return (
    <section className="mx-auto mt-6 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
      {metrics.map(([value, label]) => (
        <div
          key={label}
          className="rounded-[26px] border border-white/[0.06] bg-white/[0.035] p-6 text-center backdrop-blur-xl"
        >
          <p className="text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-white/45">{label}</p>
        </div>
      ))}
    </section>
  );
}
