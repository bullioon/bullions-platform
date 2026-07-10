import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { RuntimeRepository } from "@/core/v2/runtime";
import { FundPerformanceService } from "@/core/v2/services/FundPerformanceService";

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function requireCronSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron");

  return Boolean(
    expectedSecret &&
      (authHeader === `Bearer ${expectedSecret}` || isVercelCron)
  );
}

type StrategyDoc = {
  identity?: { name?: string };
  manager?: { uid?: string };
  status?: { state?: string };
  challenge?: { status?: string };
  investment?: { riskProfile?: string };
  mt5?: Record<string, unknown> & {
    enabled?: boolean;
    initialBalance?: number;
    equity?: number;
    balance?: number;
    accountId?: string | null;
    accountLogin?: string | null;
    server?: string;
    provider?: string;
    broker?: string;
    accountStatus?: string;
    connected?: boolean;
  };
  performance?: Record<string, unknown> & {
    initialBalance?: number;
    equity?: number;
    balance?: number;
    roi?: number;
    maxDrawdown?: number;
    winRate?: number;
    profitFactor?: number;
    totalTrades?: number;
  };
};

async function activateAssignedMT5Account(input: {
  strategyId: string;
  managerUid: string | null;
  accountId: string | null;
  accountLogin: string | null;
  server: string;
  broker: string;
  syncedAt: number;
}) {
  if (!input.accountId) {
    return {
      activated: false,
      reason: "Strategy has no MT5 accountId",
    };
  }

  const db = getAdminDb();

  const accountRef = db
    .collection("mt5Accounts")
    .doc(input.accountId);

  const accountSnap = await accountRef.get();

  if (!accountSnap.exists) {
    return {
      activated: false,
      reason: "MT5 account not found",
    };
  }

  const account = accountSnap.data() as Record<string, any>;
  const challengeEntryId = String(
    account.challengeEntryId || ""
  );

  const batch = db.batch();

  batch.set(
    accountRef,
    {
      status: "ACTIVE",
      activatedAt:
        account.activatedAt || input.syncedAt,
      lastSyncAt: input.syncedAt,
      updatedAt: input.syncedAt,
    },
    { merge: true }
  );

  const strategyRef = db
    .collection("managerStrategies")
    .doc(input.strategyId);

  batch.set(
    strategyRef,
    {
      mt5: {
        accountId: input.accountId,
        accountLogin: input.accountLogin,
        server: input.server,
        broker: input.broker,
        connected: true,
        enabled: true,
        accountStatus: "ACTIVE",
        activatedAt:
          account.activatedAt || input.syncedAt,
        lastSyncAt: input.syncedAt,
        lastSyncedAt: input.syncedAt,
      },
      updatedAt: input.syncedAt,
      updatedAtMs: input.syncedAt,
    },
    { merge: true }
  );

  if (challengeEntryId) {
    const entryRef = db
      .collection("challengeEntries")
      .doc(challengeEntryId);

    batch.set(
      entryRef,
      {
        mt5AccountId: input.accountId,
        mt5AssignmentStatus: "active",
        eligibleForLeaderboard: true,
        activatedAt: input.syncedAt,
        updatedAt: input.syncedAt,
      },
      { merge: true }
    );
  }

  if (input.managerUid) {
    const traderRef = db
      .collection("traders")
      .doc(input.managerUid);

    const traderSnap = await traderRef.get();

    if (traderSnap.exists) {
      batch.set(
        traderRef,
        {
          status: "ACTIVE",
          verified: true,
          mt5: {
            accountId: input.accountId,
            accountLogin: input.accountLogin,
            server: input.server,
            broker: input.broker,
            connected: true,
            assignmentStatus: "ACTIVE",
            activatedAt:
              account.activatedAt || input.syncedAt,
            lastSyncAt: input.syncedAt,
          },
          updatedAt: input.syncedAt,
        },
        { merge: true }
      );
    }
  }

  await batch.commit();

  return {
    activated: true,
    accountId: input.accountId,
    challengeEntryId:
      challengeEntryId || null,
  };
}

