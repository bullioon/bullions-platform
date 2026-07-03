export type WithdrawalEvent = {
  strategyId: string;
  seasonId: string;
  allocatorId: string;
  amountUsd: number;
  timestamp: number;
};

export type RevenueBreakdown = {
  traderPct: number;
  traderAmountUsd: number;

  bullionsPct: number;
  bullionsAmountUsd: number;

  rank: number;
};
