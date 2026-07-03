import type { StrategyProfile } from "@/types/v2/strategy";

export const strategiesV2: StrategyProfile[] = [
  {
    id: "ghost-alpha",
    name: "Ghost Alpha",
    managerName: "Alex Smith",
    subtitle: "Institutional Gold Strategy",
    tier: "TIER A",
    verified: true,
    markets: ["Gold", "Indices", "FX"],
    style: "Momentum",
    risk: "MEDIUM",
    since: "2024",
    roi: 28.4,
    maxDrawdown: 4.8,
    winRate: 63,
    profitFactor: 2.31,
    brainScore: 94,
    capitalFollowing: 1800000,
    allocators: 842,
    sixAssessment:
      "Execution quality remains stable despite increased capital allocation. Drawdown has stayed below the Strategy Universe average during the last 60 sessions.",
  },
];
