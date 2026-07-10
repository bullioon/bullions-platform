import { NextResponse } from "next/server";
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

function requireSyncSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}

import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";
import { evaluatePerformance } from "@/core/v2/performance/PerformanceEngine";
import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";
import { FundPerformanceService } from "@/core/v2/services/FundPerformanceService";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function score({
  roi,
  maxDrawdown,
  winRate,
  profitFactor,
}: {
  roi: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
}) {
  const roiScore = clamp(roi * 4, 0, 40);
  const riskScore = clamp(25 - maxDrawdown * 2.5, 0, 25);
  const winScore = clamp(winRate * 0.15, 0, 15);
  const pfScore = clamp(profitFactor * 8, 0, 20);
  return Number((roiScore + riskScore + winScore + pfScore).toFixed(1));
}

export async function POST(req: Request) {
  if (!requireSyncSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const traderId = String(body.traderId || "").trim();
    if (!traderId) {
      return NextResponse.json({ ok: false, error: "Missing traderId" }, { status: 400 });
    }

    const traderRef = doc(db, "traders", traderId);
    const traderSnap = await getDoc(traderRef);

    if (!traderSnap.exists()) {
      return NextResponse.json({ ok: false, error: "Trader not found" }, { status: 404 });
    }

    const trader = traderSnap.data();

    const initialBalance = Number(body.initialBalance || trader.initialBalance || 10000);
    const balance = Number(body.balance || trader.balance || initialBalance);
    const equity = Number(body.equity || trader.equity || balance);
    const maxDrawdown = Number(body.maxDrawdown ?? trader.maxDrawdown ?? 0);
    const winRate = Number(body.winRate ?? trader.winRate ?? 0);
    const profitFactor = Number(body.profitFactor ?? trader.profitFactor ?? 0);

    const roi = initialBalance > 0 ? ((equity - initialBalance) / initialBalance) * 100 : 0;
    const bullionsScore = score({ roi, maxDrawdown, winRate, profitFactor });

    const update = {
      ...trader,
      initialBalance,
      balance,
      equity,
      roi: Number(roi.toFixed(2)),
      maxDrawdown,
      winRate,
      profitFactor,
      bullionsScore,
      pair: body.pair || trader.pair || "XAU/USD",
      style: body.style || trader.style || "Verified challenger",
      specialty: body.specialty || trader.specialty || "Balanced Trader",
      riskProfile: body.riskProfile || trader.riskProfile || "MEDIUM",
      skills: body.skills || trader.skills || {
        entries: 75,
        exits: 65,
        riskControl: 70,
        consistency: 70,
        recovery: 70,
        discipline: 70,
      },
      mt5: {
        ...(trader.mt5 || {}),
        connected: true,
        accountLogin: body.accountLogin || trader.mt5?.accountLogin || null,
        server: body.server || trader.mt5?.server || null,
        lastSyncAt: Date.now(),
      },
      updatedAt: Date.now(),
    };

    await setDoc(traderRef, update, { merge: true });
    await setDoc(doc(db, "leaderboardV2", traderId), update, { merge: true });

    const managerAliases: Record<string, string[]> = {
      ghost_alpha: ["ghost_alpha", "local-manager"],
      "local-manager": ["local-manager", "ghost_alpha"],
    };

    const strategyDocs = [];

    for (const managerUid of managerAliases[traderId] || [traderId]) {
      const strategiesSnap = await getDocs(
        query(
          collection(db, "managerStrategies"),
          where("manager.uid", "==", managerUid)
        )
      );

      strategyDocs.push(...strategiesSnap.docs);
    }

    for (const strategyDoc of strategyDocs) {
      const performanceSnapshot = {
        strategyId: strategyDoc.id,
        timestamp: Date.now(),
        balance,
        equity,
        deposits: initialBalance,
        withdrawals: 0,
        closedPnL: equity - initialBalance,
        floatingPnL: 0,
        trades: Number(body.trades || 50),
        wins: Number(body.wins || Math.round((Number(body.trades || 50) * winRate) / 100)),
        losses: Number(body.losses || Math.max(0, Number(body.trades || 50) - Math.round((Number(body.trades || 50) * winRate) / 100))),
        profitFactor,
        maxDrawdown,
      };

      const evaluation = evaluatePerformance(performanceSnapshot);

      await PerformanceRepository.saveSnapshot(performanceSnapshot);

      await updateDoc(
        doc(db, "managerStrategies", strategyDoc.id),
        {
          "performance.roi": evaluation.roi,
          "performance.winRate": evaluation.winRate,
          "performance.profitFactor": profitFactor,
          "performance.maxDrawdown": maxDrawdown,
          roi: evaluation.roi,
          winRate: evaluation.winRate,
          profitFactor,
          maxDrawdown,
          updatedAt: Date.now(),
          updatedAtMs: Date.now(),
        }
      );

      const season = await ChallengeRepository.getActiveSeason();

      if (season) {
        await ChallengeRepository.updateEntryScore(
          season.id,
          strategyDoc.id,
          evaluation.challengeScore
        );
      }

      await FundPerformanceService.syncFundsByStrategy(strategyDoc.id);
    }

    await addDoc(collection(db, "traderSnapshots"), {
      traderId,
      initialBalance,
      balance,
      equity,
      roi: update.roi,
      maxDrawdown,
      winRate,
      profitFactor,
      bullionsScore,
      accountLogin: body.accountLogin || null,
      server: body.server || null,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      ok: true,
      message: "Trader synced",
      traderId,
      roi: update.roi,
      bullionsScore,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Trader sync failed" },
      { status: 500 }
    );
  }
}
