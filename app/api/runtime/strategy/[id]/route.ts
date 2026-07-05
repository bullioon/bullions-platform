import { NextResponse } from "next/server";
import { RuntimeRepository } from "@/core/v2/runtime";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const runtime = await RuntimeRepository.syncStrategyRuntime(id);

  if (!runtime) {
    return NextResponse.json({ ok: false, error: "Strategy not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, runtime });
}
