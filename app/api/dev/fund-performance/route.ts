import { NextResponse } from "next/server";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}

import { FundPerformanceService } from "@/core/v2/services/FundPerformanceService";

export async function POST(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const result = await FundPerformanceService.syncUserFund(userId);

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Fund performance sync failed",
      },
      { status: 500 }
    );
  }
}
