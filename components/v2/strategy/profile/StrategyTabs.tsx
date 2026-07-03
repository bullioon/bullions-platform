"use client";

import { useState } from "react";
import type { StrategyProfile } from "@/types/v2/strategy";
import { ResearchList } from "@/components/v2/research/ResearchList";
import { Card } from "@/components/v2/ui/Card";
import { Metric } from "@/components/v2/ui/Metric";
import { StatRow } from "@/components/v2/ui/StatRow";
import { Button } from "@/components/v2/ui/Button";

type Tab = "research" | "performance" | "methodology" | "products";

export function StrategyTabs({ strategy }: { strategy: StrategyProfile }) {
  const [tab, setTab] = useState<Tab>("research");

  const tabs: { id: Tab; label: string }[] = [
    { id: "research", label: "Research" },
    { id: "performance", label: "Performance" },
    { id: "methodology", label: "Methodology" },
    { id: "products", label: "Products" },
  ];

  return (
    <section className="space-y-5">
      <div className="flex gap-8 border-b border-white/10 px-2 text-sm font-black uppercase tracking-[0.14em]">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={
              tab === item.id
                ? "border-b-2 border-[#b6ff00] pb-4 text-[#b6ff00]"
                : "pb-4 text-white/35 transition hover:text-white/70"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "research" ? <ResearchList /> : null}

      {tab === "performance" ? (
        <Card>
          <div className="grid gap-5 sm:grid-cols-4">
            <Metric label="ROI" value={`+${strategy.roi.toFixed(1)}%`} tone="success" />
            <Metric label="Max DD" value={`${strategy.maxDrawdown.toFixed(1)}%`} />
            <Metric label="Win Rate" value={`${strategy.winRate.toFixed(0)}%`} />
            <Metric label="Profit Factor" value={strategy.profitFactor.toFixed(2)} tone="purple" />
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-black text-white">Performance timeline</p>
            <div className="mt-6 h-2 rounded-full bg-white/10">
              <div className="h-2 w-[72%] rounded-full bg-[#b6ff00]" />
            </div>
            <p className="mt-4 text-sm text-white/40">
              Live MT5 equity curve will be connected here.
            </p>
          </div>
        </Card>
      ) : null}

      {tab === "methodology" ? (
        <Card>
          <StatRow label="Style" value={strategy.style} />
          <StatRow label="Markets" value={strategy.markets.join(" · ")} />
          <StatRow label="Risk Model" value={strategy.risk} />
          <StatRow label="Holding Time" value="Intraday" />
          <StatRow label="Primary Session" value="London" />
          <StatRow label="Since" value={strategy.since} />
        </Card>
      ) : null}

      {tab === "products" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Premium Signals", "$29/mo", "Private execution notes and weekly setups."],
            ["Mentorship", "$199", "One-on-one strategy review with the manager."],
            ["Risk Guide", "Included", "Capital allocation and drawdown rules."],
          ].map(([title, price, body]) => (
            <Card key={title}>
              <p className="text-xl font-black text-white">{title}</p>
              <p className="mt-2 text-2xl font-black text-[#b6ff00]">{price}</p>
              <p className="mt-4 text-sm leading-6 text-white/40">{body}</p>
              <Button className="mt-6 w-full" variant="outline">
                View Product
              </Button>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
