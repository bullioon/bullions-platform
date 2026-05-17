import { NextResponse } from "next/server";
import {
  collection,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("systemActive", "==", true));
  const snap = await getDocs(q);

  await Promise.all(
    snap.docs.map(async (userDoc) => {
      const user = userDoc.data();
      const depositedUsd = Number(user.depositedUsd || 0);

      if (depositedUsd <= 0) return;

      const isWin = Math.random() < 0.62;
      const winPct = 0.035 + Math.random() * 0.075;
      const lossPct = 0.025 + Math.random() * 0.06;
      const rareDrawdown = Math.random() < 0.075;

      const movePct = rareDrawdown
        ? -(0.09 + Math.random() * 0.16)
        : isWin
          ? winPct
          : -lossPct;

      const nextMove = depositedUsd * (movePct / 100);

      await updateDoc(userDoc.ref, {
        profitUsd: increment(nextMove),
        updatedAt: Date.now(),
      });
    })
  );

  return NextResponse.json({
    ok: true,
    updatedUsers: snap.size,
  });
}
