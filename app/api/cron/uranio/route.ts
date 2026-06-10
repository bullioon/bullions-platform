import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function randomBetween(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export async function GET(request: Request) {
  const webhook = process.env.DISCORD_URANIO_WEBHOOK;

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";

  const ref = doc(db, "system", "uranio");
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data() : null;

  const now = Date.now();

  if (
    !force &&
    current?.active &&
    Number(current?.expiresAt || 0) > now
  ) {
    return NextResponse.json({
      ok: true,
      skipped: "uranio_already_active",
      webhookConfigured: Boolean(webhook),
    });
  }

  const shouldActivate = force || Math.random() < 0.25;

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
      webhookConfigured: Boolean(webhook),
    });
  }

  const signalId = `UR-${randomBetween(100, 999)}`;
  const expiresAt = now + 15 * 60 * 1000;
  const volume = randomBetween(82, 98);
  const volatility = randomBetween(76, 96);
  const outcome = Math.random() < 0.65 ? "WIN" : "LOSS";

  await setDoc(
    ref,
    {
      active: true,
      signalId,
      startsAt: now,
      expiresAt,
      volume,
      volatility,
      outcome,
      resolved: false,
      updatedAt: now,
    },
    { merge: true }
  );

  let discordStatus: number | null = null;
  let discordText = "";

  if (webhook) {
    const discordRes = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          `@everyone\n\n` +
          `☢️ **URANIO EVENT DETECTED**\n\n` +
          `High-volume opportunity identified.\n\n` +
          `Signal: ${signalId}\n` +
          `Volume: ${volume}%\n` +
          `Volatility: ${volatility}%\n\n` +
          `⏳ Available for 15 minutes\n` +
          `☢️ Manual activation required\n` +
          `📈 Risk profile calculated individually\n\n` +
          `https://bullions6x.com/bullpad`,
      }),
    });

    discordStatus = discordRes.status;
    discordText = await discordRes.text();

    console.log("DISCORD STATUS:", discordStatus);
    console.log("DISCORD RESPONSE:", discordText);
  }

  return NextResponse.json({
    ok: true,
    activated: true,
    webhookConfigured: Boolean(webhook),
    discordStatus,
    discordText,
    signalId,
    expiresAt,
    volume,
    volatility,
    outcome,
  });
}