import { Section } from "@/components/v2/ui/Section";
import { Stat } from "@/components/v2/ui/Stat";

type Props = {
  verifiedStrategies: number;
  strategies: number;
  totalCapital: number;
  totalAllocators: number;
};

function money(n: number) {
  return `$${Math.round(n || 0).toLocaleString()}`;
}

export function TrustLayer({
  verifiedStrategies,
  strategies,
  totalCapital,
  totalAllocators,
}: Props) {
  return (
    <Section
      eyebrow="Trust Layer"
      title="Signals that build allocator confidence."
      subtitle="Bullions combines verification, runtime activity, capital following and SIX review into a trust layer around every manager."
    >
      <div className="grid gap-8 md:grid-cols-3">
        <Stat label="Verified Products" value={`${verifiedStrategies}/${strategies}`} />
        <Stat label="Capital Following" value={money(totalCapital)} tone="green" />
        <Stat label="Active Allocators" value={totalAllocators.toLocaleString()} />
        <Stat label="Runtime Status" value="Live" />
        <Stat label="SIX Review" value="Active" />
        <Stat label="Publishing" value="Draft" />
      </div>
    </Section>
  );
}
