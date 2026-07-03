"use client";

import { useEffect, useMemo, useState } from "react";

import { ResearchRepository } from "@/core/v2/repositories/ResearchRepository";
import type { ResearchArticle } from "@/types/v2/domain/research";
import type { Strategy } from "@/types/v2/domain/strategy";

import { ResearchToolbar } from "./ResearchToolbar";
import { ResearchExplorer } from "./ResearchExplorer";
import { ResearchEditor } from "./ResearchEditor";

export function ResearchStudio({ strategy }: { strategy: Strategy }) {
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedId) || null,
    [articles, selectedId]
  );

  async function load() {
    const data = await ResearchRepository.listByStrategy(strategy.id);
    setArticles(data);
    setSelectedId((current) => current || data[0]?.id || null);
  }

  useEffect(() => {
    load();
  }, [strategy.id]);

  async function createDraft() {
    setCreating(true);

    const id = await ResearchRepository.createDraft({
      strategyId: strategy.id,
      title: "Untitled Research",
      summary: "Write a short summary for allocators.",
      content: "Start writing your thesis here...",
      authorName: strategy.manager.displayName,
    });

    await load();
    setSelectedId(id);
    setCreating(false);
  }

  function updateSelected(patch: Partial<ResearchArticle>) {
    if (!selectedArticle) return;

    setArticles((current) =>
      current.map((article) =>
        article.id === selectedArticle.id
          ? { ...article, ...patch, updatedAt: Date.now() }
          : article
      )
    );
  }

  async function publishSelected() {
    if (!selectedArticle) return;
    await ResearchRepository.publish(selectedArticle.id);
    await load();
    setSelectedId(selectedArticle.id);
  }

  return (
    <section className="space-y-5">
      <ResearchToolbar onNewResearch={createDraft} creating={creating} />

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <ResearchExplorer
          articles={articles}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <ResearchEditor
          article={selectedArticle}
          onChange={updateSelected}
          onPublish={publishSelected}
        />
      </div>
    </section>
  );
}
