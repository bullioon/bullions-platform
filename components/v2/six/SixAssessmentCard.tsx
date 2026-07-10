import { Card } from "@/components/v2/ui/Card";
import { SectionTitle } from "@/components/v2/ui/SectionTitle";
import { Metric } from "@/components/v2/ui/Metric";

type Props = {
  score: number;
  execution: string;
  risk: string;
  consistency: string;
  summary: string;
  updated: string;
};

export function SixAssessmentCard({
  score,
  execution,
  risk,
  consistency,
  summary,
  updated,
}: Props) {
  return (
    <Card>
      <SectionTitle tone="purple">
        SIX Assessment
      </SectionTitle>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <Metric
          label="Overall"
          value={`${score}/10`}
          tone="purple"
        />

        <Metric
          label="Updated"
          value={updated}
        />

        <Metric
          label="Execution"
          value={execution}
          tone="green"
        />

        <Metric
          label="Risk"
          value={risk}
        />

        <Metric
          label="Consistency"
          value={consistency}
          tone="green"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm leading-7 text-white/60">
          {summary}
        </p>
      </div>
    </Card>
  );
}
