import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  canWithdrawToday,
  maxWithdrawalPct,
  resolveTier,
} from "@/lib/tierSystem";

export async function createWithdrawalRequest({
  userId,
  depositedUsd,
  profitUsd,
  allocatedUsd,
}: {
  userId: string;
  depositedUsd: number;
  profitUsd: number;
  allocatedUsd: number;
}) {
  const tier = resolveTier(depositedUsd);

  if (!canWithdrawToday()) {
    return {
      ok: false,
      reason: "locked",
      tier,
    };
  }

  const availableUsd = Math.max(
    0,
    depositedUsd + profitUsd - allocatedUsd
  );

  const maxAmountUsd = Number(
    (availableUsd * maxWithdrawalPct(tier)).toFixed(2)
  );

  if (maxAmountUsd <= 0) {
    return {
      ok: false,
      reason: "empty",
      tier,
    };
  }

  await addDoc(collection(db, "withdrawals"), {
    userId,
    tier,
    status: "pending",
    availableUsd,
    maxAmountUsd,
    requestedAmountUsd: maxAmountUsd,
    createdAt: serverTimestamp(),
  });

  return {
    ok: true,
    tier,
    maxAmountUsd,
  };
}
