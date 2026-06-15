import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

const ENGINE_PULSE_MS = 60 * 1000;

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
      movePct = -(0.8 + Math.random() * 3.7);
      state = "LOSS_DAY";
    } else if (roll < 0.85) {
      movePct = Math.random() * 0.7 - 0.55;
      state = movePct >= 0 ? "STABLE" : "LOSS_DAY";
    } else {
      movePct = 0.25 + Math.random() * 1.2;
      state = "RECOVERY";
    }

    return { movePct: Number(movePct.toFixed(2)), state };
  }

  if (roi > 900) {
    if (roll < 0.7) {
      movePct = -(2.5 + Math.random() * 7.5);
      state = "BREAKER";
    } else if (roll < 0.9) {
      movePct = -(0.8 + Math.random() * 2.4);
      state = "LOSS_DAY";
    } else {
      movePct = 0.4 + Math.random() * 2.0;
      state = "RECOVERY";
    }

    return { movePct: Number(movePct.toFixed(2)), state };
  }

  if (cycle <= 2) {
    if (roll < 0.68) {
      movePct = 0.3 + Math.random() * 1.7;
      state = "RECOVERY";
    } else {
      movePct = -(0.4 + Math.random() * 1.8);
      state = "LOSS_DAY";
    }
  } else if (cycle <= 7) {
    movePct = Math.random() * 1.2 - 0.65;
    state =
      Math.abs(movePct) < 0.18
        ? "STABLE"
        : movePct > 0
          ? "RECOVERY"
          : "LOSS_DAY";
  } else if (cycle <= 12) {
    if (roll < 0.62) {
      movePct = -(0.9 + Math.random() * 3.6);
      state = "LOSS_DAY";
    } else {
      movePct = 0.25 + Math.random() * 1.1;
      state = "RECOVERY";
    }
  } else if (cycle <= 14) {
    if (roll < 0.82) {
      movePct = -(3.0 + Math.random() * 9.0);
      state = "BREAKER";
    } else {
      movePct = 0.5 + Math.random() * 2.2;
      state = "RECOVERY";
    }
  } else {
    if (roll < 0.62) {
      movePct = 0.6 + Math.random() * 3.2;
      state = "RECOVERY";
    } else {
      movePct = -(0.4 + Math.random() * 2.0);
      state = "LOSS_DAY";
    }
  }

  return { movePct: Number(movePct.toFixed(2)), state };
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

export async function GET() {
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

    const last = Number(user.lastEngineUpdate || user.updatedAt || 0);
    if (last && now - last < ENGINE_PULSE_MS) {
      skipped++;
      continue;
    }

    const portfolioUsd =
      Number(user.depositedUsd || 0) + Number(user.profitUsd || 0);

    const tier = resolveTier(portfolioUsd);
    const currentRoi =
      allocatedUsd > 0 ? (Number(user.profitUsd || 0) / allocatedUsd) * 100 : 0;

    const tierMove = generateTierMove({
      tier,
      profitUsd: Number(user.profitUsd || 0),
      allocatedUsd,
    });

    const nextState =
      (tierMove?.state as EngineState | undefined) ||
      resolveEngineState(currentRoi);

    const movePct = tierMove?.movePct ?? generateMove(nextState);
    const nextMove = allocatedUsd * (movePct / 100);
    const nextProfitUsd = Number(user.profitUsd || 0) + nextMove;

    await addProfit(userDoc.id, nextMove);

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
