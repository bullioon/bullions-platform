import { NextResponse } from "next/server";
import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}

export async function POST(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const uid = String(body.uid || "").trim();

  if (!uid) {
    return NextResponse.json({ ok: false, error: "Missing uid" }, { status: 400 });
  }

  await ManagerRepository.create({
    uid,
    status: "DRAFT",
    identity: {
      username: body.username || "ghost-alpha",
      displayName: body.displayName || "Ghost Alpha",
      tagline: body.tagline || "Institutional macro manager.",
      biography:
        body.biography ||
        "A risk-first investment manager focused on macro momentum, gold, indices, and disciplined execution.",
      avatarUrl: "",
      bannerUrl: "",
    },
    brand: {
      companyName: body.companyName || "Ghost Alpha Capital",
      location: body.location || "Mexico",
      foundedYear: Number(body.foundedYear || 2026),
      website: "",
    },
    reputation: {
      verified: false,
      allocatorScore: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return NextResponse.json({ ok: true, uid });
}
