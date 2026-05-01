import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function ensureUser(userId: string, email?: string) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      userId,
      email: email || null,
      depositedUsd: 0,
      profitUsd: 0,
      copiedTraderId: null,
      systemActive: false,
      dailyPerformance: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return userId;
}
