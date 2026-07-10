"use client";

import { useEffect, useState } from "react";

import { ResearchRepository } from "@/core/v2/repositories/ResearchRepository";
import type { ResearchArticle } from "@/types/v2/domain/research";
import type { Strategy } from "@/types/v2/domain/strategy";
import { Button } from "@/components/v2/ui/Button";
import { Card } from "@/components/v2/ui/Card";
import { Badge } from "@/components/v2/ui/Badge";

export function ResearchStudio({ strategy }: { strategy: Strategy }) {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [creating, setCreating] = useState(false);

  async function load() {
    const data = await ResearchRepository.listByStrategy(strategy.id);
    setArticles(data);
  }

  useEffect(() => {
    load();
  }, [strategy.id]);

  async function createDraft() {
    setCreating(true);

    await ResearchRepository.createDraft({
      strategyId: strategy.id,
      title: "Weekly Market Outlook",
      summary: "Write a short summary for allocators.",
      content: "Start writing your thesis here...",
      authorName: strategy.manager.displayName,
    });

    await load();
    setCreating(false);
  }

  async function publish(id: string) {
    await ResearchRepository.publish(id);
    await load();
  }

  return (
    <section className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
              Research Studio
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
              Publish investment research
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
              Research builds trust, improves discoverability, and gives allocators a reason to follow your strategy.
            </p>
          </div>

          <Button onClick={createDraft} disabled={creating}>
            {creating ? "Creating..." : "New Research →"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {articles.length ? (
          articles.map((article) => (
            <Card key={article.id}>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-white">
                      {article.title}
                    </h3>

                    <Badge tone={article.status === "published" ? "success" : "neutral"}>
                      {article.status}
                    </Badge>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
                    {article.summary}
                  </p>

                  <p className="mt-4 text-xs text-white/30">
                    {article.reads.toLocaleString()} reads · {article.authorName}
                  </p>
                </div>

                {article.status === "draft" ? (
                  <Button variant="secondary" onClick={() => publish(article.id)}>
                    Publish
                  </Button>
                ) : (
                  <Button variant="ghost">
                    Published
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-white/45">
              No research yet. Create your first market outlook.
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}
