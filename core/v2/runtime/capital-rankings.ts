import { getAdminDb } from "@/lib/firebaseAdmin";
import { RuntimeRepository } from "@/core/v2/runtime/RuntimeRepository";
import type {
  RuntimeGrade,
  StrategyRuntime,
} from "@/core/v2/runtime/types";

export type CapitalRanking = {
  id: string;

  traderHref: string;
  strategyHref: string;

  name: string;
  handle: string;
  subtitle: string;

  accountSize: "50K" | "200K";
  market: string;
  engine: "MT5" | "AI";

  initialBalance: number;
  balance: number;
  equity: number;
  profitUsd: number;
  roi: number;

  openTrades: number;
  totalTrades: number;
  winRate: number;
  drawdown: number;
  profitFactor: number;

  allocatorScore: number;
  challengeScore: number;
  riskScore: number;
  consistencyScore: number;

  challengeRank: number | null;
  challengeStatus: string;

  grade: RuntimeGrade;
  eligible: boolean;
  visible: boolean;

  mt5Status: "live" | "stale" | "offline" | "pending";
  lastSyncedAt: number | null;

  sixAssessment: string;
  sixConviction: RuntimeGrade;
};

function resolveAccountSize(
  initialBalance: number
): "50K" | "200K" {
  return initialBalance >= 150000 ? "200K" : "50K";
}

function strategyHandle(name: string) {
  return `@${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")}`;
}

function toRanking(
  runtime: StrategyRuntime
): CapitalRanking {
  const profitUsd =
    runtime.performance.equity -
    runtime.performance.initialBalance;

  return {
    id: runtime.strategyId,

    traderHref: `/m/${runtime.managerUid ?? runtime.strategyId}`,
    strategyHref: `/strategy-profile?id=${runtime.strategyId}`,

    name: runtime.name,
    handle: strategyHandle(runtime.name),
    subtitle: runtime.subtitle || "Verified MT5 strategy",

    accountSize: resolveAccountSize(
      runtime.performance.initialBalance
    ),

    market: runtime.subtitle || "Multi-asset",
    engine: "MT5",

    initialBalance:
      runtime.performance.initialBalance,

    balance:
      runtime.performance.balance,

    equity:
      runtime.performance.equity,

    profitUsd,
    roi:
      runtime.performance.roi,

    openTrades:
      runtime.performance.openTrades,

    totalTrades:
      runtime.performance.totalTrades,

    winRate:
      runtime.performance.winRate,

    drawdown:
      runtime.performance.maxDrawdown,

    profitFactor:
      runtime.performance.profitFactor,

    allocatorScore:
      runtime.scores.allocatorScore,

    challengeScore:
      runtime.scores.challengeScore,

    riskScore:
      runtime.scores.riskScore,

    consistencyScore:
      runtime.scores.consistencyScore,

    challengeRank:
      runtime.challenge.rank,

    challengeStatus:
      runtime.challenge.status,

    grade:
      runtime.universe.grade,

    eligible:
      runtime.universe.eligible,

    visible:
      runtime.universe.visible,

    mt5Status:
      runtime.mt5.status,

    lastSyncedAt:
      runtime.performance.lastSyncedAt,

    sixAssessment:
      runtime.six.assessment,

    sixConviction:
      runtime.six.conviction,
  };
}

export async function getCapitalRankings(): Promise<
  CapitalRanking[]
> {
  const db = getAdminDb();

  const snap = await db
    .collection("managerStrategies")
    .limit(50)
    .get();

  const runtimes = (
    await Promise.all(
      snap.docs.map((doc) =>
        RuntimeRepository.getStrategyRuntime(doc.id)
      )
    )
  ).filter(Boolean) as StrategyRuntime[];

  return runtimes
    .filter((runtime) => {
      const hasSync = Boolean(
        runtime.performance.lastSyncedAt
      );

      const hasTrades =
        runtime.performance.totalTrades > 0 ||
        runtime.performance.openTrades > 0;

      const hasMovement =
        Math.abs(
          runtime.performance.equity -
            runtime.performance.initialBalance
        ) > 0.01;

      return hasSync || hasTrades || hasMovement;
    })
    .sort((a, b) => {
      const scoreDifference =
        b.scores.allocatorScore -
        a.scores.allocatorScore;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return (
        b.performance.roi -
        a.performance.roi
      );
    })
    .slice(0, 24)
    .map(toRanking);
}
