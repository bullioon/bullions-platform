import type { Strategy } from "@/types/v2/domain/strategy";
import { Card } from "@/components/v2/ui/Card";
import { Metric } from "@/components/v2/ui/Metric";
import { evaluateWorkspace } from "@/core/v2/workspace/WorkspaceEngine";
import { ResearchRepository } from "@/core/v2/repositories/ResearchRepository";
import { useEffect, useState } from "react";

export function WorkspaceOverview({ strategy }: { strategy: Strategy }) {

  const [published,setPublished]=useState(0);

  useEffect(()=>{
    ResearchRepository.publishedCount(strategy.id).then(setPublished);
  },[strategy.id]);

  const workspace = evaluateWorkspace(strategy,{
    publishedResearch:published
  });

  return (
    <section className="space-y-5">
      <Card>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
          Overview
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] text-white">
          {strategy.identity.name}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
          {strategy.identity.description || "Complete your strategy profile to improve allocator trust."}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <Metric label="Status" value={strategy.status.state} />
        </Card>

        <Card>
          <Metric label="Visibility" value={strategy.status.visibility} />
        </Card>

        <Card>
          <Metric label="Challenge" value={strategy.challenge?.status || "not_enrolled"} />
        </Card>

        <Card>
          <Metric
            label="Capital"
            value={`$${strategy.performance.capitalFollowing.toLocaleString()}`}
          />
        </Card>
      </div>

      <Card>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
          Strategy Health
        </p>

        <p className="mt-4 text-5xl font-black tracking-[-0.06em] text-white">
          {workspace.health}%
        </p>

        <div className="mt-5 h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-[#b6ff00]"
            style={{ width: `${workspace.health}%` }}
          />
        </div>

        <div className="mt-6 grid gap-3">
          {workspace.tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-white/55">{task.title}</span>
              <span className={task.done ? "text-sm font-black text-[#b6ff00]" : "text-sm font-black text-white/25"}>
                {task.done ? "Done" : "Pending"}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm leading-7 text-white/55">
          {workspace.recommendation}
        </p>
      </Card>
    </section>
  );
}
