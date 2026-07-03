import type {
  RevenueBreakdown,
  WithdrawalEvent,
} from "@/types/v2/domain/revenue";

export function calculateRevenue(
  withdrawal: WithdrawalEvent,
  rank: number
): RevenueBreakdown {

  const traderPct = rank === 1 ? 35 : 25;

  const traderAmountUsd =
    withdrawal.amountUsd * traderPct / 100;

  const bullionsPct = 100 - traderPct;

  const bullionsAmountUsd =
    withdrawal.amountUsd - traderAmountUsd;

  return {

    traderPct,
    traderAmountUsd,

    bullionsPct,
    bullionsAmountUsd,

    rank,

  };

}
