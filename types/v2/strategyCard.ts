export type StrategyCardVariant = "official" | "community" | "challenge";

export type StrategyCardData = {
  id: string;
  name: string;
  subtitle: string;
  managerName: string;
  variant: StrategyCardVariant;
  roi: number;
  maxDrawdown: number;
  profitFactor: number;
  capitalFollowing: number;
  sixTitle: string;
  sixBody: string;
};
