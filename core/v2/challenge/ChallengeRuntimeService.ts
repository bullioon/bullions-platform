import { getAdminDb } from "@/lib/firebaseAdmin";

type RawDoc = Record<string, any>;

export const ChallengeRuntimeService = {
  async syncActiveSeason() {
    const db = getAdminDb();

    const seasonSnap = await db
      .collection("challengeSeasons")
      .where("status", "in", ["registration", "active"])
      .limit(1)
      .get();

    const seasonDoc = seasonSnap.docs[0];

    if (!seasonDoc) {
      return {
        ok: true,
        seasonId: null,
        checked: 0,
        ranked: 0,
        message: "No active challenge season",
      };
    }

    const seasonId = seasonDoc.id;

    const entriesSnap = await db
      .collection("challengeEntries")
      .where("seasonId", "==", seasonId)
      .get();

    const entriesWithScores = await Promise.all(
      entriesSnap.docs.map(async (entryDoc) => {
        const entry = entryDoc.data() as RawDoc;
        const strategyId = String(entry.strategyId || "");

        if (!strategyId) {
          return {
            ref: entryDoc.ref,
            entry,
            strategyId,
            score: 0,
          };
        }

        const runtimeSnap = await db
          .collection("strategyRuntimes")
          .doc(strategyId)
          .get();

        const runtime = runtimeSnap.exists
          ? (runtimeSnap.data() as RawDoc)
          : {};

        const score = Number(runtime?.scores?.challengeScore || 0);

        return {
          ref: entryDoc.ref,
          entry,
          strategyId,
          score: Number.isFinite(score) ? score : 0,
        };
      })
    );

    const eligible = entriesWithScores
      .filter(
        ({ entry }) =>
          entry.paid === true &&
          entry.disqualified !== true
      )
      .sort((a, b) => b.score - a.score);

    const positions = new Map<string, number>();

    eligible.forEach((row, index) => {
      positions.set(row.strategyId, index + 1);
    });

    const batch = db.batch();
    const now = Date.now();

    for (const row of entriesWithScores) {
      const rank = positions.get(row.strategyId) ?? null;
      const eligibleForTopFive =
        rank !== null &&
        rank <= 5 &&
        row.entry.paid === true &&
        row.entry.disqualified !== true;

      batch.set(
        row.ref,
        {
          score: row.score,
          rank,
          eligibleForTopFive,
          updatedAt: now,
        },
        { merge: true }
      );

      if (row.strategyId) {
        const strategyRef = db
          .collection("managerStrategies")
          .doc(row.strategyId);

        batch.set(
          strategyRef,
          {
            challenge: {
              status: row.entry.paid === true ? "enrolled" : "pending_payment",
              challengeId: seasonId,
              rank,
              eligibleForLeaderboard:
                row.entry.paid === true &&
                row.entry.disqualified !== true,
              eligibleForTopFive,
              score: row.score,
            },
            updatedAt: now,
            updatedAtMs: now,
          },
          { merge: true }
        );
      }
    }

    await batch.commit();

    return {
      ok: true,
      seasonId,
      checked: entriesWithScores.length,
      ranked: eligible.length,
      topFive: eligible.slice(0, 5).map((row, index) => ({
        position: index + 1,
        strategyId: row.strategyId,
        score: row.score,
      })),
    };
  },
};
