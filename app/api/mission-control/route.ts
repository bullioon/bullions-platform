import { NextResponse } from "next/server";
import { BullionsKernel } from "@/core/v2/kernel/BullionsKernel";

export async function GET() {
  const data = await BullionsKernel.missionControl();
  return NextResponse.json(data);
}
