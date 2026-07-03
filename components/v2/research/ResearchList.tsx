import Link from "next/link";
import { mockResearch } from "@/mock/v2/research";
import { ResearchCard } from "./ResearchCard";

export function ResearchList() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {mockResearch.map((article) => (
        <Link
          key={article.id}
          href={`/research/${article.slug}`}
          className="block transition hover:scale-[1.01]"
        >
          <ResearchCard
            title={article.title}
            summary={article.summary}
            market={article.market}
            published={new Date(article.publishedAt).toLocaleDateString()}
            readTime={article.readTime}
          />
        </Link>
      ))}
    </div>
  );
}
