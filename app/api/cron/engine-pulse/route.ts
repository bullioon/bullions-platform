import { NextResponse } from "next/server";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FundPerformanceService } from "@/core/v2/services/FundPerformanceService";
import {
  addProfit,
  recordPerformanceSnapshot,
  type BullionsUser,
} from "@/lib/bullionsUser";
import { resolveTier } from "@/lib/tierSystem";
import {
  generateMove,
  resolveEngineState,
  type EngineState,
} from "@/lib/engineBehavior";

const ENGINE_PULSE_MS = 25 * 1000;

const BULLIONS_GLOBAL_CRASH_UNTIL = 0;

// Temporary market pressure: 24h loss cycle, then normal regime resumes.
const TORION_FORCED_LOSS_UNTIL = 1781653769302;


function generateTorionMove({
  profitUsd,
  allocatedUsd,
}: {
  profitUsd: number;
  allocatedUsd: number;
}) {
  const roi = allocatedUsd > 0 ? (profitUsd / allocatedUsd) * 100 : 0;
  const daySeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const cycle = daySeed % 17;
  const roll = Math.random();

  let movePct = 0;
  let state: EngineState = "STABLE";

  if (Date.now() < TORION_FORCED_LOSS_UNTIL) {
    if (roll < 0.60) {
      movePct = -(1.4 + Math.random() * 5.6);
      state = "LOSS_DAY";
    } else if (roll < 0.85) {
      movePct = Math.random() * 1.1 - 0.85;
      state = movePct >= 0 ? "STABLE" : "LOSS_DAY";
    } else {
      movePct = 0.45 + Math.random() * 1.8;
      state = "RECOVERY";
    }

    return { movePct: Number(movePct.toFixed(2)), state };
  }

  if (roi > 900) {
    if (roll < 0.7) {
      movePct = -(3.5 + Math.random() * 10.5);
      state = "BREAKER";
    } else if (roll < 0.9) {
      movePct = -(1.2 + Math.random() * 3.6);
      state = "LOSS_DAY";
    } else {
      movePct = 0.7 + Math.random() * 3.0;
      state = "RECOVERY";
    }

    return { movePct: Number(movePct.toFixed(2)), state };
  }

  if (cycle <= 2) {
    if (roll < 0.68) {
      movePct = 0.5 + Math.random() * 2.4;
      state = "RECOVERY";
    } else {
      movePct = -(0.7 + Math.random() * 2.7);
      state = "LOSS_DAY";
    }
  } else if (cycle <= 7) {
    movePct = Math.random() * 1.9 - 0.95;
    state =
      Math.abs(movePct) < 0.18
        ? "STABLE"
        : movePct > 0
          ? "RECOVERY"
          : "LOSS_DAY";
  } else if (cycle <= 12) {
    if (roll < 0.62) {
      movePct = -(1.4 + Math.random() * 5.4);
      state = "LOSS_DAY";
    } else {
      movePct = 0.45 + Math.random() * 1.7;
      state = "RECOVERY";
    }
  } else if (cycle <= 14) {
    if (roll < 0.82) {
      movePct = -(4.5 + Math.random() * 13.5);
      state = "BREAKER";
    } else {
      movePct = 0.8 + Math.random() * 3.4;
      state = "RECOVERY";
    }
  } else {
    if (roll < 0.62) {
      movePct = 0.9 + Math.random() * 4.6;
      state = "RECOVERY";
    } else {
      movePct = -(0.7 + Math.random() * 3.0);
      state = "LOSS_DAY";
    }
  }

  return { movePct: Number(movePct.toFixed(2)), state };
}

