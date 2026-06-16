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

const lastResolvedAt = Number(current?.resolvedAt || 0);
const cooldownMs = 60 * 60 * 1000;

if (!force && lastResolvedAt && now - lastResolvedAt < cooldownMs) {
  return NextResponse.json({
    ok: true,
    skipped: "uranio_cooldown_after_resolve",
    remainingMs: cooldownMs - (now - lastResolvedAt),
  });
}

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


  if (
  current?.active &&
  Number(current?.expiresAt || 0) <= now &&
  !current?.resolved
) {
  return NextResponse.json({
    ok: true,
    skipped: "uranio_expired_waiting_resolve",
  });
}

  const shouldActivate = force || Math.random() < 0.20;

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
  let discordBotStatus: number | null = null;
  let discordBotText = "";

  const discordBotUrl = process.env.DISCORD_BOT_URANIO_URL;
  const discordBotSecret = process.env.DISCORD_API_SECRET;

  if (discordBotUrl && discordBotSecret) {
    try {
      const botRes = await fetch(discordBotUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bullions-secret": discordBotSecret,
        },
        body: JSON.stringify({
          signalId,
          volume,
          volatility,
          expiresInMinutes: 15,
          outcome,
        }),
      });

      discordBotStatus = botRes.status;
      discordBotText = await botRes.text();

      console.log("DISCORD BOT STATUS:", discordBotStatus);
      console.log("DISCORD BOT RESPONSE:", discordBotText);
    } catch (error) {
      discordBotStatus = 500;
      discordBotText = error instanceof Error ? error.message : "unknown_error";
      console.error("DISCORD BOT ERROR:", error);
    }
  }

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
          `⏳ Live execution window: 15 minutes\n` +
          `☢️ AI allocation engine engaged\n` +
          `📡 Results will be published automatically\n\n` +
          `➡️ Follow live execution in #uranio-history\n` +
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
    discordBotStatus,
    discordBotText,
    signalId,
    expiresAt,
    volume,
    volatility,
    outcome,
  });
}