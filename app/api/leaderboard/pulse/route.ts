import { NextResponse } from "next/server";
import {
  pulseWeeklyLeaderboard,
  ensureWeeklyLeaderboard,
} from "@/lib/challengeLeaderboard";

export async function GET() {
  await ensureWeeklyLeaderboard();
  await pulseWeeklyLeaderboard();

  return NextResponse.json({ ok: true });
}
