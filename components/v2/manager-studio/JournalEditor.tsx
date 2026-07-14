"use client";

import { useEffect, useMemo, useState } from "react";

import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";
import type { Manager } from "@/types/v2/domain/manager";
import { useStudio } from "./StudioContext";

type JournalEntry = NonNullable<
  NonNullable<Manager["social"]>["journal"]
>[number];

export function JournalEditor() {
  const { state } = useStudio();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadJournal() {
      if (!state.uid) {
        setLoading(false);
        return;
      }

      try {
        const manager = await ManagerRepository.get(state.uid);

        if (!alive) return;

        setEntries(
          [...(manager?.social?.journal ?? [])].sort(
            (a, b) => b.publishedAt - a.publishedAt
          )
        );
      } catch (error) {
        if (!alive) return;

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load journal."
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadJournal();

    return () => {
      alive = false;
    };
  }, [state.uid]);

  const characterCount = useMemo(() => body.trim().length, [body]);

  async function persist(nextEntries: JournalEntry[]) {
    if (!state.uid) {
      setMessage("Login required.");
      return false;
    }

    await ManagerRepository.updateSocial(state.uid, {
      journal: nextEntries,
    });

    return true;
  }

  async function publishEntry() {
    const cleanBody = body.trim();

    if (!cleanBody) {
      setMessage("Write an update first.");
      return;
    }

    if (cleanBody.length > 600) {
      setMessage("Journal updates must be 600 characters or fewer.");
      return;
    }

    setSaving(true);
    setMessage("");

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const nextEntry: JournalEntry = {
      id,
      body: cleanBody,
      publishedAt: Date.now(),
    };

    const nextEntries = [nextEntry, ...entries];

    try {
      await persist(nextEntries);
      setEntries(nextEntries);
      setBody("");
      setMessage("Journal update published.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not publish journal update."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(id: string) {
    const previousEntries = entries;
    const nextEntries = entries.filter((entry) => entry.id !== id);

    setEntries(nextEntries);
    setMessage("");

    try {
      await persist(nextEntries);
      setMessage("Journal update removed.");
    } catch (error) {
      setEntries(previousEntries);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not remove journal update."
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-white/40">
        Loading journal...
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[28px] border border-white/10 bg-black/20 p-6">
        <p className="text-xl font-black text-white">Publish an update</p>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
          Share market context, trading decisions, milestones or updates from
          your investment process.
        </p>

        <textarea
          rows={5}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Reduced gold exposure ahead of CPI. Risk remains controlled."
          className="mt-6 w-full rounded-[22px] border border-white/10 bg-[#0d0d0d] px-5 py-4 leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#b6ff00]/50"
        />

        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-white/25">{characterCount}/600</p>

          <button
            type="button"
            disabled={saving || !body.trim() || characterCount > 600}
            onClick={publishEntry}
            className="h-12 rounded-full bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.16em] text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Publishing..." : "Publish Update"}
          </button>
        </div>
      </section>

      {entries.length ? (
        <div className="space-y-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[24px] border border-white/10 bg-[#0b0c0b] p-5"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-white/70">
                    {entry.body}
                  </p>

                  <p className="mt-4 text-[9px] font-black uppercase tracking-[0.17em] text-white/25">
                    {new Date(entry.publishedAt).toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="shrink-0 rounded-full border border-red-400/15 bg-red-400/[0.06] px-4 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-red-300"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[220px] place-items-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <div>
            <p className="text-2xl font-black text-white">No updates yet</p>

            <p className="mt-3 text-sm text-white/35">
              Your published manager updates will appear here.
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
          href={`/m/${state.uid}?section=journal#hq-journal`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 items-center rounded-full border border-white/10 px-8 text-[10px] font-black uppercase tracking-[0.16em] text-white/55"
        >
          View Public Journal ↗
        </a>
      ) : null}
    </div>
  );
}
