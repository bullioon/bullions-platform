import { NextResponse } from "next/server";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = String(body.userId || "").trim();
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    const strategyId = "bullions_ai";
    const licenseId = `${userId}_${strategyId}`;

    await setDoc(
      doc(db, "bullionsAiAccessRequests", licenseId),
      {
        userId,
        username,
        email,
        strategyId,
        productType: "strategy",
        licenseType: "Institutional",
        accessFeeUsd: 3000,
        copyEnabled: false,
        mt5Live: false,
        weeklyReports: true,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      message: "Bullions AI access request submitted",
    });
  } catch (error: any) {
    console.error("ACCESS REQUEST ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error?.message || "Access request failed" },
      { status: 500 }
    );
  }
}
