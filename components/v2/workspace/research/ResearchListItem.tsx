import type { ResearchArticle } from "@/types/v2/domain/research";
import { Badge } from "@/components/v2/ui/Badge";

function formatDate(value: number | null) {
  if (!value) return "Draft";
  return new Date(value).toLocaleDateString();
}

function readTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function ResearchListItem({
  article,
  selected,
  onClick,
}: {
  article: ResearchArticle;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "w-full rounded-2xl border border-[#b6ff00]/25 bg-[#b6ff00]/10 p-4 text-left"
          : "w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-white/[0.04]"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-black text-white">{article.title}</p>
        <Badge tone={article.status === "published" ? "success" : "neutral"}>
          {article.status}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-semibold text-white/30">
        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
        <span>{readTime(article.content)}</span>
        <span>{article.reads.toLocaleString()} views</span>
      </div>
    </button>
  );
}