function generateGlobalCrashMove({
  liveWallet,
  depositedUsd,
}: {
  liveWallet: number;
  depositedUsd: number;
}) {
  const roll = Math.random();

  const floorWallet = depositedUsd * 1.25; // stop crash around +25% ROI
  const nearFloor = liveWallet <= floorWallet * 1.18;

  let movePct = 0;
  let state: EngineState = "LOSS_DAY";

  if (nearFloor) {
    // Once near the target, reduce pressure and let normal engine take over soon.
    if (roll < 0.45) {
      movePct = -(0.4 + Math.random() * 1.4);
      state = "LOSS_DAY";
    } else if (roll < 0.75) {
      movePct = Math.random() * 1.2 - 0.6;
      state = "STABLE";
    } else {
      movePct = 0.4 + Math.random() * 1.6;
      state = "RECOVERY";
    }
  } else {
    // Black swan phase: mostly red, with fake bounces.
    if (roll < 0.68) {
      movePct = -(4 + Math.random() * 8); // -4% to -12%
      state = "BREAKER";
    } else if (roll < 0.90) {
      movePct = -(1 + Math.random() * 3); // -1% to -4%
      state = "LOSS_DAY";
    } else {
      movePct = 0.5 + Math.random() * 2.5; // fake bounce
      state = "RECOVERY";
    }
  }

  return {
    movePct: Number(movePct.toFixed(2)),
    state,
  };
}

