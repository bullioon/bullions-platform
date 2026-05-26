export default function RiskPage() {
  return (
    <main className="min-h-screen bg-[#050607] px-5 py-10 text-white">
      <section className="mx-auto max-w-[920px] rounded-[32px] bg-[#111214] p-8 ring-1 ring-white/5">
        <p className="text-sm text-[#b6ff00]">Bullions Legal</p>
        <h1 className="mt-3 text-4xl font-semibold">Risk Disclaimer</h1>

        <div className="mt-8 space-y-6 text-sm leading-7 text-white/60">
          <p>Trading involves substantial risk and may not be suitable for all users.</p>
          <p>Past performance does not guarantee future results. Bullions does not guarantee profits, fixed income, returns or loss prevention.</p>
          <p>Losses may occur due to market volatility, liquidity events, trader behavior, copy trading settings, blockchain delays or external market conditions.</p>
          <p>Bullions provides technology infrastructure and AI-assisted risk tools. Bullions does not provide financial, investment or legal advice.</p>
          <p>Users should only participate with capital they understand and can afford to risk.</p>
        </div>
      </section>
    </main>
  );
}
