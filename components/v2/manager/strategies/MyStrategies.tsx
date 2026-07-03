"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getManagerStrategies } from "@/core/v2/manager/strategyStore";
import type { ManagerStrategy } from "@/types/v2/managerStrategy";
import { Button } from "@/components/v2/ui/Button";
import { Card } from "@/components/v2/ui/Card";
import { Metric } from "@/components/v2/ui/Metric";
import { StrategyStatusBadge } from "./StrategyStatusBadge";

function usd(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function MyStrategies() {
  const [strategies, setStrategies] = useState<ManagerStrategy[]>([]);

  useEffect(() => {
    getManagerStrategies().then(setStrategies);
  }, []);

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

        <Link href="/manager/strategies/new">
          <Button>New Strategy →</Button>
        </Link>
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
                <Link href="/strategy-profile">
                  <Button variant="ghost">Preview</Button>
                </Link>

                <Link href={`/workspace/${strategy.id}`}>
                  <Button variant="outline">Workspace</Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-white/8 pt-5 sm:grid-cols-5">
              <Metric label="ROI" value={`+${strategy.roi.toFixed(1)}%`} tone="success" />
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
