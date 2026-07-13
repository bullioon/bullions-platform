import { getAdminDb } from "@/lib/firebaseAdmin";
import { RuntimeRepository } from "./RuntimeRepository";
import type { RuntimeGrade } from "./types";
import type {
  ManagerRuntime,
  ManagerRuntimeStrategy,
} from "./ManagerRuntime";

type RawDoc = Record<string, any>;

function numberValue(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function average(values: number[]) {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function managerGrade(
  allocatorScore: number,
  riskScore: number
): RuntimeGrade {
  if (riskScore < 35) return "high_risk";
  if (allocatorScore >= 82) return "elite";
  if (allocatorScore >= 68) return "strong";
  if (allocatorScore >= 50) return "stable";
  return "watchlist";
}

export class ManagerRuntimeRepository {
  static async getManagerRuntime(
    managerUid: string
  ): Promise<ManagerRuntime | null> {
    const db = getAdminDb();

    const managerSnap = await db
      .collection("managers")
      .doc(managerUid)
      .get();

    if (!managerSnap.exists) {
      return null;
    }

    const manager = managerSnap.data() as RawDoc;

    const strategySnap = await db
      .collection("managerStrategies")
      .where("manager.uid", "==", managerUid)
      .get();

    const rows = await Promise.all(
      strategySnap.docs.map(async (strategyDoc) => {
        const strategy = strategyDoc.data() as RawDoc;

        const runtime =
          await RuntimeRepository.getStrategyRuntime(
            strategyDoc.id
          );

        if (!runtime) return null;

        const capitalFollowing = numberValue(
          strategy.performance?.capitalFollowing ??
            strategy.capitalFollowing
        );

        const allocators = numberValue(
          strategy.performance?.allocators ??
            strategy.allocators
        );

        return {
          runtime,
          capitalFollowing,
          allocators,
          verified: Boolean(
            strategy.status?.verified ??
              strategy.verified
          ),
        };
      })
    );

    const validRows = rows.filter(Boolean) as Array<{
      runtime: NonNullable<
        Awaited<
          ReturnType<
            typeof RuntimeRepository.getStrategyRuntime
          >
        >
      >;
      capitalFollowing: number;
      allocators: number;
      verified: boolean;
    }>;

    const strategies: ManagerRuntimeStrategy[] =
      validRows.map((row) => ({
        strategyId: row.runtime.strategyId,
        name: row.runtime.name,
        allocatorScore:
          row.runtime.scores.allocatorScore,
        roi: row.runtime.performance.roi,
        grade: row.runtime.universe.grade,
        mt5Status: row.runtime.mt5.status,
        capitalFollowing: row.capitalFollowing,
        allocators: row.allocators,
      }));

    const allocatorScore = average(
      validRows.map(
        (row) => row.runtime.scores.allocatorScore
      )
    );

    const consistencyScore = average(
      validRows.map(
        (row) => row.runtime.scores.consistencyScore
      )
    );

    const riskScore = average(
      validRows.map(
        (row) => row.runtime.scores.riskScore
      )
    );

    const averageRoi = average(
      validRows.map(
        (row) => row.runtime.performance.roi
      )
    );

    const grade = managerGrade(
      allocatorScore,
      riskScore
    );

    const bestStrategy =
      [...strategies].sort(
        (a, b) =>
          b.allocatorScore - a.allocatorScore
      )[0] ?? null;

    return {
      managerUid,

      identity: {
        username: stringValue(
          manager.identity?.username
        ),
        displayName: stringValue(
          manager.identity?.displayName,
          "Unknown Manager"
        ),
        tagline: stringValue(
          manager.identity?.tagline
        ),
        avatarUrl: stringValue(
          manager.identity?.avatarUrl
        ),
        bannerUrl: stringValue(
          manager.identity?.bannerUrl
        ),
      },

      stats: {
        strategies: validRows.length,
        verifiedStrategies: validRows.filter(
          (row) => row.verified
        ).length,
        liveStrategies: validRows.filter(
          (row) => row.runtime.mt5.status === "live"
        ).length,
        totalCapital: round(
          validRows.reduce(
            (sum, row) =>
              sum + row.capitalFollowing,
            0
          )
        ),
        totalAllocators: validRows.reduce(
          (sum, row) => sum + row.allocators,
          0
        ),
        averageRoi: round(averageRoi),
      },

      scores: {
        allocatorScore: round(allocatorScore),
        consistencyScore: round(
          consistencyScore
        ),
        riskScore: round(riskScore),
      },

      universe: {
        grade,
        eligible:
          validRows.length > 0 &&
          allocatorScore >= 50 &&
          riskScore >= 35,
        visible:
          manager.status === "LIVE" ||
          manager.status === "VERIFIED",
      },

      bestStrategy,
      strategies,
      updatedAt: Date.now(),
    };
  }

  static async persistManagerRuntime(
    runtime: ManagerRuntime
  ) {
    const db = getAdminDb();

    await db
      .collection("managerRuntimes")
      .doc(runtime.managerUid)
      .set(runtime, { merge: true });
  }

  static async syncManagerRuntime(
    managerUid: string
  ) {
    const runtime =
      await this.getManagerRuntime(managerUid);

    if (!runtime) return null;

    await this.persistManagerRuntime(runtime);

    return runtime;
  }
}
