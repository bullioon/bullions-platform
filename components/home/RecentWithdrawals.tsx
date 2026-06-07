const withdrawals = [
  ["$97", "Hellion", "Processed"],
  ["$381", "Torion", "Paid"],
  ["$612", "Torion", "Paid"],
  ["$188", "Bullion", "Paid"],
];

export function RecentWithdrawals() {
  return (
    <section className="mx-auto mt-10 w-full max-w-5xl rounded-[32px] border border-[#b6ff00]/10 bg-[#0b0d0c] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b6ff00]">
        Recent withdrawals
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {withdrawals.map(([amount, tier, status]) => (
          <div
            key={`${amount}-${tier}`}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4"
          >
            <p className="text-2xl font-semibold text-white">{amount}</p>
            <p className="mt-1 text-sm text-white/45">{tier}</p>
            <p className="mt-3 text-xs font-semibold text-[#b6ff00]">{status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
