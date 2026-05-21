export type UserTier = "BULLION" | "HELLION" | "TORION";

export function resolveTier(depositedUsd: number): UserTier {
  if (depositedUsd >= 1000) return "TORION";
  if (depositedUsd >= 500) return "HELLION";
  return "BULLION";
}

export function maxWithdrawalPct(tier: UserTier) {
  switch (tier) {
    case "BULLION":
      return 0.1;

    case "HELLION":
      return 0.3;

    case "TORION":
      return 1;
  }
}

export function canWithdrawToday() {
  const day = new Date().getDay();

  return day === 0;
}


export function maxAllocationPct(tier: UserTier) {
  switch (tier) {
    case "BULLION":
      return 0.4;

    case "HELLION":
      return 0.65;

    case "TORION":
      return 0.8;
  }
}
