export function WizardHeader({ step }: { step: number }) {
  const steps = ["Identity", "Markets", "Risk", "Review"];

  return (
    <header className="rounded-[32px] border border-white/10 bg-[#080909] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
        Create Strategy
      </p>

      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
        Launch a new strategy
      </h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {steps.map((label, index) => (
          <div
            key={label}
            className={
              index + 1 === step
                ? "rounded-2xl border border-[#b6ff00]/25 bg-[#b6ff00]/10 p-4"
                : "rounded-2xl border border-white/10 bg-white/[0.025] p-4"
            }
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
              Step {index + 1}
            </p>
            <p className={index + 1 === step ? "mt-1 font-black text-[#b6ff00]" : "mt-1 font-black text-white/45"}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </header>
  );
}
