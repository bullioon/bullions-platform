import { Button } from "@/components/v2/ui/Button";

export function ResearchToolbar({
  onNewResearch,
  creating,
}: {
  onNewResearch: () => void;
  creating: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[#080909] p-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
          Research Studio
        </p>
        <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-white">
          Investment research
        </h2>
      </div>

      <Button onClick={onNewResearch} disabled={creating}>
        {creating ? "Creating..." : "New Research →"}
      </Button>
    </div>
  );
}
