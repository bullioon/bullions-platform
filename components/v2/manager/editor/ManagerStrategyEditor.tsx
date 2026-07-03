"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getStrategyById,
  updateStrategyIdentity,
} from "@/core/v2/manager/strategyStore";
import { StrategyProfile } from "@/components/v2/strategy/StrategyProfile";
import type { Strategy as DomainStrategy } from "@/types/v2/domain/strategy";
import type { StrategyProfile as StrategyProfileType } from "@/types/v2/strategy";

function toStrategyProfile(strategy: DomainStrategy): StrategyProfileType {
  return {
    id: strategy.id,
    name: strategy.identity.name,
    managerName: strategy.manager.displayName,
    subtitle: strategy.identity.subtitle,
    tier:
      strategy.status.tier === "TIER A" ||
      strategy.status.tier === "TIER B" ||
      strategy.status.tier === "TIER C"
        ? strategy.status.tier
        : "TIER C",
    verified: strategy.status.verified,
    markets: [strategy.markets.primary, ...strategy.markets.secondary].filter(Boolean),
    style: strategy.investment.holdingTime,
    risk:
      strategy.investment.riskProfile === "Conservative"
        ? "LOW"
        : strategy.investment.riskProfile === "Aggressive"
          ? "HIGH"
          : "MEDIUM",
    since: new Date(strategy.createdAt).toLocaleDateString(),
    roi: strategy.performance.roi ?? 0,
    maxDrawdown: strategy.performance.maxDrawdown ?? 0,
    winRate: strategy.performance.winRate ?? 0,
    profitFactor: strategy.performance.profitFactor ?? 0,
    brainScore: 0,
    capitalFollowing: strategy.performance.capitalFollowing,
    allocators: strategy.performance.allocators,
    sixAssessment:
      strategy.identity.description ||
      "Complete this strategy profile before opening it for allocation.",
  };
}

export function ManagerStrategyEditor({ id }: { id: string }) {
  const [strategy, setStrategy] = useState<DomainStrategy | null>(null);
  const [identity, setIdentity] = useState({
    name: "",
    subtitle: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStrategyById(id).then((found) => {
      setStrategy(found);

      if (found) {
        setIdentity({
          name: found.identity.name,
          subtitle: found.identity.subtitle,
          description: found.identity.description,
        });
      }
    });
  }, [id]);

  async function saveChanges() {
    if (!strategy) return;

    setSaving(true);

    await updateStrategyIdentity(strategy.id, identity);

    setStrategy({
      ...strategy,
      identity: {
        ...strategy.identity,
        ...identity,
      },
      updatedAt: Date.now(),
    });

    setSaving(false);
  }

  if (!strategy) {
    return (
      <main className="min-h-screen bg-[#050606] px-5 py-8 text-white">
        <div className="mx-auto max-w-[900px]">
          <p className="text-white/50">Loading strategy...</p>
          <Link href="/manager/strategies" className="mt-4 inline-block text-[#b6ff00]">
            Back to My Strategies
          </Link>
        </div>
      </main>
    );
  }

  const previewStrategy = {
    ...strategy,
    identity: {
      ...strategy.identity,
      ...identity,
    },
  };

  return (
    <StrategyProfile
      strategy={toStrategyProfile(previewStrategy)}
      editable
      editorControls={
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
              Name
            </span>
            <input
              value={identity.name}
              onChange={(event) =>
                setIdentity((current) => ({ ...current, name: event.target.value }))
              }
              className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-black text-white outline-none focus:border-[#b66dff]/40"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
              Subtitle
            </span>
            <input
              value={identity.subtitle}
              onChange={(event) =>
                setIdentity((current) => ({ ...current, subtitle: event.target.value }))
              }
              className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-black text-white outline-none focus:border-[#b66dff]/40"
            />
          </label>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="mt-auto h-12 rounded-2xl bg-[#b6ff00] px-5 text-sm font-black text-black disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <label className="grid gap-2 md:col-span-3">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
              Description
            </span>
            <textarea
              value={identity.description}
              onChange={(event) =>
                setIdentity((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none focus:border-[#b66dff]/40"
            />
          </label>
        </div>
      }
    />
  );
}
