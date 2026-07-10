import { Card } from "@/components/v2/ui/Card";
import { Badge } from "@/components/v2/ui/Badge";
import { Button } from "@/components/v2/ui/Button";
import { SectionTitle } from "@/components/v2/ui/SectionTitle";

type Props = {
  title: string;
  summary: string;
  market: string;
  readTime: string;
  published: string;
};

export function ResearchCard({
  title,
  summary,
  market,
  readTime,
  published,
}: Props) {
  return (
    <Card>

      <div className="flex items-center justify-between">

        <SectionTitle>
          Research
        </SectionTitle>

        <Badge tone="purple">
          {market}
        </Badge>

      </div>

      <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-white">
        {title}
      </h3>

      <div className="mt-3 flex gap-3 text-xs text-white/35">
        <span>{published}</span>
        <span>•</span>
        <span>{readTime}</span>
      </div>

      <p className="mt-5 text-sm leading-7 text-white/55">
        {summary}
      </p>

      <div className="mt-6 flex justify-end">

        <Button variant="secondary">
          Read Research →
        </Button>

      </div>

    </Card>
  );
}
