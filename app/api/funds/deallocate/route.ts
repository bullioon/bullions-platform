import { NextResponse } from "next/server";

import { FundService } from "@/core/v2/services/FundService";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing auth token" }, { status: 401 });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken);
    const body = await req.json();

    const userId = String(body.userId || "").trim();
    const traderId = String(body.traderId || "").trim();

    if (!userId || !traderId) {
      return NextResponse.json({ ok: false, error: "Missing userId or traderId" }, { status: 400 });
    }

    if (decodedToken.uid !== userId) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const nextIds = await FundService.deallocateByTraderId(userId, traderId);

    return NextResponse.json({
      ok: true,
      nextIds,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Could not deallocate fund manager" },
      { status: 500 }
    );
  }
}
