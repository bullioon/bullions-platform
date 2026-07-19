"use client";

const items = [
  {
    q: "Who can apply?",
    a: "Any trader ready to build a verified performance record.",
  },
  {
    q: "How is performance verified?",
    a: "Every account is connected through Bullions' MT5 verification engine.",
  },
  {
    q: "How are the Top 6 selected?",
    a: "Traders are ranked by Program Score, consistency and verified execution.",
  },
  {
    q: "What happens if I qualify?",
    a: "You receive capital allocation and become discoverable inside Strategy Universe.",
  },
  {
    q: "How do I earn?",
    a: "Capital follows performance. Investor allocations generate recurring revenue.",
  },
];

export default function BeforeYouApply() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#b6ff00]">
          Before You Apply
        </p>

        <h2 className="mt-4 text-5xl font-black tracking-[-0.06em] text-white">
          Everything you need to know.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-white/45">
          Five quick answers before joining Season 03.
        </p>
      </div>

      <div className="mt-14 divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.02]">
        {items.map((item) => (
          <div
            key={item.q}
            className="px-8 py-7 transition hover:bg-white/[0.02]"
          >
            <h3 className="text-lg font-bold text-white">{item.q}</h3>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/50">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
