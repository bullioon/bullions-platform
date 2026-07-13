export type RuntimeGrade =
  | "elite"
  | "strong"
  | "stable"
  | "watchlist"
  | "high_risk";

export type MT5HealthStatus =
  | "live"
  | "stale"
  | "offline"
  | "pending";

export type StrategyRuntime = {
  strategyId: string;
  managerUid: string | null;
  name: string;
  subtitle: string;
  avatarUrl: string;
  bannerUrl: string;
  performance: {
    initialBalance: number;
    balance: number;
    equity: number;
    roi: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    totalTrades: number;
    openTrades: number;
    dailyReturnPct: number;
    lastSyncedAt: number | null;
  };
  mt5: {
    status: MT5HealthStatus;
    connected: boolean;
    ageMs: number | null;
  };
  scores: {
    allocatorScore: number;
    challengeScore: number;
    riskScore: number;
    consistencyScore: number;
  };
  universe: {
    grade: RuntimeGrade;
    eligible: boolean;
    visible: boolean;
  };
  challenge: {
    status: string;
    rank: number | null;
    eligibleForLeaderboard: boolean;
  };
  six: {
    assessment: string;
    conviction: RuntimeGrade;
  };
  updatedAt: number;
};