function generateTierMove({
  tier,
  profitUsd,
  allocatedUsd,
}: {
  tier: "BULLION" | "HELLION" | "TORION";
  profitUsd: number;
  allocatedUsd: number;
}) {
  if (tier === "TORION") {
    return generateTorionMove({ profitUsd, allocatedUsd });
  }

  const roi = allocatedUsd > 0 ? (profitUsd / allocatedUsd) * 100 : 0;
  const isBullion = tier === "BULLION";
  const recoveryMode = isBullion ? roi < -7 : roi < -12;

  const winChance = recoveryMode
    ? isBullion
      ? 0.8
      : 0.7
    : isBullion
      ? 0.65
      : 0.6;

  const positive = Math.random() < winChance;

  let movePct = positive
    ? isBullion
      ? 0.3 + Math.random() * 0.9
      : 0.6 + Math.random() * 1.4
    : isBullion
      ? -(0.2 + Math.random() * 0.5)
      : -(0.4 + Math.random() * 1.1);

  if (isBullion && roi < -15 && movePct < 0) {
    movePct = 0.2 + Math.random() * 0.5;
  }

  if (!isBullion && roi < -25 && movePct < 0) {
    movePct = 0.4 + Math.random() * 0.9;
  }

  return {
    movePct: Number(movePct.toFixed(2)),
    state: recoveryMode ? "RECOVERY" : positive ? "STABLE" : "LOSS_DAY",
  };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "MT5_CRON_SECRET or CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const now = Date.now();
  const usersSnap = await getDocs(collection(db, "users"));

  let processed = 0;
  let skipped = 0;

  for (const userDoc of usersSnap.docs) {
    const user = userDoc.data() as BullionsUser;

    if (!user.systemActive || !user.copiedTraderId) {
      skipped++;
      continue;
    }

    const allocatedUsd = Number(user.allocatedUsd || 0);
    if (allocatedUsd <= 0) {
      skipped++;
      continue;
    }

    // Active multi-manager funds derive equity exclusively from
    // weighted strategy performance. Do not apply legacy random moves.
    if ((user as any).activeFundId) {
      const fundResult = await FundPerformanceService.syncUserFund(userDoc.id);

      if (fundResult.ok) {
        processed++;
      } else {
        skipped++;
        console.warn("Weighted fund sync skipped", {
          userId: userDoc.id,
          error: fundResult.error,
        });
      }

      continue;
    }

    const portfolioUsd =
      Number(user.depositedUsd || 0) + Number(user.profitUsd || 0);

    const tier = resolveTier(portfolioUsd);
    const currentRoi =
      allocatedUsd > 0 ? (Number(user.profitUsd || 0) / allocatedUsd) * 100 : 0;

    const liveWallet =
      Number(user.depositedUsd || 0) + Number(user.profitUsd || 0);

    const depositedUsd = Math.max(1, Number(user.depositedUsd || 0));

    const crashActive =
      Date.now() < BULLIONS_GLOBAL_CRASH_UNTIL &&
      liveWallet > depositedUsd * 1.25;

    const manualRecoveryUsd = Number((user as any).manualRecoveryUsd || 0);
    const manualRecoveryActive = Boolean((user as any).manualRecoveryActive);

    const manualDrawdownActive = Boolean((user as any).manualDrawdownActive);
    const manualDrawdownPctLeft = Number((user as any).manualDrawdownPctLeft || 0);
    const manualDrawdownDailyPct = Number((user as any).manualDrawdownDailyPct || 8);

    const manualDrawdownMovePct =
      manualDrawdownActive && manualDrawdownPctLeft > 0
        ? -Math.min(manualDrawdownPctLeft, manualDrawdownDailyPct / 1440)
        : 0;

    // Active funds are governed exclusively by strategy runtimes.
    // Do not apply the legacy simulated engine movement to them.
    if (
      Boolean((user as any).fundActive) ||
      Boolean((user as any).activeFundId)
    ) {
      const fundSync = await FundPerformanceService.syncUserFund(userDoc.id);

      console.log("[engine-pulse] active fund delegated", {
        userId: userDoc.id,
        activeFundId: (user as any).activeFundId || null,
        ok: fundSync.ok,
      });

      continue;
    }

    const tierMove = manualDrawdownMovePct < 0
      ? {
          movePct: Number(manualDrawdownMovePct.toFixed(4)),
          state: "LOSS_DAY" as EngineState,
        }
      : manualRecoveryActive && manualRecoveryUsd > 0
        ? {
            movePct: Number(((Math.min(250, manualRecoveryUsd) / allocatedUsd) * 100).toFixed(2)),
            state: "RECOVERY" as EngineState,
          }
        : crashActive
        ? generateGlobalCrashMove({
            liveWallet,
            depositedUsd,
          })
        : generateTierMove({
            tier,
            profitUsd: Number(user.profitUsd || 0),
            allocatedUsd,
          });

    const nextState =
      (tierMove?.state as EngineState | undefined) ||
      resolveEngineState(currentRoi);

    const movePct = tierMove?.movePct ?? generateMove(nextState);

    const currentFundEquity = Math.max(
      0,
      Number((user as any).fundEquityUsd ?? allocatedUsd + Number(user.profitUsd || 0))
    );

    const nextMove = currentFundEquity * (movePct / 100);
    const nextFundEquityUsd = Math.max(0, currentFundEquity + nextMove);
    const nextFundPnlUsd = nextFundEquityUsd - allocatedUsd;
    const nextProfitUsd = Number(user.profitUsd || 0) + nextMove;

    console.log({
  user: user.username,
  allocatedUsd,
  movePct,
  nextMove,
  profitUsd: user.profitUsd,
  crashActive,
});

    await addProfit(userDoc.id, nextMove);

    await updateDoc(doc(db, "users", userDoc.id), {
      fundEquityUsd: Number(nextFundEquityUsd.toFixed(2)),
      fundPnlUsd: Number(nextFundPnlUsd.toFixed(2)),
      updatedAt: Date.now(),
    });

    if (manualDrawdownMovePct < 0) {
      const remainingDrawdown = Math.max(
        0,
        manualDrawdownPctLeft - Math.abs(manualDrawdownMovePct)
      );

      await updateDoc(doc(db, "users", userDoc.id), {
        manualDrawdownPctLeft: Number(remainingDrawdown.toFixed(4)),
        manualDrawdownActive: remainingDrawdown > 0,
        updatedAt: Date.now(),
      });
    }

    await recordPerformanceSnapshot({
      userId: userDoc.id,
      depositedUsd: Number(user.depositedUsd || 0),
      profitUsd: nextProfitUsd,
    });

    processed++;
  }

  return NextResponse.json({
    ok: true,
    processed,
    skipped,
    checked: usersSnap.size,
  });
}
