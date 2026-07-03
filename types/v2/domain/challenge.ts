export type ChallengeStatus = "upcoming" | "registration" | "active" | "completed";
export type ChallengeTierId = "demo_50k" | "demo_200k";

export type ChallengeTier = {
  id: ChallengeTierId;
  label: string;
  demoAccountUsd: number;
  entryFeeUsd: number;
};

export type ChallengeRules = {
  maxDailyLossPct: number;
  maxTotalDrawdownPct: number;
  minTradingDays: number;
  maxLotSize: number;
  newsTradingAllowed: boolean;
  copyEaAllowed: boolean;
};

export type ChallengeSeason = {
  id: string;
  name: string;
  status: ChallengeStatus;
  cadence: "monthly";
  tiers: ChallengeTier[];
  rules: ChallengeRules;
  prizePoolUsd: number;
  winnerPrizeUsd: number;
  maxParticipants: number;
  registrationClosesAt: number;
  startsAt: number;
  endsAt: number;
};

export type ChallengeEntry = {
  id: string;
  seasonId: string;
  strategyId: string;
  tierId: ChallengeTierId;
  paid: boolean;
  disqualified: boolean;
  disqualificationReason: string | null;
  rank: number | null;
  score: number;
  eligibleForTopFive: boolean;
  payoutSharePct: number;
  createdAt: number;
};
