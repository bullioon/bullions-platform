import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAdminAuth } from "@/lib/firebaseAdminAuth";

function maxManagersForTier(tier: string) {
  if (tier === "TORION") return 3;
  if (tier === "HELLION") return 2;
  return 1;
}

function aliasesForTrader(traderId: string) {
  const managerAliases: Record<string, string[]> = {
    ghost_alpha: ["ghost_alpha", "local-manager"],
    "local-manager": ["local-manager", "ghost_alpha"],
  };

  return managerAliases[traderId] || [traderId];
}

async function findStrategyIdsForTrader(traderId: string) {
  const ids = new Set<string>();

  for (const managerUid of aliasesForTrader(traderId)) {
    const snap = await getDocs(
      query(
        collection(db, "managerStrategies"),
        where("manager.uid", "==", managerUid)
      )
    );

    snap.docs.forEach((docSnap) => ids.add(docSnap.id));
  }

  return Array.from(ids);
}

async function applyStrategyCapital(input: {
  strategyId: string;
  capitalDelta: number;
  allocatorDelta: number;
}) {
  await runTransaction(db, async (tx) => {
    const strategyRef = doc(db, "managerStrategies", input.strategyId);
    const strategySnap = await tx.get(strategyRef);
    const data = strategySnap.data() as any;

    const currentCapital = Number(
      data?.performance?.capitalFollowing ?? data?.capitalFollowing ?? 0
    );

    const currentAllocators = Number(
      data?.performance?.allocators ?? data?.allocators ?? 0
    );

    const nextCapital = Math.max(0, currentCapital + input.capitalDelta);
    const nextAllocators = Math.max(0, currentAllocators + input.allocatorDelta);

    tx.update(strategyRef, {
      "performance.capitalFollowing": nextCapital,
      "performance.allocators": nextAllocators,
      capitalFollowing: nextCapital,
      allocators: nextAllocators,
      updatedAt: Date.now(),
      updatedAtMs: Date.now(),
    });
  });
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing auth token" }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken);

    const body = await req.json();

    const userId = String(body.userId || "").trim();

    if (decodedToken.uid !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const tier = String(body.tier || "BULLION").trim();
    const capitalUsd = Number(body.capitalUsd || 0);
    const managers = Array.isArray(body.managers) ? body.managers : [];

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    if (capitalUsd <= 0) {
      return NextResponse.json({ ok: false, error: "Capital must be greater than zero" }, { status: 400 });
    }

    const maxManagers = maxManagersForTier(tier);

    if (managers.length < 1 || managers.length > maxManagers) {
      return NextResponse.json(
        { ok: false, error: `${tier} allows up to ${maxManagers} manager(s)` },
        { status: 400 }
      );
    }

    const totalPct = managers.reduce(
      (sum: number, manager: any) => sum + Number(manager.allocationPct || 0),
      0
    );

    if (Math.round(totalPct) !== 100) {
      return NextResponse.json(
        { ok: false, error: "Fund allocation must equal 100%" },
        { status: 400 }
      );
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const user = userSnap.data() as any;
    const depositedUsd = Number(user.depositedUsd || 0);
    const profitUsd = Number(user.profitUsd || 0);
    const allocatedUsd = Number(user.allocatedUsd || 0);
    const availableUsd = Math.max(0, depositedUsd + profitUsd - allocatedUsd);

    if (capitalUsd > availableUsd) {
      return NextResponse.json(
        {
          ok: false,
          error: `Insufficient available capital. Available: $${availableUsd.toFixed(2)}`,
          availableUsd,
        },
        { status: 400 }
      );
    }

    const fundId = `${userId}_active`;
    const fundRef = doc(db, "funds", fundId);
    const previousFundSnap = await getDoc(fundRef);
    const previousFund = previousFundSnap.exists() ? (previousFundSnap.data() as any) : null;

    if (previousFund?.status === "ACTIVE" && Array.isArray(previousFund.strategyAllocations)) {
      for (const allocation of previousFund.strategyAllocations) {
        await applyStrategyCapital({
          strategyId: allocation.strategyId,
          capitalDelta: -Math.abs(Number(allocation.capitalUsd || 0)),
          allocatorDelta: -1,
        });
      }
    }

    const strategyAllocations = [];

    for (const manager of managers) {
      const traderId = String(manager.traderId || "");
      const allocationPct = Number(manager.allocationPct || 0);
      const managerCapital = Number(((capitalUsd * allocationPct) / 100).toFixed(2));
      const strategyIds = await findStrategyIdsForTrader(traderId);

      for (const strategyId of strategyIds) {
        await applyStrategyCapital({
          strategyId,
          capitalDelta: managerCapital,
          allocatorDelta: 1,
        });

        strategyAllocations.push({
          traderId,
          strategyId,
          allocationPct,
          capitalUsd: managerCapital,
        });
      }
    }

    const fund = {
      id: fundId,
      userId,
      tier,
      managers,
      strategyAllocations,
      capitalUsd,
      status: "ACTIVE",
      createdAt: previousFund?.createdAt || serverTimestamp(),
      updatedAt: Date.now(),
    };

    await setDoc(fundRef, fund, { merge: true });

    await updateDoc(userRef, {
      activeFundId: fundId,
      fundActive: true,
      copiedTraderId: managers[0]?.traderId || null,
      systemActive: true,
      allocatedUsd: capitalUsd,
      fundEquityUsd: capitalUsd,
      fundPnlUsd: 0,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      ok: true,
      message: "Fund activated",
      fundId,
      fund,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Fund activation failed" },
      { status: 500 }
    );
  }
}
