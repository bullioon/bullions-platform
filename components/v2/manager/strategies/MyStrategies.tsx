"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import type { ManagerStrategy } from "@/types/v2/managerStrategy";
import type { Strategy } from "@/types/v2/domain/strategy";
import { Button } from "@/components/v2/ui/Button";
import { Card } from "@/components/v2/ui/Card";
import { Metric } from "@/components/v2/ui/Metric";
import { StrategyStatusBadge } from "./StrategyStatusBadge";


function strategyToManagerStrategy(strategy: Strategy): ManagerStrategy {
  return {
    id: strategy.id,
    name: strategy.identity?.name || "Untitled Strategy",
    status: strategy.status?.state === "published" ? "ACTIVE" : "DRAFT",
    verified: Boolean(strategy.status?.verified),
    capitalFollowing: Number(strategy.performance?.capitalFollowing || 0),
    allocators: Number(strategy.performance?.allocators || 0),
    roi: Number(strategy.performance?.roi || 0),
    maxDrawdown: Number(strategy.performance?.maxDrawdown || 0),
    profitFactor: Number(strategy.performance?.profitFactor || 0),
    createdAt: strategy.createdAt
      ? new Date(Number(strategy.createdAt)).toLocaleDateString()
      : "Today",
  };
}

function usd(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

const MAX_MANAGER_STRATEGIES = 3;

export function MyStrategies() {
  const [strategies, setStrategies] = useState<ManagerStrategy[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user?.uid) {
      setStrategies([]);
      return;
    }

    StrategyRepository.listByManager(user.uid).then((items) => {
      setStrategies(items.map(strategyToManagerStrategy));
    });
  }, [user, loading]);

  const canCreateStrategy = strategies.length < MAX_MANAGER_STRATEGIES;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
            Manager Portal
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-[-0.06em] text-white">
            My Strategies
          </h1>

        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/45">
            {strategies.length}/{MAX_MANAGER_STRATEGIES} Strategies
          </div>

          {canCreateStrategy ? (
            <Link href="/manager/strategies/new">
              <Button>New Strategy →</Button>
            </Link>
          ) : (
            <Button disabled>Limit Reached</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {strategies.map((strategy) => (
          <Card key={strategy.id}>
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-white">{strategy.name}</h2>
                  <StrategyStatusBadge status={strategy.status} />
                  {strategy.verified ? (
                    <span className="text-xs font-black text-[#b6ff00]">Verified</span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-white/35">
                  Created {strategy.createdAt}
                </p>
              </div>

              <div className="flex gap-2">
                <Link href={`/s/${strategy.id}`}>
                  <Button variant="ghost">Preview</Button>
                </Link>

                <Link
                  href={`/trading-desk?strategyId=${encodeURIComponent(
                    strategy.id
                  )}`}
                >
                  <Button variant="secondary">
                    Trading Desk
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-white/8 pt-5 sm:grid-cols-5">
              <Metric label="ROI" value={`+${strategy.roi.toFixed(1)}%`} tone="green" />
              <Metric label="Max DD" value={`${strategy.maxDrawdown.toFixed(1)}%`} />
              <Metric label="PF" value={strategy.profitFactor.toFixed(2)} tone="purple" />
              <Metric label="Capital" value={usd(strategy.capitalFollowing)} />
              <Metric label="Allocators" value={strategy.allocators.toLocaleString()} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
