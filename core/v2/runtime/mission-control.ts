export type MissionTrader = {
  id: string;
  traderHref: string;
  strategyHref: string;
  name: string;
  handle: string;
  profit: string;
  accountSize: "50K" | "200K";
  market: string;
  engine: "MT5" | "AI";
  openTrades: number;
  winRate: string;
  drawdown: string;
  profitFactor: string;
  synced: string;
};

export const missionTraders: MissionTrader[] = [
  { id: "ghost-alpha", traderHref: "/trader-profile?id=ghost-alpha", strategyHref: "/strategy-profile?id=ghost-alpha", name: "Ghost Alpha", handle: "@ghostalpha", profit: "+$153,594", accountSize: "200K", market: "XAU/USD", engine: "MT5", openTrades: 4, winRate: "78%", drawdown: "3.8%", profitFactor: "2.14", synced: "30m delay" },
  { id: "axbull", traderHref: "/trader-profile?id=axbull", strategyHref: "/strategy-profile?id=axbull", name: "AxBull", handle: "@axbullions", profit: "+$84,202", accountSize: "50K", market: "NAS100", engine: "MT5", openTrades: 2, winRate: "71%", drawdown: "4.1%", profitFactor: "1.92", synced: "30m delay" },
  { id: "six-quant", traderHref: "/trader-profile?id=six-quant", strategyHref: "/strategy-profile?id=six-quant", name: "SIX Quant", handle: "@sixai", profit: "+$45,481", accountSize: "50K", market: "Multi Asset", engine: "AI", openTrades: 6, winRate: "74%", drawdown: "5.2%", profitFactor: "2.01", synced: "live model" },
  { id: "mia-capital", traderHref: "/trader-profile?id=mia-capital", strategyHref: "/strategy-profile?id=mia-capital", name: "MIA Capital", handle: "@miacapital", profit: "+$38,412", accountSize: "50K", market: "XAU/USD", engine: "MT5", openTrades: 3, winRate: "69%", drawdown: "4.8%", profitFactor: "1.88", synced: "30m delay" },
  { id: "uranio-desk", traderHref: "/trader-profile?id=uranio-desk", strategyHref: "/strategy-profile?id=uranio-desk", name: "Uranio Desk", handle: "@uranio", profit: "+$31,193", accountSize: "200K", market: "Macro", engine: "AI", openTrades: 8, winRate: "76%", drawdown: "6.1%", profitFactor: "2.31", synced: "live model" },
  { id: "quant-edge", traderHref: "/trader-profile?id=quant-edge", strategyHref: "/strategy-profile?id=quant-edge", name: "Quant Edge", handle: "@quantedge", profit: "+$21,481", accountSize: "50K", market: "XAU/USD", engine: "MT5", openTrades: 1, winRate: "67%", drawdown: "3.4%", profitFactor: "1.73", synced: "30m delay" },
];