function buildSixAssessment(input: {
  roi: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
}) {
  if (input.roi > 5 && input.maxDrawdown < 6 && input.profitFactor >= 1.6) {
    return "Execution discipline remains strong. Risk-adjusted returns are currently outperforming the active strategy universe.";
  }

  if (input.maxDrawdown > 10) {
    return "Performance shows elevated drawdown. SIX is monitoring whether recent returns justify the current risk profile.";
  }

  if (input.roi < 0) {
    return "The strategy is currently under pressure. SIX is watching recovery behavior, drawdown control, and execution consistency.";
  }

  return "Performance remains stable. SIX sees no major risk anomaly, but continued consistency is required before stronger conviction.";
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        error: "MT5 simulator is disabled in production",
      },
      { status: 403 }
    );
  }

  if (!requireCronSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const snap = await db.collection("managerStrategies").get();

  let synced = 0;
  const results: any[] = [];

  for (const strategyDoc of snap.docs) {
    const strategy = strategyDoc.data() as StrategyDoc;

    const state = strategy?.status?.state;
    const challengeStatus = strategy?.challenge?.status;
    const mt5Enabled = strategy?.mt5?.enabled === true;

    const shouldSync =
      mt5Enabled ||
      state === "published" ||
      challengeStatus === "enrolled" ||
      challengeStatus === "qualified" ||
      challengeStatus === "top_5" ||
      challengeStatus === "winner";

    if (!shouldSync) continue;

    const initialBalance = Number(
      strategy?.mt5?.initialBalance ||
        strategy?.performance?.initialBalance ||
        100000
    );

    const previousEquity = Number(
      strategy?.mt5?.equity ||
        strategy?.performance?.equity ||
        initialBalance
    );

    const riskProfile = strategy?.investment?.riskProfile || "Moderate";

    const volatility =
      riskProfile === "Conservative"
        ? 0.35
        : riskProfile === "Aggressive"
          ? 1.15
          : 0.7;

    const currentRoi = Number(strategy?.performance?.roi || 0);
    const drift = currentRoi >= 5 ? 0.12 : currentRoi >= 0 ? 0.06 : 0.02;

    const movePct = randomBetween(-volatility, volatility + drift);
    const equity = Math.max(initialBalance * 0.7, previousEquity * (1 + movePct / 100));
    const balance = equity;

    const roi = initialBalance > 0 ? ((equity - initialBalance) / initialBalance) * 100 : 0;

    const maxDrawdown = Number(
      clamp(
        Number(strategy?.performance?.maxDrawdown || 3) + randomBetween(-0.18, 0.28),
        0.5,
        18
      ).toFixed(2)
    );

    const winRate = Number(
      clamp(
        Number(strategy?.performance?.winRate || 61) + randomBetween(-0.5, 0.7),
        35,
        88
      ).toFixed(1)
    );

    const profitFactor = Number(
      clamp(
        Number(strategy?.performance?.profitFactor || 1.45) + randomBetween(-0.04, 0.06),
        0.7,
        4.5
      ).toFixed(2)
    );

    const totalTrades = Number(strategy?.performance?.totalTrades || 0) + Math.floor(randomBetween(1, 4));

    const snapshot = {
      strategyId: strategyDoc.id,
      managerUid: strategy?.manager?.uid || null,
      source: "demo-mt5-simulator",
      accountId: strategy?.mt5?.accountId || null,
      accountLogin: strategy?.mt5?.accountLogin || null,
      server: strategy?.mt5?.server || "OctaFX-Demo",
      broker: strategy?.mt5?.broker || "OctaFX",
      initialBalance,
      balance: Number(balance.toFixed(2)),
      equity: Number(equity.toFixed(2)),
      roi: Number(roi.toFixed(2)),
      dailyReturnPct: Number(movePct.toFixed(3)),
      maxDrawdown,
      winRate,
      profitFactor,
      totalTrades,
      openTrades: Math.floor(randomBetween(0, 3)),
      syncedAt: Date.now(),
      createdAt: FieldValue.serverTimestamp(),
    };

    const sixAssessment = buildSixAssessment({
      roi: snapshot.roi,
      maxDrawdown,
      winRate,
      profitFactor,
    });

    await db
      .collection("strategyPerformanceSnapshots")
      .doc(strategyDoc.id)
      .collection("points")
      .add(snapshot);

    await strategyDoc.ref.set(
      {
        mt5: {
            ...(strategy.mt5 || {}),
          enabled: true,
          provider: strategy?.mt5?.provider || "octafx-demo",
          source: "demo-mt5-simulator",
          initialBalance,
          balance: snapshot.balance,
          equity: snapshot.equity,
          server: snapshot.server,
          accountId: snapshot.accountId,
          accountLogin: snapshot.accountLogin,
          broker: snapshot.broker,
          connected: Boolean(snapshot.accountId),
          accountStatus: snapshot.accountId
            ? "ACTIVE"
            : strategy?.mt5?.accountStatus || "UNASSIGNED",
          lastSyncAt: snapshot.syncedAt,
          lastSyncedAt: snapshot.syncedAt,
        },
        performance: {
          ...(strategy.performance || {}),
          initialBalance,
          balance: snapshot.balance,
          equity: snapshot.equity,
          roi: snapshot.roi,
          winRate: snapshot.winRate,
          profitFactor: snapshot.profitFactor,
          maxDrawdown: snapshot.maxDrawdown,
          totalTrades: snapshot.totalTrades,
        },
        six: {
          assessment: sixAssessment,
          updatedAt: Date.now(),
        },
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    const mt5Activation =
      await activateAssignedMT5Account({
        strategyId: strategyDoc.id,
        managerUid: strategy?.manager?.uid || null,
        accountId: snapshot.accountId,
        accountLogin: snapshot.accountLogin,
        server: snapshot.server,
        broker: snapshot.broker,
        syncedAt: snapshot.syncedAt,
      });

    const runtime =
      await RuntimeRepository.syncStrategyRuntime(
        strategyDoc.id
      );

    const fundSync = await FundPerformanceService.syncFundsByStrategy(
      strategyDoc.id
    );

    synced++;

    results.push({
      strategyId: strategyDoc.id,
      strategyName: strategy?.identity?.name || "Unknown Strategy",
      roi: snapshot.roi,
      equity: snapshot.equity,
      source: snapshot.source,
      mt5AccountId: snapshot.accountId,
      mt5Activated: mt5Activation.activated,
      mt5ActivationReason:
        "reason" in mt5Activation
          ? mt5Activation.reason
          : null,
      runtimeGrade: runtime?.universe.grade || null,
      allocatorScore: runtime?.scores.allocatorScore || null,
      affectedFunds: fundSync.affected,
      syncedFunds: fundSync.synced,
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "strategy-mt5-sync",
    checked: snap.size,
    synced,
    results,
  });
}
