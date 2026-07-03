import { NextResponse } from "next/server";
import { PerformanceScheduler } from "@/core/v2/services/PerformanceScheduler";

export async function GET() {

  const scheduler = new PerformanceScheduler();

  const result = await scheduler.run();

  return NextResponse.json({
    ok: true,
    ...result,
  });

}
