import { getAdminDb } from "@/lib/firebaseAdmin";
import { RuntimeRepository } from "@/core/v2/runtime/RuntimeRepository";
import type {
  RuntimeGrade,
  StrategyRuntime,
} from "@/core/v2/runtime/types";

type RankableRuntime = StrategyRuntime & {
  market: string;
};

function resolveStrategyMarket(
  strategy: Record<string, any>,
  runtime: StrategyRuntime
): string {
  const primary =
    strategy.markets?.primary;

  const secondary =
    Array.isArray(strategy.markets?.secondary)
      ? strategy.markets.secondary[0]
      : null;

  const legacyMarket =
    strategy.market;

  return String(
    primary ||
      secondary ||
      legacyMarket ||
      runtime.subtitle ||
      "Multi-asset"
  );
}

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
  runtime: RankableRuntime
): CapitalRanking {
  const profitUsd =
    runtime.performance.equity -
    runtime.performance.initialBalance;

  return {
    id: runtime.strategyId,

    traderHref: `/m/${runtime.managerUid ?? runtime.strategyId}`,
    strategyHref: `/s/${runtime.strategyId}`,

    name: runtime.name,
    handle: strategyHandle(runtime.name),
    subtitle: runtime.subtitle || "Verified MT5 strategy",

    accountSize: resolveAccountSize(
      runtime.performance.initialBalance
    ),

    market: runtime.market,
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

async function loadRankableRuntimes(): Promise<
  RankableRuntime[]
> {
  const db = getAdminDb();

  const snap = await db
    .collection("managerStrategies")
    .limit(50)
    .get();

  const runtimes = (
    await Promise.all(
      snap.docs.map(async (strategyDoc) => {
        const runtime =
          await RuntimeRepository.getStrategyRuntime(
            strategyDoc.id
          );

        if (!runtime) {
          return null;
        }

        const strategy =
          strategyDoc.data() as Record<
            string,
            any
          >;

        return {
          ...runtime,
          market: resolveStrategyMarket(
            strategy,
            runtime
          ),
        } satisfies RankableRuntime;
      })
    )
  ).filter(Boolean) as RankableRuntime[];

  return runtimes.filter((runtime) => {
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
  });
}

export async function getCapitalRankings(): Promise<
  CapitalRanking[]
> {
  const runtimes =
    await loadRankableRuntimes();

  return runtimes
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


export async function getCompetitionRankings(): Promise<
  CapitalRanking[]
> {
  const runtimes = await loadRankableRuntimes();

  return runtimes
    .filter((runtime) => {
      const status = runtime.challenge.status;

      return (
        status === "enrolled" ||
        status === "qualified" ||
        status === "top_5"
      );
    })
    .sort((a, b) => {
      const aRank =
        a.challenge.rank ?? Number.MAX_SAFE_INTEGER;

      const bRank =
        b.challenge.rank ?? Number.MAX_SAFE_INTEGER;

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      if (
        b.scores.challengeScore !==
        a.scores.challengeScore
      ) {
        return (
          b.scores.challengeScore -
          a.scores.challengeScore
        );
      }

      if (
        b.performance.roi !==
        a.performance.roi
      ) {
        return (
          b.performance.roi -
          a.performance.roi
        );
      }

      const aProfit =
        a.performance.equity -
        a.performance.initialBalance;

      const bProfit =
        b.performance.equity -
        b.performance.initialBalance;

      return bProfit - aProfit;
    })
    .slice(0, 6)
    .map(toRanking);
}

export async function getInvestmentRankings(): Promise<
  CapitalRanking[]
> {
  const runtimes = await loadRankableRuntimes();

  return runtimes
    .sort((a, b) => {
      if (
        b.scores.allocatorScore !==
        a.scores.allocatorScore
      ) {
        return (
          b.scores.allocatorScore -
          a.scores.allocatorScore
        );
      }

      if (
        b.scores.consistencyScore !==
        a.scores.consistencyScore
      ) {
        return (
          b.scores.consistencyScore -
          a.scores.consistencyScore
        );
      }

      if (
        b.scores.riskScore !==
        a.scores.riskScore
      ) {
        return (
          b.scores.riskScore -
          a.scores.riskScore
        );
      }

      return (
        b.performance.roi -
        a.performance.roi
      );
    })
    .slice(0, 24)
    .map(toRanking);
}

export async function getUniverseRankings(): Promise<
  CapitalRanking[]
> {
  const runtimes = await loadRankableRuntimes();

  return runtimes
    .sort((a, b) => {
      const visibilityDifference =
        Number(b.universe.visible) -
        Number(a.universe.visible);

      if (visibilityDifference !== 0) {
        return visibilityDifference;
      }

      const eligibilityDifference =
        Number(b.universe.eligible) -
        Number(a.universe.eligible);

      if (eligibilityDifference !== 0) {
        return eligibilityDifference;
      }

      if (
        b.scores.allocatorScore !==
        a.scores.allocatorScore
      ) {
        return (
          b.scores.allocatorScore -
          a.scores.allocatorScore
        );
      }

      return (
        b.performance.roi -
        a.performance.roi
      );
    })
    .slice(0, 24)
    .map(toRanking);
}
