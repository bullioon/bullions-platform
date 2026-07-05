import type { RuntimeGrade, StrategyRuntime } from "./types";

type RawDoc = Record<string, unknown>;

function objectValue(value: unknown): RawDoc {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RawDoc)
    : {};
}

function numberValue(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function round(n: number, decimals = 2): number {
  return Number(n.toFixed(decimals));
}

function gradeFromScores(input: {
  roi: number;
  maxDrawdown: number;
  profitFactor: number;
  allocatorScore: number;
}): RuntimeGrade {
  if (input.maxDrawdown >= 14) return "high_risk";
  if (input.roi < 0) return "watchlist";
  if (input.allocatorScore >= 82 && input.profitFactor >= 1.8) return "elite";
  if (input.allocatorScore >= 68) return "strong";
  return "stable";
}

function sixAssessment(input: {
  grade: RuntimeGrade;
  roi: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
}): string {
  if (input.grade === "elite") {
    return "SIX sees elite execution quality with strong risk-adjusted performance and controlled drawdown.";
  }

  if (input.grade === "strong") {
    return "SIX sees a strong strategy profile. Performance is constructive, with risk remaining within acceptable limits.";
  }

  if (input.grade === "high_risk") {
    return "SIX flags elevated risk. Drawdown requires attention before this strategy deserves stronger allocator conviction.";
  }

  if (input.grade === "watchlist") {
    return "SIX is monitoring recovery behavior. The strategy needs cleaner execution before allocator confidence increases.";
  }

  return "SIX sees stable behavior. The strategy is investable, but still needs more evidence of persistent edge.";
}

export function buildStrategyRuntime(input: {
  strategyId: string;
  strategy: RawDoc;
  latestSnapshot?: RawDoc | null;
}): StrategyRuntime {
  const identity = objectValue(input.strategy.identity);
  const manager = objectValue(input.strategy.manager);
  const performanceDoc = objectValue(input.strategy.performance);
  const challengeDoc = objectValue(input.strategy.challenge);
  const statusDoc = objectValue(input.strategy.status);
  const snapshot = objectValue(input.latestSnapshot);

  const initialBalance = numberValue(snapshot.initialBalance ?? performanceDoc.initialBalance, 100000);
  const balance = numberValue(snapshot.balance ?? performanceDoc.balance, initialBalance);
  const equity = numberValue(snapshot.equity ?? performanceDoc.equity, balance);

  const roi = numberValue(
    snapshot.roi ?? performanceDoc.roi,
    initialBalance > 0 ? ((equity - initialBalance) / initialBalance) * 100 : 0
  );

  const winRate = numberValue(snapshot.winRate ?? performanceDoc.winRate, 0);
  const profitFactor = numberValue(snapshot.profitFactor ?? performanceDoc.profitFactor, 0);
  const maxDrawdown = numberValue(snapshot.maxDrawdown ?? performanceDoc.maxDrawdown, 0);
  const totalTrades = numberValue(snapshot.totalTrades ?? performanceDoc.totalTrades, 0);
  const openTrades = numberValue(snapshot.openTrades ?? performanceDoc.openTrades, 0);
  const dailyReturnPct = numberValue(snapshot.dailyReturnPct ?? performanceDoc.dailyReturnPct, 0);

  const riskScore = clamp(100 - maxDrawdown * 6);
  const consistencyScore = clamp(winRate * 0.45 + profitFactor * 18 + riskScore * 0.25);
  const allocatorScore = clamp(roi * 1.15 + consistencyScore * 0.45 + riskScore * 0.35);
  const challengeScore = clamp(roi * 1.4 + winRate * 0.25 + profitFactor * 12 - maxDrawdown * 2);

  const grade = gradeFromScores({ roi, maxDrawdown, profitFactor, allocatorScore });

  const visible =
    stringValue(statusDoc.visibility, "private") === "discover" ||
    booleanValue(statusDoc.verified, false) ||
    stringValue(challengeDoc.status, "not_enrolled") === "top_5";

  return {
    strategyId: input.strategyId,
    managerUid: stringValue(manager.uid, "") || null,
    name: stringValue(identity.name, "Unknown Strategy"),
    subtitle: stringValue(identity.subtitle, ""),
    avatarUrl: stringValue(identity.avatarUrl, ""),
    bannerUrl: stringValue(identity.bannerUrl, ""),
    performance: {
      initialBalance: round(initialBalance),
      balance: round(balance),
      equity: round(equity),
      roi: round(roi),
      winRate: round(winRate, 1),
      profitFactor: round(profitFactor),
      maxDrawdown: round(maxDrawdown),
      totalTrades: round(totalTrades, 0),
      openTrades: round(openTrades, 0),
      dailyReturnPct: round(dailyReturnPct, 3),
      lastSyncedAt: numberValue(snapshot.syncedAt ?? performanceDoc.lastSyncedAt, 0) || null,
    },
    scores: {
      allocatorScore: round(allocatorScore),
      challengeScore: round(challengeScore),
      riskScore: round(riskScore),
      consistencyScore: round(consistencyScore),
    },
    universe: {
      grade,
      eligible: allocatorScore >= 50 && maxDrawdown <= 14 && totalTrades >= 10,
      visible,
    },
    challenge: {
      status: stringValue(challengeDoc.status, "not_enrolled"),
      rank: numberValue(challengeDoc.rank, 0) || null,
      eligibleForLeaderboard: booleanValue(challengeDoc.eligibleForLeaderboard, false),
    },
    six: {
      assessment: sixAssessment({ grade, roi, maxDrawdown, winRate, profitFactor }),
      conviction: grade,
    },
    updatedAt: Date.now(),
  };
}
