import type { ResearchArticle } from "@/types/v2/domain/research";
import { ResearchListItem } from "./ResearchListItem";

export function ResearchExplorer({
  articles,
  selectedId,
  onSelect,
}: {
  articles: ResearchArticle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="rounded-[28px] border border-white/10 bg-[#080909] p-4">
      <p className="px-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
        Articles
      </p>

      <div className="mt-4 grid gap-3">
        {articles.length ? (
          articles.map((article) => (
            <ResearchListItem
              key={article.id}
              article={article}
              selected={article.id === selectedId}
              onClick={() => onSelect(article.id)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/35">
            No research yet.
          </div>
        )}
      </div>
    </aside>
  );
}
