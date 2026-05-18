import { NextResponse } from "next/server";
import {
  pulseWeeklyLeaderboard,
  ensureWeeklyLeaderboard,
} from "@/lib/challengeLeaderboard";

let lastRun = 0;

export async function GET() {
  const now = Date.now();

  lastRun = now;

  await ensureWeeklyLeaderboard();
  await pulseWeeklyLeaderboard();

  return NextResponse.json({
    ok: true,
    updated: true,
  });
}
