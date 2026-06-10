import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addProfit } from "@/lib/bullionsUser";

export async function GET() {
  const systemRef = doc(db, "system", "uranio");
  const systemSnap = await getDoc(systemRef);

  if (!systemSnap.exists()) {
    return NextResponse.json({ ok: false, error: "uranio_not_found" });
  }

  const uranio = systemSnap.data();
  const now = Date.now();

  if (!uranio.active) {
    return NextResponse.json({
      ok: true,
      skipped: "uranio_not_active",
    });
  }

  if (Number(uranio.expiresAt || 0) > now) {
    return NextResponse.json({
      ok: true,
      skipped: "uranio_not_expired",
      remainingMs: Number(uranio.expiresAt) - now,
    });
  }

  const usersSnap = await getDocs(collection(db, "users"));

  let resolved = 0;

  for (const userDoc of usersSnap.docs) {
    const user = userDoc.data();
    const position = user.uranioPosition;

    if (
      !position ||
      position.status !== "active" ||
      position.signalId !== uranio.signalId
    ) {
      continue;
    }

    const payout =
      uranio.outcome === "WIN"
        ? Number(position.maxProfit || 0)
        : -Number(position.maxLoss || 0);

    await addProfit(userDoc.id, payout);

    await updateDoc(userDoc.ref, {
      uranioPosition: {
        ...position,
        active: false,
        status: "completed",
        result: uranio.outcome,
        payout,
        resolvedAt: now,
        seen: false,
      },
    });

    resolved++;
  }

  await updateDoc(systemRef, {
    active: false,
    resolved: true,
    resolvedAt: now,
  });

  return NextResponse.json({
    ok: true,
    outcome: uranio.outcome,
    resolvedUsers: resolved,
  });
}
