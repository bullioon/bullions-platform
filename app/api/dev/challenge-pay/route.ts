import { NextResponse } from "next/server";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}


import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";

export async function GET(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);

  const seasonId = url.searchParams.get("season") || "season-01";
  const strategyId = url.searchParams.get("strategy");

  if (!strategyId) {
    return NextResponse.json(
      { ok: false, error: "Missing strategy param" },
      { status: 400 }
    );
  }

  await ChallengeRepository.markPaid(seasonId, strategyId);

  return NextResponse.json({
    ok: true,
    seasonId,
    strategyId,
    paid: true,
  });
}
