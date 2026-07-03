import { NextResponse } from "next/server";

import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";

export async function GET(req: Request) {
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
