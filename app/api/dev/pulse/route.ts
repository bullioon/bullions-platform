import { NextResponse } from "next/server";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}


import { PerformanceSyncService } from "@/core/v2/services/PerformanceSyncService";

export async function GET(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }


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
