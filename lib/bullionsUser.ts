import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
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
  avatarEmoji?: string;
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

export async function ensureBullionsUser(userId: string, email: string) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: email.split("@")[0] || "Bullions User",
      username: email.split("@")[0] || "user",
      email,
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

  await updateDoc(doc(db, "users", userId), {
    depositedUsd: increment(amountUsd),
  });
}


export async function withdrawUsd(userId: string, amountUsd: number) {
  await updateDoc(doc(db, "users", userId), {
    depositedUsd: increment(-amountUsd),
  });
}

export async function addProfit(userId: string, amountUsd: number) {
  await updateDoc(doc(db, "users", userId), {
    profitUsd: increment(amountUsd),
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



