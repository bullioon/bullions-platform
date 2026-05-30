import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  pulseWeeklyLeaderboard,
  ensureWeeklyLeaderboard,
  getWeekId,
} from "@/lib/challengeLeaderboard";


function resolvePair(trader: any) {
  const value = `${trader?.pair || ""} ${trader?.tag || ""} ${trader?.name || ""} ${trader?.id || ""}`.toUpperCase();

  if (value.includes("BULLIONS BOT")) return "BTC/USD";
  if (value.includes("BTC")) return "BTC/USD";
  if (value.includes("PHANTOM") || value.includes("SOL")) return "SOL/USD";
  if (value.includes("NOVA") || value.includes("ETH")) return "ETH/USD";
  if (value.includes("GHOST")) return "BTC/USD";
  if (value.includes("MARIA") || value.includes("EUR")) return "EUR/USD";
  if (value.includes("MIA") || value.includes("US30")) return "US30";
  if (value.includes("ALEX") || value.includes("NAS")) return "NAS100";
  if (value.includes("IVAN") || value.includes("DIEGO") || value.includes("XAU") || value.includes("GOLD")) return "XAU/USD";

  return "XAU/USD";
}

export async function GET() {
  const weekId = await ensureWeeklyLeaderboard();
  await pulseWeeklyLeaderboard();

  const lbRef = collection(db, "weeklyChallenges", getWeekId(), "leaderboard");
  const snap = await getDocs(lbRef);

  return NextResponse.json({
    ok: true,
    weekId,
    count: snap.size,
    traders: snap.docs.map((d) => {
      const trader = d.data();
      return {
        ...trader,
        pair: resolvePair(trader),
      };
    }),
  });
}
