const steps = [
  {
    title: "1. Deposit",
    text: "Register BTC or SOL deposits and fund your Bullions wallet.",
  },
  {
    title: "2. Choose a trader",
    text: "View the live leaderboard and select the trader you want to copy.",
  },
  {
    title: "3. Activate engine",
    text: "Turn on the Copy Engine and track PnL, profit, and performance.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mb-8 rounded-[32px] bg-[#111214] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <p className="text-sm text-[#8f96a3]">How it works</p>
      <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">
        Simple flow. Powerful execution.
      </h2>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-[24px] bg-black/25 p-6">
            <h3 className="text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#8f96a3]">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
