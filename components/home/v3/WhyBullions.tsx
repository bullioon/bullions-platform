const pillars = [
  {
    number: "01",
    title: "Direct Funding",
    text: "Prove your performance and unlock access to capital.",
    accent: "text-[#b6ff00]",
  },
  {
    number: "02",
    title: "MT5 Verified",
    text: "Real accounts, real trades and automatically verified results.",
    accent: "text-[#60a5fa]",
  },
  {
    number: "03",
    title: "SIX Watching",
    text: "Every strategy is continuously analyzed for behavior and risk.",
    accent: "text-[#d8b4fe]",
  },
  {
    number: "04",
    title: "Capital Rules™",
    text: "Every allocation follows strict rules before emotion.",
    accent: "text-[#f4c868]",
  },
];

export function WhyBullions() {
  return (
    <section className="rounded-[38px] border border-white/10 bg-[#080909] p-7 sm:p-10">
      <div className="max-w-4xl">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
          Why choose Bullions
        </p>

        <h2 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.065em] sm:text-6xl">
          Talent finds capital.
          <span className="block text-white/25">
            Capital follows discipline.
          </span>
        </h2>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="min-h-[260px] rounded-[28px] border border-white/10 bg-black/20 p-6"
          >
            <p className={`text-[10px] font-black ${pillar.accent}`}>
              {pillar.number}
            </p>

            <h3 className="mt-12 text-3xl font-black leading-[0.98] tracking-[-0.055em]">
              {pillar.title}
            </h3>

            <p className="mt-5 text-sm leading-6 text-white/35">
              {pillar.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
