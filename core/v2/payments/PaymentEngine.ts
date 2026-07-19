import { getAdminDb } from "@/lib/firebaseAdmin";

import { MT5AssignmentService } from "@/core/v2/services/MT5AssignmentService";
import { verifySolanaUsdcPayment } from "./SolanaUsdcVerifier";

type ChallengeTierId =
  | "demo_50k"
  | "demo_200k";

export class PaymentEngine {
  static async verifyChallengePayment(input: {
    userId: string;
    challengeEntryId: string;
    signature: string;
  }) {
    const db = getAdminDb();

    const entryRef = db
      .collection("challengeEntries")
      .doc(input.challengeEntryId);

    const entrySnap = await entryRef.get();

    if (!entrySnap.exists) {
      throw new Error(
        "Challenge entry not found"
      );
    }

    const entry =
      entrySnap.data() as Record<string, any>;

    if (
      String(entry.managerUid || "") !==
      input.userId
    ) {
      throw new Error(
        "You do not own this Challenge entry"
      );
    }

    const strategyId = String(
      entry.strategyId || ""
    ).trim();

    const seasonId = String(
      entry.seasonId || ""
    ).trim();

    const tierId =
      entry.tierId as ChallengeTierId;

    const amountUsdc = Number(
      entry.entryFeeUsd || 0
    );

    if (
      !strategyId ||
      !seasonId ||
      (tierId !== "demo_50k" &&
        tierId !== "demo_200k") ||
      amountUsdc <= 0
    ) {
      throw new Error(
        "Challenge entry is incomplete"
      );
    }

    /*
     * Idempotency:
     * If payment and MT5 assignment already completed,
     * return the existing account instead of charging
     * or assigning twice.
     */
    if (
      entry.paid === true &&
      entry.mt5AccountId
    ) {
      const accountSnap = await db
        .collection("mt5Accounts")
        .doc(String(entry.mt5AccountId))
        .get();

      const account =
        accountSnap.exists
          ? accountSnap.data()
          : null;

      return {
        alreadyConfirmed: true,
        challengeEntryId:
          input.challengeEntryId,
        strategyId,
        payment: {
          status: "confirmed",
          signature:
            entry.paymentReference || null,
          amountUsdc,
        },
        mt5: account
          ? {
              accountId: accountSnap.id,
              accountLogin:
                String(account.login || ""),
              server:
                String(account.server || ""),
              broker:
                String(account.broker || ""),
              status:
                String(
                  account.status || "ASSIGNED"
                ),
            }
          : null,
      };
    }

    const verified =
      await verifySolanaUsdcPayment({
        signature: input.signature,
        expectedAmountUsdc: amountUsdc,
      });

    const paymentRef = db
      .collection("payments")
      .doc(verified.signature);

    /*
     * Reserve the Solana signature atomically.
     * A signature can never pay two entries.
     */
    await db.runTransaction(async (tx) => {
      const existingPayment =
        await tx.get(paymentRef);

      if (existingPayment.exists) {
        const existing =
          existingPayment.data() as Record<
            string,
            any
          >;

        if (
          existing.challengeEntryId !==
          input.challengeEntryId
        ) {
          throw new Error(
            "Transaction signature was already used"
          );
        }

        return;
      }

      const now = Date.now();

      tx.create(paymentRef, {
        id: verified.signature,

        type: "challenge",
        provider: "phantom",
        network: "solana",
        currency: "USDC",

        userId: input.userId,
        challengeEntryId:
          input.challengeEntryId,
        referenceId:
          input.challengeEntryId,
        strategyId,
        seasonId,
        tierId,

        amountUsd: amountUsdc,
        amountCrypto: amountUsdc,

        senderWallet:
          verified.senderWallet,
        recipientWallet:
          verified.recipientWallet,
        recipientTokenAccount:
          verified.recipientTokenAccount,

        signature:
          verified.signature,
        slot: verified.slot,
        blockTime:
          verified.blockTime,

        status: "verified",

        createdAt: now,
        verifiedAt: now,
        updatedAt: now,
      });

      tx.set(
        entryRef,
        {
          paymentStatus: "verified",
          paymentReference:
            verified.signature,
          paymentVerifiedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
    });

    /*
     * The service is idempotent. It returns the same
     * account if the entry already has one.
     */
    const assigned =
      await MT5AssignmentService.assignNextAccount({
        managerUid: input.userId,
        strategyId,
        challengeEntryId:
          input.challengeEntryId,
        seasonId,
        tierId,
      });

    const now = Date.now();

    const batch = db.batch();

    batch.set(
      paymentRef,
      {
        status: "confirmed",
        confirmedAt: now,
        updatedAt: now,

        fulfillment: {
          type: "mt5_assignment",
          accountId:
            assigned.accountId,
          status: "completed",
        },
      },
      { merge: true }
    );

    batch.set(
      entryRef,
      {
        paid: true,
        paymentStatus: "confirmed",
        paymentReference:
          verified.signature,
        paymentConfirmedAt: now,

        mt5AccountId:
          assigned.accountId,
        mt5AssignmentStatus:
          "assigned",

        updatedAt: now,
      },
      { merge: true }
    );

    const traderRef = db
      .collection("traders")
      .doc(input.userId);

    const traderSnap =
      await traderRef.get();

    if (traderSnap.exists) {
      batch.set(
        traderRef,
        {
          status: "ACTIVE",
          verified: true,
          seasonId,

          mt5: {
            connected: false,
            accountId:
              assigned.accountId,
            accountLogin:
              assigned.login,
            server:
              assigned.server,
            broker:
              assigned.broker,
            assignmentStatus:
              "ASSIGNED",
            assignedAt: now,
            lastSyncAt: null,
          },

          challengeActivatedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    const strategyRef = db
      .collection("managerStrategies")
      .doc(strategyId);

    /*
     * The strategy becomes published only after the
     * Phantom USDC payment is verified and MT5 is assigned.
     */
    batch.update(strategyRef, {
      "status.state": "published",
      "status.visibility": "private",
      updatedAt: now,
      updatedAtMs: now,
    });

    await batch.commit();

    return {
      alreadyConfirmed: false,

      challengeEntryId:
        input.challengeEntryId,
      strategyId,
      seasonId,

      payment: {
        status: "confirmed",
        signature:
          verified.signature,
        amountUsdc,
        senderWallet:
          verified.senderWallet,
      },

      mt5: {
        accountId:
          assigned.accountId,
        accountLogin:
          assigned.login,
        server:
          assigned.server,
        broker:
          assigned.broker,
        status:
          assigned.status,
      },
    };
  }
}
