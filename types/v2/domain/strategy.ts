export type StrategyRiskProfile =
  | "Conservative"
  | "Moderate"
  | "Aggressive";

export type StrategyHoldingTime =
  | "Scalping"
  | "Intraday"
  | "Swing";

export type StrategyStatus =
  | "draft"
  | "published";

export type StrategyVisibility =
  | "private"
  | "discover";

export type StrategyChallengeStatus =
  | "not_enrolled"
  | "enrolled"
  | "qualified"
  | "top_5"
  | "winner";

export interface Strategy {

  id: string;

  identity: {
    name: string;
    subtitle: string;
    description: string;

    avatarUrl: string;
    bannerUrl: string;
  };

  manager: {
    uid: string;
    username: string;
    displayName: string;
  };

  markets: {
    primary: string;
    secondary: string[];
  };

  investment: {
    riskProfile: StrategyRiskProfile;
    holdingTime: StrategyHoldingTime;

    minimumAllocation: number;
    capacity: number;
  };

  performance: {
    roi: number | null;
    winRate: number | null;
    profitFactor: number | null;
    maxDrawdown: number | null;

    capitalFollowing: number;
    allocators: number;
  };

  status: {
    state: StrategyStatus;
    visibility: StrategyVisibility;

    verified: boolean;
    tier: string;
  };

  challenge: {
    status: StrategyChallengeStatus;
    challengeId: string | null;
    rank: number | null;
    eligibleForLeaderboard: boolean;
    entryFeeUsd: number;
    prizeUsd: number;
  };

  createdAt: number;
  updatedAt: number;
}
