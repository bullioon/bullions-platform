import { ResearchCard } from "./ResearchCard";
import { mockResearch } from "@/mock/v2/research";

export function RelatedResearch() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-black text-white">
        Related Research
      </h2>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mockResearch.map((item) => (
          <ResearchCard
            key={item.id}
            title={item.title}
            summary={item.summary}
            market={item.market}
            published={new Date(item.publishedAt).toLocaleDateString()}
            readTime={item.readTime}
          />
        ))}
      </div>
    </section>
  );
}
