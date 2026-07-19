import { NextResponse } from "next/server";

import { getAdminAuth } from "@/lib/firebaseAdminAuth";
import { PaymentEngine } from "@/core/v2/payments/PaymentEngine";

export async function POST(req: Request) {
  try {
    const authHeader =
      req.headers.get("authorization");

    const idToken =
      authHeader?.startsWith("Bearer ")
        ? authHeader.slice(
            "Bearer ".length
          )
        : "";

    if (!idToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing auth token",
        },
        { status: 401 }
      );
    }

    const decoded =
      await getAdminAuth().verifyIdToken(
        idToken
      );

    const body = await req.json();

    const challengeEntryId = String(
      body.challengeEntryId || ""
    ).trim();

    const signature = String(
      body.signature || ""
    ).trim();

    if (!challengeEntryId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing challengeEntryId",
        },
        { status: 400 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing transaction signature",
        },
        { status: 400 }
      );
    }

    const result =
      await PaymentEngine.verifyChallengePayment(
        {
          userId: decoded.uid,
          challengeEntryId,
          signature,
        }
      );

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "[payments-verify]",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed",
      },
      { status: 500 }
    );
  }
}
