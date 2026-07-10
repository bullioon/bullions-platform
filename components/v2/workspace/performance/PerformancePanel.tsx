"use client";

import { useEffect, useState } from "react";

import { evaluatePerformance } from "@/core/v2/performance/PerformanceEngine";
import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";
import type { PerformanceSnapshot } from "@/types/v2/domain/performance";
import { Card } from "@/components/v2/ui/Card";
import { Metric } from "@/components/v2/ui/Metric";

export function PerformancePanel({ strategyId }: { strategyId: string }) {
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);

  useEffect(() => {
    PerformanceRepository.latest(strategyId).then(setSnapshot);
  }, [strategyId]);

  if (!snapshot) {
    return (
      <Card>
        <p className="text-white/40">No performance data yet.</p>
      </Card>
    );
  }

  const result = evaluatePerformance(snapshot);

  return (
    <section className="space-y-5">
      <Card>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
          Performance Engine
        </p>

        <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
          Live Strategy Performance
        </h2>

        <p className="mt-3 text-sm text-white/40">
          Last snapshot: {new Date(snapshot.timestamp).toLocaleString()}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><Metric label="ROI" value={`${result.roi.toFixed(2)}%`} tone="green" /></Card>
        <Card><Metric label="Win Rate" value={`${result.winRate.toFixed(1)}%`} /></Card>
        <Card><Metric label="Risk Score" value={result.riskScore.toFixed(0)} /></Card>
        <Card><Metric label="Challenge Score" value={result.challengeScore.toFixed(2)} tone="purple" /></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><Metric label="Balance" value={`$${snapshot.balance.toLocaleString()}`} /></Card>
        <Card><Metric label="Equity" value={`$${snapshot.equity.toLocaleString()}`} /></Card>
        <Card><Metric label="Max Drawdown" value={`${snapshot.maxDrawdown.toFixed(1)}%`} /></Card>
      </div>
    </section>
  );
}
