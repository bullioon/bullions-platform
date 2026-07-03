export type PerformanceSnapshot = {
  id?: string;

  strategyId: string;
  timestamp: number;

  balance: number;
  equity: number;

  deposits: number;
  withdrawals: number;

  closedPnL: number;
  floatingPnL: number;

  trades: number;
  wins: number;
  losses: number;

  profitFactor: number;
  maxDrawdown: number;
};

export type PerformanceEvaluation = {
  roi: number;
  pnl: number;
  winRate: number;
  riskScore: number;
  consistencyScore: number;
  allocatorScore: number;
  challengeScore: number;
};
