export type PerformanceSnapshot = {
  period: "30D" | "90D" | "YTD" | "ALL";

  roi: number;
  profitFactor: number;
  winRate: number;
  maxDrawdown: number;

  monthlyReturns: number[];

  equityCurve: number[];

  drawdownCurve: number[];

  recentTrades: {
    pair: string;
    side: "BUY" | "SELL";
    pnl: number;
    date: string;
  }[];
};
