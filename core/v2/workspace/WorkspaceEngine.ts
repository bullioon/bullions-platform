import type { Strategy } from "@/types/v2/domain/strategy";

export type WorkspaceTask = {
  id: string;
  title: string;
  done: boolean;
};

export type WorkspaceState = {
  health: number;
  tasks: WorkspaceTask[];
  recommendation: string;
};

export function evaluateWorkspace(
  strategy: Strategy,
  stats?: { publishedResearch?: number }
): WorkspaceState {
  const tasks: WorkspaceTask[] = [
    {
      id: "profile",
      title: "Complete public profile",
      done:
        strategy.identity.name.length > 2 &&
        strategy.identity.subtitle.length > 2 &&
        strategy.identity.description.length > 10,
    },
    {
      id: "markets",
      title: "Select markets",
      done: Boolean(strategy.markets.primary),
    },
    {
      id: "research",
      title: "Publish first research",
      done: Boolean(stats?.publishedResearch && stats.publishedResearch > 0),
    },
    {
      id: "challenge",
      title: "Enter Weekly Challenge",
      done: strategy.challenge?.status !== "not_enrolled",
    },
    {
      id: "mt5",
      title: "Connect MT5 performance",
      done: strategy.performance.roi !== null,
    },
  ];

  const done = tasks.filter((task) => task.done).length;
  const health = Math.round((done / tasks.length) * 100);

  const next = tasks.find((task) => !task.done);

  return {
    health,
    tasks,
    recommendation: next
      ? `Next step: ${next.title}.`
      : "Your strategy is ready for allocator discovery.",
  };
}
