import { Section } from "@/components/v2/ui/Section";

type Props = {
  philosophy?: string;
  principles?: string[];
};

export function InvestmentPhilosophy({
  philosophy = "I believe consistent investing is built through disciplined execution, asymmetric opportunities and strict risk management. My objective is not to predict markets, but to survive uncertainty while compounding capital over time.",
  principles = [
    "Risk first, returns second",
    "Macro-driven positioning",
    "Capital preservation",
    "Systematic execution",
  ],
}: Props) {
  return (
    <Section
      eyebrow="Investment Philosophy"
      title="Investing is a process, not a prediction."
      subtitle={philosophy}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {principles.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4"
          >
            <span className="text-[#b6ff00]">●</span>
            <span className="ml-3 text-white/80">{item}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}
