import { NextResponse } from "next/server";

import { PerformanceSyncService } from "@/core/v2/services/PerformanceSyncService";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);

  const strategyId = searchParams.get("strategy");

  if (!strategyId) {
    return NextResponse.json(
      { error: "strategy query param required" },
      { status: 400 }
    );
  }

  const service = new PerformanceSyncService();

  const result = await service.sync(strategyId);

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
