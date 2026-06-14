import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type DailyPerformance = {
  date: string;
  depositedUsd: number;
  profitUsd: number;
  tier?: "NOVATO" | "HELLION" | "TORION";
  withdrawalLockedUntil?: number;
  maxAllocationPct?: number;
  liveWallet: number;
  pnlPct: number;
};

export type BullionsUser = {
  name: string;
  username: string;
  email: string;
  emoji: string;
  depositedUsd: number;
  profitUsd: number;
  tier?: "NOVATO" | "HELLION" | "TORION";
  withdrawalLockedUntil?: number;
  maxAllocationPct?: number;
  copiedTraderId: string | null;
  systemActive: boolean;
  dailyPerformance?: DailyPerformance[];
  allocatedUsd: number;
  maxLossUsd: number;
  updatedAt?: number;
  lastEngineUpdate?: number;
  avatarEmoji?: string;
  referredBy?: string | null;
  referralRewardPaid?: boolean;
  pendingWithdrawal?: {
    amountUsd: number;
    feePct?: number;
    feeUsd?: number;
    netUsd?: number;
    wallet: string;
    status: "pending" | "released";
    requestedAt: number;
    weekKey: string;
  };
  uranioPosition?: {
    active?: boolean;
    status?: "pending_deposit" | "active" | "completed";
    signalId?: string;
    collateral?: number;
    maxLoss?: number;
    maxProfit?: number;
    startedAt?: number;
    endsAt?: number;
    activatedAt?: number;
    depositTxHash?: string;
    result?: "WIN" | "LOSS";
    payout?: number;
    resolvedAt?: number;
    seen?: boolean;
  };
};

function last7Days(depositedUsd: number, profitUsd: number): DailyPerformance[] {
  const today = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - index));

    const progress = index / 6;
    const dayProfit = profitUsd * progress;

    return {
      date: d.toISOString().slice(0, 10),
      depositedUsd,
      profitUsd: dayProfit,
      liveWallet: depositedUsd + dayProfit,
      pnlPct: depositedUsd > 0 ? (dayProfit / depositedUsd) * 100 : 0,
    };
  });
}

export async function ensureBullionsUser(userId: string, email: string, referralCode?: string | null) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  const cleanReferralCode = referralCode?.trim().toLowerCase() || null;

  if (!snap.exists()) {
    await setDoc(ref, {
      name: email.split("@")[0] || "Bullions User",
      username: email.split("@")[0] || "user",
      email,
      referredBy: cleanReferralCode,
      emoji: "💀",
      depositedUsd: 0,
      profitUsd: 0,
      allocatedUsd: 0,
      maxLossUsd: 10,
      copiedTraderId: null,
      systemActive: false,
      dailyPerformance: last7Days(0, 0),
    });
    return;
  }

  await setDoc(
    ref,
    {
      name: snap.data().name || email.split("@")[0] || "Bullions User",
      username: snap.data().username || email.split("@")[0] || "user",
      email,
      referredBy: snap.data().referredBy || cleanReferralCode || null,
      referralCapturedAt: snap.data().referredBy
        ? snap.data().referralCapturedAt || null
        : cleanReferralCode
        ? Date.now()
        : snap.data().referralCapturedAt || null,
      emoji: snap.data().emoji || "💀",
    },
    { merge: true }
  );
}

export function subscribeBullionsUser(
  userId: string,
  cb: (user: BullionsUser | null) => void
) {
  return onSnapshot(doc(db, "users", userId), (snap) => {
    cb(snap.exists() ? (snap.data() as BullionsUser) : null);
  });
}

export async function registerCryptoDeposit({
  userId,
  network,
  amountUsd,
  amountCrypto,
  txHash,
}: {
  userId: string;
  network: "BTC" | "SOL";
  amountUsd: number;
  amountCrypto: number;
  txHash?: string;
}) {
  if (!txHash) throw new Error("Missing transaction hash");

  const txRef = doc(db, "processed_transactions", txHash);
const txSnap = await getDoc(txRef);

if (txSnap.exists()) {
  throw new Error("Transaction already used");
}

  const depositRef = doc(db, "users", userId, "deposits", txHash);
  const existing = await getDoc(depositRef);

  if (existing.exists()) {
    throw new Error("Deposit already registered");
  }

  await setDoc(depositRef, {
    network,
    amountUsd,
    amountCrypto,
    txHash,
    status: "confirmed",
    createdAt: serverTimestamp(),
  });

  await setDoc(txRef, {
  userId,
  network,
  amountUsd,
  amountCrypto,
  txHash,
  createdAt: serverTimestamp(),
});


  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as BullionsUser | undefined;

  await updateDoc(userRef, {
    depositedUsd: increment(amountUsd),
  });

  const shouldPayReferralReward =
    amountUsd >= 200 &&
    Boolean(userData?.referredBy) &&
    userData?.referralRewardPaid !== true;

  if (shouldPayReferralReward && userData?.referredBy) {
    const referrerQuery = query(
      collection(db, "users"),
      where("username", "==", userData.referredBy)
    );

    const referrerSnap = await getDocs(referrerQuery);
    const referrerDoc = referrerSnap.docs[0];

    if (referrerDoc && referrerDoc.id !== userId) {
      await updateDoc(userRef, {
        depositedUsd: increment(100),
        referralRewardPaid: true,
        referralRewardPaidAt: Date.now(),
        referralRewardAmount: 100,
      });

      await updateDoc(referrerDoc.ref, {
        depositedUsd: increment(100),
        referralRewardsUsd: increment(100),
        updatedAt: Date.now(),
      });

      await addDoc(collection(db, "referral_rewards"), {
        referredUserId: userId,
        referrerUserId: referrerDoc.id,
        referralCode: userData.referredBy,
        amountUsd: 100,
        depositTxHash: txHash,
        status: "paid",
        createdAt: serverTimestamp(),
      });
    }
  }
}


