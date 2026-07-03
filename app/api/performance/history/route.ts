import { NextResponse } from "next/server";

import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const strategyId = url.searchParams.get("strategyId");

  if (!strategyId) {
    return NextResponse.json(
      { ok: false, error: "Missing strategyId", rows: [] },
      { status: 400 }
    );
  }

  const history = await PerformanceRepository.history(strategyId);

  const rows = history
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((snapshot) => {
      const pnl = snapshot.equity - snapshot.deposits + snapshot.withdrawals;
      const roi = snapshot.deposits > 0 ? (pnl / snapshot.deposits) * 100 : 0;

      return {
        timestamp: snapshot.timestamp,
        balance: snapshot.balance,
        equity: snapshot.equity,
        deposits: snapshot.deposits,
        roi,
        profitFactor: snapshot.profitFactor,
        maxDrawdown: snapshot.maxDrawdown,
      };
    });

  return NextResponse.json({
    ok: true,
    strategyId,
    rows,
  });
}
