"use client";

import { useEffect, useRef, useState } from "react";

import { ResearchRepository } from "@/core/v2/repositories/ResearchRepository";
import type { ResearchArticle } from "@/types/v2/domain/research";
import { Button } from "@/components/v2/ui/Button";
import { Badge } from "@/components/v2/ui/Badge";

export function ResearchEditor({
  article,
  onChange,
  onPublish,
}: {
  article: ResearchArticle | null;
  onChange: (patch: Partial<ResearchArticle>) => void;
  onPublish: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedId = useRef<string | null>(null);

  useEffect(() => {
    if (!article) return;

    if (lastSavedId.current !== article.id) {
      lastSavedId.current = article.id;
      setSaving(false);
      setSavedOnce(false);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setSaving(true);

    timeoutRef.current = setTimeout(async () => {
      await ResearchRepository.update(article.id, {
        title: article.title,
        summary: article.summary,
        content: article.content,
      });

      setSaving(false);
      setSavedOnce(true);
    }, 1500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [article?.id, article?.title, article?.summary, article?.content]);

  if (!article) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-[#080909] p-8">
        <p className="text-white/40">Select or create a research article.</p>
      </section>
    );
  }

  return (
    <section className="flex min-h-[820px] flex-col rounded-[28px] border border-white/10 bg-[#080909] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={article.status === "published" ? "success" : "neutral"}>
            {article.status}
          </Badge>

          <span className="text-xs font-semibold text-white/35">
            {saving ? "Saving..." : savedOnce ? "Saved just now" : "Ready"}
          </span>

          <span className="text-xs font-semibold text-white/20">
            Institutional Research
          </span>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
          Editor
        </p>
      </div>

      <input
        value={article.title}
        onChange={(event) => onChange({ title: event.target.value })}
        className="mt-8 w-full bg-transparent text-5xl font-black tracking-[-0.06em] text-white outline-none placeholder:text-white/20"
        placeholder="Research title"
      />

      <textarea
        value={article.summary}
        onChange={(event) => onChange({ summary: event.target.value })}
        rows={2}
        className="mt-6 w-full resize-none border-b border-white/10 bg-transparent pb-6 text-lg font-semibold leading-8 text-white/45 outline-none placeholder:text-white/20"
        placeholder="Short allocator-facing summary..."
      />

      <textarea
        value={article.content}
        onChange={(event) => onChange({ content: event.target.value })}
        className="mt-8 min-h-[520px] flex-1 w-full resize-none bg-transparent text-base font-medium leading-8 text-white/70 outline-none placeholder:text-white/20"
        placeholder="Write your market thesis..."
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <p className="text-xs text-white/30">
          Autosaves after you stop typing.
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              if (!article) return;
              ResearchRepository.update(article.id, {
                title: article.title,
                summary: article.summary,
                content: article.content,
              });
              setSavedOnce(true);
              setSaving(false);
            }}
          >
            Save Draft
          </Button>

          {article.status === "draft" ? (
            <Button variant="outline" onClick={onPublish}>
              Publish
            </Button>
          ) : (
            <Button variant="ghost">
              Published
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
