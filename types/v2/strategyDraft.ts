export type StrategyRiskProfile = "Conservative" | "Moderate" | "Aggressive";
export type StrategyHoldingTime = "Scalping" | "Intraday" | "Swing";

export type StrategyDraft = {
  id: string;

  identity: {
    name: string;
    subtitle: string;
    description: string;
  };

  markets: {
    selected: string[];
    primary: string;
  };

  investment: {
    riskProfile: StrategyRiskProfile;
    holdingTime: StrategyHoldingTime;
    minimumAllocation: number;
    capacity: number;
  };

  status: "draft" | "published";
};
