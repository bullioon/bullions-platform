import { NextResponse } from "next/server";

import { evaluatePerformance } from "@/core/v2/performance/PerformanceEngine";
import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";
import { EventBus } from "@/core/v2/events/EventBus";
import type { PerformanceSnapshot } from "@/types/v2/domain/performance";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const snapshot: PerformanceSnapshot = {
      strategyId: String(body.strategyId),
      timestamp: Number(body.timestamp || Date.now()),
      balance: Number(body.balance || 0),
      equity: Number(body.equity || 0),
      deposits: Number(body.deposits || 0),
      withdrawals: Number(body.withdrawals || 0),
      closedPnL: Number(body.closedPnL || 0),
      floatingPnL: Number(body.floatingPnL || 0),
      trades: Number(body.trades || 0),
      wins: Number(body.wins || 0),
      losses: Number(body.losses || 0),
      profitFactor: Number(body.profitFactor || 0),
      maxDrawdown: Number(body.maxDrawdown || 0),
    };

    const evaluation = evaluatePerformance(snapshot);

    await PerformanceRepository.saveSnapshot(snapshot);

    await StrategyRepository.updatePerformance(snapshot.strategyId, {
      roi: evaluation.roi,
      winRate: evaluation.winRate,
      profitFactor: snapshot.profitFactor,
      maxDrawdown: snapshot.maxDrawdown,
    });

    await EventBus.emit("performance.updated",{
      strategyId: snapshot.strategyId
    });

    const season = await ChallengeRepository.getActiveSeason();

    if (season) {
      await ChallengeRepository.updateEntryScore(
        season.id,
        snapshot.strategyId,
        evaluation.challengeScore
      );

      await EventBus.emit("challenge.score.updated",{
        strategyId: snapshot.strategyId,
        score: evaluation.challengeScore
      });
    }

    return NextResponse.json({
      ok: true,
      snapshot,
      evaluation,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: false, error: "Could not save performance snapshot." },
      { status: 500 }
    );
  }
}
