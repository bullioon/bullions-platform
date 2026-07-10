import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebaseAdmin";
import { evaluatePerformance } from "@/core/v2/performance/PerformanceEngine";
import { RuntimeRepository } from "@/core/v2/runtime/RuntimeRepository";
import { FundPerformanceService } from "@/core/v2/services/FundPerformanceService";
import { ChallengeRuntimeService } from "@/core/v2/challenge/ChallengeRuntimeService";

type RawBody = Record<string, unknown>;

function requireBridgeSecret(req: Request) {
  const authHeader = req.headers.get("authorization");

  const expectedSecret =
    process.env.MT5_BRIDGE_SECRET ||
    process.env.MT5_CRON_SECRET ||
    process.env.CRON_SECRET;

  return Boolean(
    expectedSecret &&
      authHeader === `Bearer ${expectedSecret}`
  );
}

function finiteNumber(
  value: unknown,
  fallback?: number
): number {
  const parsed = Number(value);

  if (Number.isFinite(parsed)) {
    return parsed;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error("Invalid numeric field");
}

function requiredString(
  value: unknown,
  field: string
): string {
  const parsed = String(value || "").trim();

  if (!parsed) {
    throw new Error(`Missing ${field}`);
  }

  return parsed;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function POST(req: Request) {
  if (!requireBridgeSecret(req)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as RawBody;

    const login = requiredString(
      body.login ?? body.accountLogin,
      "login"
    );

    const server = requiredString(
      body.server,
      "server"
    );

    const balance = finiteNumber(body.balance);
    const equity = finiteNumber(body.equity, balance);

    const initialBalance = finiteNumber(
      body.initialBalance ??
        body.deposits ??
        body.accountSize,
      0
    );

    if (initialBalance <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "initialBalance must be greater than zero",
        },
        { status: 400 }
      );
    }

    const deposits = finiteNumber(
      body.deposits,
      initialBalance
    );

    const withdrawals = finiteNumber(
      body.withdrawals,
      0
    );

    const closedPnL = finiteNumber(
      body.closedPnL,
      balance - deposits + withdrawals
    );

    const floatingPnL = finiteNumber(
      body.floatingPnL,
      equity - balance
    );

    const trades = Math.max(
      0,
      Math.floor(
        finiteNumber(
          body.trades ??
            body.totalTrades ??
            body.closedTrades,
          0
        )
      )
    );

    const wins = Math.max(
      0,
      Math.floor(
        finiteNumber(body.wins, 0)
      )
    );

    const losses = Math.max(
      0,
      Math.floor(
        finiteNumber(
          body.losses,
          Math.max(0, trades - wins)
        )
      )
    );

    const openTrades = Math.max(
      0,
      Math.floor(
        finiteNumber(body.openTrades, 0)
      )
    );

    const maxDrawdown = clamp(
      finiteNumber(
        body.maxDrawdown ??
          body.drawdown,
        0
      ),
      0,
      100
    );

    const profitFactor = Math.max(
      0,
      finiteNumber(body.profitFactor, 0)
    );

    const suppliedTimestamp = finiteNumber(
      body.timestamp ??
        body.syncedAt,
      Date.now()
    );

    const syncedAt =
      suppliedTimestamp > 0
        ? Math.floor(suppliedTimestamp)
        : Date.now();

    const db = getAdminDb();

    /*
     * Resolve the assigned account using login + server.
     * The bridge cannot select an arbitrary strategyId.
     */
    const accountSnap = await db
      .collection("mt5Accounts")
      .where("login", "==", login)
      .where("server", "==", server)
      .limit(1)
      .get();

    const accountDoc = accountSnap.docs[0];

    if (!accountDoc) {
      return NextResponse.json(
        {
          ok: false,
          error: "MT5 account is not registered",
        },
        { status: 404 }
      );
    }

    const account =
      accountDoc.data() as Record<string, any>;

    if (
      account.status !== "ASSIGNED" &&
      account.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: `MT5 account is ${account.status || "unavailable"}`,
        },
        { status: 409 }
      );
    }

    const strategyId = String(
      account.strategyId || ""
    ).trim();

    const managerUid = String(
      account.managerUid || ""
    ).trim();

    const challengeEntryId = String(
      account.challengeEntryId || ""
    ).trim();

    if (!strategyId) {
      return NextResponse.json(
        {
          ok: false,
          error: "MT5 account is not assigned to a strategy",
        },
        { status: 409 }
      );
    }

    const strategyRef = db
      .collection("managerStrategies")
      .doc(strategyId);

    const strategySnap = await strategyRef.get();

    if (!strategySnap.exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "Assigned strategy does not exist",
        },
        { status: 404 }
      );
    }

    const strategy =
      strategySnap.data() as Record<string, any>;

    const performanceSnapshot = {
      strategyId,
      timestamp: syncedAt,

      balance,
      equity,

      deposits,
      withdrawals,

      closedPnL,
      floatingPnL,

      trades,
      wins,
      losses,

      profitFactor,
      maxDrawdown,
    };

    const evaluation =
      evaluatePerformance(performanceSnapshot);

    const winRate =
      trades > 0
        ? (wins / trades) * 100
        : finiteNumber(
            body.winRate,
            Number(
              strategy?.performance?.winRate || 0
            )
          );

    const snapshot = {
      strategyId,
      managerUid: managerUid || null,

      source: "mt5-bridge",
      accountId: accountDoc.id,
      accountLogin: login,
      server,
      broker: String(
        account.broker || body.broker || ""
      ),

      initialBalance,
      deposits,
      withdrawals,

      balance,
      equity,

      closedPnL,
      floatingPnL,

      roi: Number(
        evaluation.roi.toFixed(4)
      ),

      dailyReturnPct: finiteNumber(
        body.dailyReturnPct,
        0
      ),

      maxDrawdown: Number(
        maxDrawdown.toFixed(4)
      ),

      winRate: Number(
        winRate.toFixed(4)
      ),

      profitFactor: Number(
        profitFactor.toFixed(4)
      ),

      totalTrades: trades,
      wins,
      losses,
      openTrades,

      syncedAt,
      receivedAt: Date.now(),
      createdAt: FieldValue.serverTimestamp(),
    };

    /*
     * New canonical runtime history.
     */
    const runtimePointRef = db
      .collection("strategyPerformanceSnapshots")
      .doc(strategyId)
      .collection("points")
      .doc();

    /*
     * Legacy collection retained temporarily because some
     * older services still read PerformanceRepository.
     */
    const legacyPointRef = db
      .collection("performanceSnapshots")
      .doc();

    const batch = db.batch();

    batch.set(runtimePointRef, snapshot);

    batch.set(
      legacyPointRef,
      performanceSnapshot
    );

    batch.set(
      accountDoc.ref,
      {
        status: "ACTIVE",
        activatedAt:
          account.activatedAt || syncedAt,
        lastSyncAt: syncedAt,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    batch.set(
      strategyRef,
      {
        mt5: {
          ...(strategy.mt5 || {}),

          enabled: true,
          connected: true,

          source: "mt5-bridge",
          provider:
            strategy?.mt5?.provider ||
            String(account.broker || "mt5"),

          accountId: accountDoc.id,
          accountLogin: login,
          server,
          broker: String(
            account.broker || body.broker || ""
          ),

          accountStatus: "ACTIVE",

          initialBalance,
          balance,
          equity,

          activatedAt:
            account.activatedAt || syncedAt,

          lastSyncAt: syncedAt,
          lastSyncedAt: syncedAt,
        },

        performance: {
          ...(strategy.performance || {}),

          initialBalance,
          balance,
          equity,

          roi: snapshot.roi,
          winRate: snapshot.winRate,
          profitFactor: snapshot.profitFactor,
          maxDrawdown: snapshot.maxDrawdown,

          totalTrades: trades,
          openTrades,

          dailyReturnPct:
            snapshot.dailyReturnPct,

          lastSyncedAt: syncedAt,
        },

        updatedAt: Date.now(),
        updatedAtMs: Date.now(),
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
          mt5AccountId: accountDoc.id,
          mt5AssignmentStatus: "active",
          eligibleForLeaderboard: true,
          lastSyncAt: syncedAt,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    if (managerUid) {
      const traderRef = db
        .collection("traders")
        .doc(managerUid);

      const traderSnap = await traderRef.get();

      if (traderSnap.exists) {
        batch.set(
          traderRef,
          {
            status: "ACTIVE",
            verified: true,

            mt5: {
              accountId: accountDoc.id,
              accountLogin: login,
              server,
              broker: String(
                account.broker ||
                  body.broker ||
                  ""
              ),

              connected: true,
              assignmentStatus: "ACTIVE",

              activatedAt:
                account.activatedAt ||
                syncedAt,

              lastSyncAt: syncedAt,
            },

            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }
    }

    await batch.commit();

    /*
     * Everything below consumes the freshly persisted snapshot.
     */
    const runtime =
      await RuntimeRepository.syncStrategyRuntime(
        strategyId
      );

    const fundSync =
      await FundPerformanceService.syncFundsByStrategy(
        strategyId
      );

    const challengeSync =
      await ChallengeRuntimeService.syncActiveSeason();

    return NextResponse.json({
      ok: true,

      source: "mt5-bridge",

      account: {
        id: accountDoc.id,
        login,
        server,
        status: "ACTIVE",
      },

      strategy: {
        strategyId,
        managerUid: managerUid || null,

        roi: snapshot.roi,
        balance: snapshot.balance,
        equity: snapshot.equity,

        runtimeGrade:
          runtime?.universe.grade || null,

        allocatorScore:
          runtime?.scores.allocatorScore ||
          null,

        challengeScore:
          runtime?.scores.challengeScore ||
          null,
      },

      funds: {
        affected: fundSync.affected,
        synced: fundSync.synced,
      },

      challenge: {
        seasonId:
          challengeSync.seasonId,
        checked:
          challengeSync.checked,
        ranked:
          challengeSync.ranked,
      },

      syncedAt,
    });
  } catch (error) {
    console.error("[mt5-snapshot]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "MT5 snapshot failed",
      },
      { status: 500 }
    );
  }
}
