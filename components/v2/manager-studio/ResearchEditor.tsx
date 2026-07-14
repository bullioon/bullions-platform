"use client";

import { useEffect, useState } from "react";

import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";
import type { Manager } from "@/types/v2/domain/manager";
import { useStudio } from "./StudioContext";

type ResearchItem = NonNullable<
  NonNullable<Manager["social"]>["research"]
>[number];

export function ResearchEditor() {
  const { state } = useStudio();

  const [items, setItems] = useState<ResearchItem[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadResearch() {
      if (!state.uid) {
        setLoading(false);
        return;
      }

      try {
        const manager = await ManagerRepository.get(state.uid);

        if (!alive) return;

        setItems(
          [...(manager?.social?.research ?? [])].sort(
            (a, b) => b.publishedAt - a.publishedAt
          )
        );
      } catch (error) {
        if (!alive) return;

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load research."
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadResearch();

    return () => {
      alive = false;
    };
  }, [state.uid]);

  async function persist(nextItems: ResearchItem[]) {
    if (!state.uid) {
      throw new Error("Login required.");
    }

    await ManagerRepository.updateSocial(state.uid, {
      research: nextItems,
    });
  }

  async function publishResearch() {
    const cleanTitle = title.trim();
    const cleanSummary = summary.trim();
    const cleanUrl = url.trim();

    if (!cleanTitle) {
      setMessage("Research title is required.");
      return;
    }

    if (!cleanUrl) {
      setMessage("Add a PDF or research URL.");
      return;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setMessage("Enter a valid URL beginning with https://");
      return;
    }

    setSaving(true);
    setMessage("");

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const item: ResearchItem = {
      id,
      title: cleanTitle,
      summary: cleanSummary,
      url: cleanUrl,
      publishedAt: Date.now(),
    };

    const nextItems = [item, ...items];

    try {
      await persist(nextItems);

      setItems(nextItems);
      setTitle("");
      setSummary("");
      setUrl("");
      setMessage("Research published.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not publish research."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeResearch(id: string) {
    const previousItems = items;
    const nextItems = items.filter((item) => item.id !== id);

    setItems(nextItems);
    setMessage("");

    try {
      await persist(nextItems);
      setMessage("Research removed.");
    } catch (error) {
      setItems(previousItems);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not remove research."
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-white/40">
        Loading research...
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[28px] border border-white/10 bg-black/20 p-6">
        <div>
          <p className="text-xl font-black text-white">
            Publish institutional research
          </p>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
            Add theses, market outlooks, reports and investment letters to your
            public manager profile.
          </p>
        </div>

        <div className="mt-7 grid gap-5">
          <Field
            label="Research Title"
            value={title}
            onChange={setTitle}
            placeholder="Gold Macro Outlook — Q3 2026"
          />

          <div>
            <label className="mb-3 block text-xs font-black uppercase tracking-[0.22em] text-white/35">
              Summary
            </label>

            <textarea
              rows={4}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Institutional outlook covering gold, rates and USD liquidity."
              className="w-full rounded-[20px] border border-white/10 bg-[#0d0d0d] px-5 py-4 leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#b6ff00]/50"
            />
          </div>

          <Field
            label="PDF or Research URL"
            value={url}
            onChange={setUrl}
            placeholder="https://..."
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={publishResearch}
            disabled={saving || !title.trim() || !url.trim()}
            className="h-12 rounded-full bg-[#b6ff00] px-8 text-[10px] font-black uppercase tracking-[0.16em] text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Publishing..." : "Publish Research"}
          </button>
        </div>
      </section>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[26px] border border-white/10 bg-[#0b0c0b] p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
                    Research
                  </p>

                  <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                    {item.title}
                  </h3>

                  {item.summary ? (
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/40">
                      {item.summary}
                    </p>
                  ) : null}

                  <p className="mt-4 text-[9px] font-black uppercase tracking-[0.16em] text-white/25">
                    Published{" "}
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center rounded-full border border-white/10 px-5 text-[9px] font-black uppercase tracking-[0.14em] text-white/55"
                    >
                      Open ↗
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => removeResearch(item.id)}
                    className="h-11 rounded-full border border-red-400/15 bg-red-400/[0.06] px-5 text-[9px] font-black uppercase tracking-[0.14em] text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[240px] place-items-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <div>
            <p className="text-2xl font-black text-white">
              No research published
            </p>

            <p className="mt-3 text-sm text-white/35">
              Your reports and investment theses will appear here.
            </p>
          </div>
        </div>
      )}

      {message ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
          {message}
        </p>
      ) : null}

      {state.uid ? (
        <a
          href={`/m/${state.uid}?section=research#hq-research`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 items-center rounded-full border border-white/10 px-8 text-[10px] font-black uppercase tracking-[0.16em] text-white/55"
        >
          View Public Research ↗
        </a>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-3 block text-xs font-black uppercase tracking-[0.22em] text-white/35">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[20px] border border-white/10 bg-[#0d0d0d] px-5 py-4 text-white outline-none placeholder:text-white/20 focus:border-[#b6ff00]/50"
      />
    </div>
  );
}
