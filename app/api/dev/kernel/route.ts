import { NextResponse } from "next/server";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}

import { BullionsKernel } from "@/core/v2/kernel/BullionsKernel";

export async function GET(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await BullionsKernel.pulse();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
