import { NextResponse } from "next/server";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}

import { PerformanceScheduler } from "@/core/v2/services/PerformanceScheduler";

export async function GET(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }


  const scheduler = new PerformanceScheduler();

  const result = await scheduler.run();

  return NextResponse.json({
    ok: true,
    ...result,
  });

}
