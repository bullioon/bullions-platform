export type Trader = {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  roi: number;
  profitUsd: number;
  balance: number;
  topTrade: number;
  maxLoss: number;
};

export const mockTraders: Trader[] = [
  {
    id: "diego",
    name: "Diego Ramirez",
    tag: "XAU/USD Beast",
    avatar: "DR",
    roi: 74.4,
    profitUsd: 49820,
    balance: 79933,
    topTrade: 18.4,
    maxLoss: 3.2,
  },
  {
    id: "bullions-bot",
    name: "Bullions Bot",
    tag: "AI Scalper",
    avatar: "BB",
    roi: 60.3,
    profitUsd: 42100,
    balance: 68240,
    topTrade: 15.8,
    maxLoss: 2.8,
  },
  {
    id: "nova",
    name: "Nova Trades",
    tag: "Momentum Hunter",
    avatar: "NT",
    roi: 49.2,
    profitUsd: 33700,
    balance: 53180,
    topTrade: 12.6,
    maxLoss: 4.1,
  },
  {
    id: "maria",
    name: "Maria Santos",
    tag: "Risk Controller",
    avatar: "MS",
    roi: 45.8,
    profitUsd: 29800,
    balance: 48160,
    topTrade: 10.2,
    maxLoss: 2.1,
  },
  {
    id: "alex",
    name: "Alex Rivera",
    tag: "Gold Intraday",
    avatar: "AR",
    roi: 43.4,
    profitUsd: 28400,
    balance: 46400,
    topTrade: 9.8,
    maxLoss: 3.5,
  },
  {
    id: "ghost",
    name: "Ghost Alpha",
    tag: "Low Risk Grid",
    avatar: "GA",
    roi: 33.6,
    profitUsd: 22100,
    balance: 39120,
    topTrade: 7.9,
    maxLoss: 1.9,
  },
];
