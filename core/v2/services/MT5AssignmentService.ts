import { getAdminDb } from "@/lib/firebaseAdmin";

type AssignmentInput = {
  managerUid: string;
  strategyId: string;
  challengeEntryId: string;
  seasonId: string;
  tierId: "demo_50k" | "demo_200k";
};

export type AssignedMT5Account = {
  accountId: string;
  login: string;
  server: string;
  broker: string;
  status: "ASSIGNED";
};

export class MT5AssignmentService {
  static async assignNextAccount(
    input: AssignmentInput
  ): Promise<AssignedMT5Account> {
    const db = getAdminDb();

    return db.runTransaction(async (tx) => {
      const entryRef = db
        .collection("challengeEntries")
        .doc(input.challengeEntryId);

      const entrySnap = await tx.get(entryRef);

      if (!entrySnap.exists) {
        throw new Error("Challenge entry not found");
      }

      const entry = entrySnap.data() as Record<string, any>;

      /*
       * Idempotency:
       * If this entry already has an account, return it instead
       * of assigning a second one.
       */
      if (entry.mt5AccountId) {
        const existingAccountRef = db
          .collection("mt5Accounts")
          .doc(String(entry.mt5AccountId));

        const existingAccountSnap =
          await tx.get(existingAccountRef);

        if (!existingAccountSnap.exists) {
          throw new Error(
            "Challenge entry references a missing MT5 account"
          );
        }

        const account =
          existingAccountSnap.data() as Record<string, any>;

        return {
          accountId: existingAccountSnap.id,
          login: String(account.login || ""),
          server: String(account.server || ""),
          broker: String(account.broker || ""),
          status: "ASSIGNED" as const,
        };
      }

      /*
       * Account size is matched to the purchased challenge tier.
       */
      const accountSize =
        input.tierId === "demo_200k" ? 200000 : 50000;

      const freeAccountsQuery = db
        .collection("mt5Accounts")
        .where("status", "==", "FREE")
        .where("accountSize", "==", accountSize)
        .limit(1);

      const freeAccountsSnap =
        await tx.get(freeAccountsQuery);

      const accountDoc = freeAccountsSnap.docs[0];

      if (!accountDoc) {
        throw new Error(
          `No free ${accountSize.toLocaleString()} MT5 demo accounts available`
        );
      }

      const account =
        accountDoc.data() as Record<string, any>;

      const now = Date.now();

      tx.set(
        accountDoc.ref,
        {
          status: "ASSIGNED",
          managerUid: input.managerUid,
          strategyId: input.strategyId,
          challengeEntryId: input.challengeEntryId,
          seasonId: input.seasonId,
          assignedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      tx.set(
        entryRef,
        {
          mt5AccountId: accountDoc.id,
          mt5AssignmentStatus: "assigned",
          eligibleForLeaderboard: true,
          assignedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      const strategyRef = db
        .collection("managerStrategies")
        .doc(input.strategyId);

      tx.set(
        strategyRef,
        {
          mt5: {
            connected: false,
            accountId: accountDoc.id,
            accountLogin: String(account.login || ""),
            server: String(account.server || ""),
            broker: String(account.broker || ""),
            accountStatus: "ASSIGNED",
            assignedAt: now,
            lastSyncAt: null,
          },

          challenge: {
            status: "enrolled",
            challengeId: input.seasonId,
            tierId: input.tierId,
            eligibleForLeaderboard: true,
            eligibleForTopFive: false,
            rank: null,
          },

          updatedAt: now,
          updatedAtMs: now,
        },
        { merge: true }
      );

      return {
        accountId: accountDoc.id,
        login: String(account.login || ""),
        server: String(account.server || ""),
        broker: String(account.broker || ""),
        status: "ASSIGNED" as const,
      };
    });
  }
}
