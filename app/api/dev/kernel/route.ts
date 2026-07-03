import { NextResponse } from "next/server";
import { BullionsKernel } from "@/core/v2/kernel/BullionsKernel";

export async function GET() {
  const result = await BullionsKernel.pulse();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
