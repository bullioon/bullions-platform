import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function registerDeposit({
  userId,
  txHash,
  amountSol,
}: {
  userId: string;
  txHash: string;
  amountSol: number;
}) {
  const ref = doc(db, "users", userId, "deposits", txHash);
  const exists = await getDoc(ref);

  if (exists.exists()) {
    throw new Error("Deposit already registered");
  }

  await setDoc(ref, {
    txHash,
    amountSol,
    createdAt: Date.now(),
  });

  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    depositedUsd: increment(amountSol * 100), // puedes cambiar a precio real después
  });
}




