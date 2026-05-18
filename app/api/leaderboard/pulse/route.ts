import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  pulseWeeklyLeaderboard,
  ensureWeeklyLeaderboard,
  getWeekId,
} from "@/lib/challengeLeaderboard";

export async function GET() {
  const weekId = await ensureWeeklyLeaderboard();
  await pulseWeeklyLeaderboard();

  const lbRef = collection(db, "weeklyChallenges", getWeekId(), "leaderboard");
  const snap = await getDocs(lbRef);

  return NextResponse.json({
    ok: true,
    weekId,
    count: snap.size,
    traders: snap.docs.map((d) => d.data()),
  });
}
