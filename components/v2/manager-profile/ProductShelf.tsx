import Link from "next/link";

import { Card } from "@/components/v2/ui/Card";
import { Section } from "@/components/v2/ui/Section";
import { Badge } from "@/components/v2/ui/Badge";
import { Button } from "@/components/v2/ui/Button";

import type { Strategy } from "@/types/v2/domain/strategy";

type Props = {
  strategies: Strategy[];
};

function pct(value: number | null | undefined) {
  const n = Number(value || 0);
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export function ProductShelf({ strategies }: Props) {
  return (
    <Section
      eyebrow="Investment Products"
      title="Strategy products managed by this firm."
      subtitle="Each strategy is an investment product with its own track record, runtime and risk profile."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {strategies.map((strategy) => (
          <Card key={strategy.id} hover>

            <div className="flex items-center justify-between">

              <Badge tone={strategy.status?.verified ? "green" : "neutral"}>
                {strategy.status?.verified ? "Verified" : "Draft"}
              </Badge>

              <span className="text-sm text-white/35">
                ROI
              </span>

            </div>

            <h3 className="mt-6 text-3xl font-black tracking-[-0.05em]">
              {strategy.identity.name}
            </h3>

            <p className="mt-3 min-h-[72px] text-white/45 leading-7">
              {strategy.identity.subtitle ||
                strategy.identity.description}
            </p>

            <div className="mt-10 flex items-end justify-between">

              <div>

                <p className="text-5xl font-black tracking-[-0.08em] text-[#b6ff00]">
                  {pct(strategy.performance.roi)}
                </p>

                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/35">
                  All Time ROI
                </p>

              </div>

              <Link href={`/s/${strategy.id}`}>
                <Button variant="secondary">
                  View
                </Button>
              </Link>

            </div>

          </Card>
        ))}
      </div>
    </Section>
  );
}
