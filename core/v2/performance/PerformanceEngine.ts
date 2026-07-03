import type {
  PerformanceEvaluation,
  PerformanceSnapshot,
} from "@/types/v2/domain/performance";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function evaluatePerformance(
  snapshot: PerformanceSnapshot
): PerformanceEvaluation {
  const pnl = snapshot.equity - snapshot.deposits + snapshot.withdrawals;

  const roi =
    snapshot.deposits > 0
      ? (pnl / snapshot.deposits) * 100
      : 0;

  const winRate =
    snapshot.trades > 0
      ? (snapshot.wins / snapshot.trades) * 100
      : 0;

  const riskScore = clamp(100 - snapshot.maxDrawdown * 10);

  const consistencyScore = clamp(
    winRate * 0.45 + snapshot.profitFactor * 18 + riskScore * 0.25
  );

  const allocatorScore = clamp(
    roi * 1.1 + consistencyScore * 0.45 + riskScore * 0.35
  );

  const challengeScore = clamp(
    roi * 1.4 + winRate * 0.25 + snapshot.profitFactor * 12 - snapshot.maxDrawdown * 2
  );

  return {
    roi,
    pnl,
    winRate,
    riskScore,
    consistencyScore,
    allocatorScore,
    challengeScore,
  };
}
