import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "MT5_CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const snap = await getDocs(collection(db, "traders"));

  let synced = 0;
  const results: any[] = [];

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  for (const traderDoc of snap.docs) {
    const trader = traderDoc.data() as any;

    if (trader.status !== "ACTIVE") continue;

    const initialBalance = Number(trader.initialBalance || 100000);
    const currentEquity = Number(trader.equity || initialBalance);

    const volatility =
      trader.riskProfile === "LOW"
        ? 0.45
        : trader.riskProfile === "HIGH"
          ? 1.25
          : 0.75;

    const drift = trader.bullionsScore >= 80 ? 0.18 : trader.bullionsScore >= 60 ? 0.08 : 0.02;
    const movePct = randomBetween(-volatility, volatility + drift);

    const nextEquity = Math.max(
      initialBalance * 0.72,
      currentEquity * (1 + movePct / 100)
    );

    const roi = initialBalance > 0 ? ((nextEquity - initialBalance) / initialBalance) * 100 : 0;

    const payload = {
      traderId: traderDoc.id,
      initialBalance,
      balance: Number(nextEquity.toFixed(2)),
      equity: Number(nextEquity.toFixed(2)),
      maxDrawdown: Number(clamp(Number(trader.maxDrawdown || 3) + randomBetween(-0.25, 0.35), 1.2, 12).toFixed(2)),
      winRate: Number(clamp(Number(trader.winRate || 64) + randomBetween(-0.6, 0.8), 48, 82).toFixed(1)),
      profitFactor: Number(clamp(Number(trader.profitFactor || 1.8) + randomBetween(-0.05, 0.08), 1.05, 3.6).toFixed(2)),
      trades: Number(trader.trades || 50) + Math.floor(randomBetween(1, 4)),
      accountLogin: trader.mt5?.accountLogin || null,
      server: trader.mt5?.server || "Bullions-Demo",
      pair: trader.pair || "XAU/USD",
      style: trader.style || "Verified MT5 challenger",
    };

    const res = await fetch(`${origin}/api/traders/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    results.push({
      traderId: traderDoc.id,
      roi: Number(roi.toFixed(2)),
      ok: Boolean(data?.ok),
      response: data,
    });

    synced++;
  }

  return NextResponse.json({
    ok: true,
    mode: "demo-mt5-simulator",
    synced,
    checked: snap.size,
    results,
  });
}
