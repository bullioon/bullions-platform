export type StrategyRisk = "LOW" | "MEDIUM" | "HIGH";
export type StrategyTier = "TIER A" | "TIER B" | "TIER C";

export type StrategyProfile = {
  id: string;
  name: string;
  managerName: string;
  subtitle: string;
  tier: StrategyTier;
  verified: boolean;
  markets: string[];
  style: string;
  risk: StrategyRisk;
  since: string;
  roi: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  brainScore: number;
  capitalFollowing: number;
  allocators: number;
  sixAssessment: string;
};
