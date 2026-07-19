import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function ensureUser(userId: string, email?: string) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  const referralCode =
    typeof window !== "undefined"
      ? localStorage.getItem("bullions_ref")
      : null;

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        userId,
        email: email || null,
        referredBy: referralCode?.trim().toLowerCase() || null,
        depositedUsd: 0,
        profitUsd: 0,
        copiedTraderId: null,
        systemActive: false,
        dailyPerformance: [],
        workspaces: {
          trader: true,
          investor: true,
        },
        lastWorkspace: null,
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else if (!snap.data().referredBy && referralCode) {
    await setDoc(
      ref,
      {
        referredBy: referralCode.trim().toLowerCase(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return userId;
}
