import { NextResponse } from "next/server";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = String(body.userId || "").trim();
    const managers = Array.isArray(body.managers) ? body.managers : [];

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    if (managers.length < 1 || managers.length > 3) {
      return NextResponse.json(
        { ok: false, error: "Fund must have 1 to 3 managers" },
        { status: 400 }
      );
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const fundId = `${userId}_active`;

    const fund = {
      id: fundId,
      userId,
      managers,
      status: "ACTIVE",
      createdAt: serverTimestamp(),
      updatedAt: Date.now(),
    };

    await setDoc(doc(db, "funds", fundId), fund, { merge: true });

    await updateDoc(userRef, {
      activeFundId: fundId,
      fundActive: true,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      ok: true,
      message: "Fund activated",
      fundId,
      fund,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Fund activation failed" },
      { status: 500 }
    );
  }
}
