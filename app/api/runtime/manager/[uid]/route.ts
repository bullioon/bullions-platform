import { NextResponse } from "next/server";
import { ManagerRuntimeRepository } from "@/core/v2/runtime/ManagerRuntimeRepository";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ uid: string }>;
  }
) {
  const { uid } = await context.params;

  const runtime =
    await ManagerRuntimeRepository.syncManagerRuntime(
      uid
    );

  if (!runtime) {
    return NextResponse.json(
      {
        ok: false,
        error: "Manager not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    runtime,
  });
}
