import type { StrategyCardData } from "@/types/v2/strategyCard";

export const strategyUniverse: StrategyCardData[] = [
  {
    id: "bullions-ai",
    name: "Bullions AI",
    subtitle: "Official Strategy Engine",
    managerName: "Bullions",
    variant: "official",
    roi: 26.8,
    maxDrawdown: 6.8,
    profitFactor: 2.31,
    capitalFollowing: 3800000,
    sixTitle: "Official strategy.",
    sixBody: "Systematic execution remains available for approved allocators.",
  },
  {
    id: "ghost-alpha",
    name: "Ghost Alpha",
    subtitle: "Institutional Momentum",
    managerName: "Alex Smith",
    variant: "community",
    roi: 28.4,
    maxDrawdown: 4.8,
    profitFactor: 2.31,
    capitalFollowing: 1800000,
    sixTitle: "Stable execution.",
    sixBody: "Suitable for diversified portfolios with moderate risk tolerance.",
  },
];