export async function requestWithdrawal({
  userId,
  amountUsd,
  wallet,
  weekKey,
}: {
  userId: string;
  amountUsd: number;
  wallet: string;
  weekKey: string;
}) {
  const amount = Math.abs(amountUsd);
  const feePct = 30;
  const feeUsd = Number((amount * (feePct / 100)).toFixed(2));
  const netUsd = Number((amount - feeUsd).toFixed(2));

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as BullionsUser | undefined;

  const currentDeposited = Number(userData?.depositedUsd || 0);
  const currentProfit = Number(userData?.profitUsd || 0);

  const profitDeduction = Math.min(currentProfit, amount);
  const depositedDeduction = Math.max(0, amount - profitDeduction);

  await addDoc(collection(db, "withdrawals"), {
    userId,
    amountUsd: amount,
    feePct,
    feeUsd,
    netUsd,
    wallet,
    balanceDeduction: {
      fromProfitUsd: profitDeduction,
      fromDepositedUsd: depositedDeduction,
    },
    status: "pending",
    weekKey,
    createdAt: serverTimestamp(),
  });

  await updateDoc(userRef, {
    profitUsd: increment(-profitDeduction),
    depositedUsd: increment(-depositedDeduction),
    systemActive: false,
    allocatedUsd: 0,
    copiedTraderId: null,
    pendingWithdrawal: {
      amountUsd: amount,
      feePct,
      feeUsd,
      netUsd,
      wallet,
      status: "pending",
      requestedAt: Date.now(),
      weekKey,
    },
  });
}

export async function withdrawUsd(userId: string, amountUsd: number) {
  await requestWithdrawal({
    userId,
    amountUsd,
    wallet: "legacy",
    weekKey: new Date().toISOString().slice(0, 10),
  });
}

export async function cancelWithdrawal({
  userId,
  amountUsd,
}: {
  userId: string;
  amountUsd: number;
}) {
  const amount = Math.abs(amountUsd);

  await updateDoc(doc(db, "users", userId), {
    depositedUsd: increment(amount),
    pendingWithdrawal: deleteField(),
    updatedAt: Date.now(),
  });

  await addDoc(collection(db, "withdrawal_events"), {
    userId,
    amountUsd: amount,
    type: "cancelled",
    createdAt: serverTimestamp(),
  });
}

export async function addProfit(userId: string, amountUsd: number) {
  await updateDoc(doc(db, "users", userId), {
    profitUsd: increment(amountUsd),
    updatedAt: Date.now(),
    lastEngineUpdate: Date.now(),
  });
}


export async function recordPerformanceSnapshot({
  userId,
  depositedUsd,
  profitUsd,
}: {
  userId: string;
  depositedUsd: number;
  profitUsd: number;
}) {
  const now = new Date();
  const point: DailyPerformance = {
    date: now.toISOString(),
    depositedUsd,
    profitUsd,
    liveWallet: depositedUsd + profitUsd,
    pnlPct: depositedUsd > 0 ? (profitUsd / depositedUsd) * 100 : 0,
  };

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  const user = snap.data() as BullionsUser | undefined;

  const current = user?.dailyPerformance || [];
  const next = [...current, point].slice(-120);

  await updateDoc(ref, {
    dailyPerformance: next,
  });

  await addDoc(collection(db, "users", userId, "performance_logs"), {
    ...point,
    createdAt: serverTimestamp(),
  });
}

export async function setCopyEngine({
  userId,
  copiedTraderId,
  systemActive,
  allocationUsd = 0,
}: {
  userId: string;
  copiedTraderId: string | null;
  systemActive: boolean;
  allocationUsd?: number;
}) {
  await updateDoc(doc(db, "users", userId), {
    copiedTraderId,
    systemActive,
    allocatedUsd: allocationUsd,
  });
}

export async function updateEmoji(userId: string, emoji: string) {
  await updateDoc(doc(db, "users", userId), { emoji });
}

export async function recordDailyPerformance({
  userId,
  user,
}: {
  userId: string;
  user: BullionsUser;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const depositedUsd = user.depositedUsd || 0;
  const profitUsd = user.profitUsd || 0;

  const point: DailyPerformance = {
    date: today,
    depositedUsd,
    profitUsd,
    liveWallet: depositedUsd + profitUsd,
    pnlPct: depositedUsd > 0 ? (profitUsd / depositedUsd) * 100 : 0,
  };

  const current = user.dailyPerformance || last7Days(depositedUsd, profitUsd);
  const filtered = current.filter((p) => p.date !== today);
  const next = [...filtered, point].slice(-7);

  await updateDoc(doc(db, "users", userId), {
    dailyPerformance: next,
  });

  await addDoc(collection(db, "users", userId, "performance_logs"), {
    ...point,
    createdAt: serverTimestamp(),
  });
}



