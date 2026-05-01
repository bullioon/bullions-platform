export function HomeHowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Deposit",
      text: "Fund your Bullions wallet with SOL and unlock the Copy Engine.",
      icon: "◎",
    },
    {
      n: "02",
      title: "Compare traders",
      text: "See ROI, risk profile, drawdown and live ranking before copying.",
      icon: "✹",
    },
    {
      n: "03",
      title: "Copy performance",
      text: "Choose a trader, activate the engine and monitor your PnL live.",
      icon: "💀",
    },
  ];

  return (
    <section className="mx-auto mt-10 w-full max-w-[1480px] rounded-[34px] bg-[#101114] p-8 ring-1 ring-white/5">
      <p className="text-sm text-[#b6ff00]">How it works</p>

      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
        Understand Bullions in 3 steps.
      </h2>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.n}
            className="rounded-[26px] bg-white/[0.045] p-6 ring-1 ring-white/5"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-13 w-13 place-items-center rounded-[18px] bg-black/35 text-2xl ring-1 ring-white/10">
                {step.icon}
              </span>

              <span className="text-sm font-semibold text-[#b6ff00]">
                {step.n}
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-semibold text-white">
              {step.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/45">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
