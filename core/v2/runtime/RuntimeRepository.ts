import { getAdminDb } from "@/lib/firebaseAdmin";
import { buildStrategyRuntime } from "./RuntimeEngine";
import type { StrategyRuntime } from "./types";

type RawDoc = Record<string, unknown>;

export class RuntimeRepository {
  static async getStrategyRuntime(strategyId: string): Promise<StrategyRuntime | null> {
    const db = getAdminDb();

    const strategySnap = await db.collection("managerStrategies").doc(strategyId).get();

    if (!strategySnap.exists) {
      return null;
    }

    const latestSnapshotSnap = await db
      .collection("strategyPerformanceSnapshots")
      .doc(strategyId)
      .collection("points")
      .orderBy("syncedAt", "desc")
      .limit(1)
      .get();

    const latestSnapshot = latestSnapshotSnap.docs[0]?.data() as RawDoc | undefined;

    return buildStrategyRuntime({
      strategyId,
      strategy: strategySnap.data() as RawDoc,
      latestSnapshot: latestSnapshot || null,
    });
  }

  static async persistStrategyRuntime(runtime: StrategyRuntime): Promise<void> {
    const db = getAdminDb();

    await db.collection("strategyRuntimes").doc(runtime.strategyId).set(runtime, {
      merge: true,
    });
  }

  static async syncStrategyRuntime(strategyId: string): Promise<StrategyRuntime | null> {
    const runtime = await RuntimeRepository.getStrategyRuntime(strategyId);

    if (!runtime) return null;

    await RuntimeRepository.persistStrategyRuntime(runtime);

    return runtime;
  }
}
