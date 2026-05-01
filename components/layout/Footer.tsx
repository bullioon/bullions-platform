export function Footer() {
  return (
    <footer className="mx-auto mt-8 w-full max-w-[1480px] rounded-[28px] bg-[#101114] p-8 ring-1 ring-white/5">
      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <p className="text-lg font-semibold italic text-white">bullions</p>
          <p className="mt-3 max-w-[520px] text-sm leading-6 text-white/45">
            Bullions is a copy-trading and trader funding system. Investors compare,
            monitor and copy trader performance. Traders compete, prove consistency
            and unlock funding opportunities.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Investors</p>
          <div className="mt-3 space-y-2 text-sm text-white/40">
            <p>Copy performance</p>
            <p>Monitor PnL</p>
            <p>Compare risk</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Traders</p>
          <div className="mt-3 space-y-2 text-sm text-white/40">
            <p>Weekly challenges</p>
            <p>$10K cash prize</p>
            <p>Funding path</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Platform</p>
          <div className="mt-3 space-y-2 text-sm text-white/40">
            <p>Live leaderboard</p>
            <p>Copy Engine</p>
            <p>Support</p>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/5 pt-5 text-xs leading-5 text-white/30">
        Bullions is not financial advice. Trading involves risk. Performance is not guaranteed.
        Only deposit funds you can afford to lose.
      </div>
    </footer>
  );
}
