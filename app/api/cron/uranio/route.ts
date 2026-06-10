import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function randomBetween(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export async function GET() {
  const webhook = process.env.DISCORD_URANIO_WEBHOOK;

  const ref = doc(db, "system", "uranio");
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data() : null;

  const now = Date.now();

  if (current?.active && Number(current?.expiresAt || 0) > now) {
    return NextResponse.json({
      ok: true,
      skipped: "uranio_already_active",
    });
  }

  const shouldActivate = Math.random() < 0.25;

  if (!shouldActivate) {
    await setDoc(
      ref,
      {
        active: false,
        lastScanAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    return NextResponse.json({
      ok: true,
      activated: false,
    });
  }

  const signalId = `UR-${randomBetween(100, 999)}`;
  const expiresAt = now + 15 * 60 * 1000;
  const volume = randomBetween(82, 98);
  const volatility = randomBetween(76, 96);

  await setDoc(
    ref,
    {
      active: true,
      signalId,
      startsAt: now,
      expiresAt,
      volume,
      volatility,
      updatedAt: now,
    },
    { merge: true }
  );

  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          `@everyone\n\n` +
          `☢️ **URANIO EVENT LIVE**\n\n` +
          `Signal: **${signalId}**\n` +
          `Volume: **${volume}%**\n` +
          `Volatility: **${volatility}%**\n\n` +
          `Available for **15 minutes**.\n` +
          `Manual activation required.\n` +
          `Your collateral and risk profile are calculated individually.\n\n` +
          `Open BullPad now:\n` +
          `https://bullions6x.com/bullpad`,
      }),
    });
  }

  return NextResponse.json({
    ok: true,
    activated: true,
    signalId,
    expiresAt,
    volume,
    volatility,
  });
}
