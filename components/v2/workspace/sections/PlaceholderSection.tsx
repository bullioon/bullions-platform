import { Card } from "@/components/v2/ui/Card";

export function PlaceholderSection({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <Card>
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
        {title}
      </h2>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
        {body}
      </p>
    </Card>
  );
}
