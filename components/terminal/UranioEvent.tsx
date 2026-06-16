"use client";

import { UranioMark } from "./UranioMark";
import { UranioParticles } from "./UranioParticles";
import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function UranioEvent({ isTorion, userId, onAddCollateral }: any) {
  const discordUranioTriggeredRef = useRef<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<any>(null);
  const [now, setNow] = useState(Date.now());
  const [clicked, setClicked] = useState(false);
  const [activationPhase, setActivationPhase] = useState<
    "idle" | "connecting" | "matching" | "locking"
  >("idle");

  // 🔥 Firebase listener
  useEffect(() => {
    const unsubEvent = onSnapshot(doc(db, "system", "uranio"), (snap) => {
      setEvent(snap.data());
    });

    let unsubUser: any;

    if (userId) {
      unsubUser = onSnapshot(doc(db, "users", userId), (snap) => {
        const position = snap.data()?.uranioPosition || null;

        const status = position?.status || null;
        const signalId = position?.signalId || snap.data()?.signalId || String(position?.startedAt || snap.data()?.startedAt || "");

        if (
          status &&
          ["active", "pending_deposit"].includes(status) &&
          signalId &&
          discordUranioTriggeredRef.current !== signalId
        ) {
          discordUranioTriggeredRef.current = signalId;

          fetch("http://localhost:3007/uranio/activate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-bullions-secret": "uranio-demo-secret-123",
            },
            body: JSON.stringify({
              fast: false,
              signalId,
              pnlPct: position?.pnlPct,
              pnlUsd: position?.payout,
            }),
          }).catch(() => {});
        }
        setUserPosition(position);
        setStatus(position?.status || null);
      });
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      unsubEvent();
      unsubUser?.();
      clearInterval(timer);
    };
  }, [userId]);

  const currentStatus =
    userPosition?.signalId === event?.signalId ? userPosition?.status || null : null;

  // ✅ Auto resolve when Uranio expires
  useEffect(() => {
    if (!event?.active || !event?.expiresAt) return;
    if (now < Number(event.expiresAt)) return;

    fetch("/api/cron/uranio-resolve", {
      cache: "no-store",
    }).catch(() => {
      // ignore resolve errors
    });
  }, [event?.active, event?.expiresAt, now]);


  // ✅ Reset botón cuando cambia el estado válido de este Uranio
  useEffect(() => {
    if (currentStatus === "active" || currentStatus === "pending_deposit" || !currentStatus) {
      setClicked(false);
    }
  }, [currentStatus, event?.signalId]);

  // ❌ no mostrar si no aplica
  if (!isTorion || !event?.active) return null;

  // ✅ countdown
  const seconds = event?.expiresAt
    ? Math.max(0, Math.floor((event.expiresAt - now) / 1000))
    : 0;

  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");

  if (activationPhase !== "idle") {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-black/95 px-4">
        <UranioParticles active />

        <div className="relative z-10 w-full max-w-[460px] text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.36em] text-[#b6ff00]/70">
            Bullions AI
          </p>

          <div className="mx-auto mt-6 grid h-28 w-28 place-items-center rounded-full border border-[#b6ff00]/30 bg-[#b6ff00]/10 text-6xl shadow-[0_0_90px_rgba(182,255,0,0.26)]">
            ☢️
          </div>

          <h1 className="mt-8 text-5xl font-black tracking-[-0.07em] text-white">
            URANIO
          </h1>

          <p className="mt-5 min-h-[32px] text-lg font-semibold text-[#b6ff00]">
            {activationPhase === "connecting" && "Connecting Neural Engine..."}
            {activationPhase === "matching" && "Matching Liquidity Pools..."}
            {activationPhase === "locking" && "Locking Cross Collateral..."}
          </p>

          <div className="mx-auto mt-8 h-2 w-full max-w-[340px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#b6ff00] shadow-[0_0_30px_rgba(182,255,0,0.45)] transition-all duration-700"
              style={{
                width:
                  activationPhase === "connecting"
                    ? "33%"
                    : activationPhase === "matching"
                    ? "66%"
                    : "100%",
              }}
            />
          </div>

          <div className="mt-8 grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
            <p>Scanning institutional routes</p>
            <p>{activationPhase === "matching" || activationPhase === "locking" ? "OTC liquidity detected" : ""}</p>
            <p>{activationPhase === "locking" ? "Collateral route secured" : ""}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#b6ff00]/20 bg-[#050705] p-6 shadow-[0_0_110px_rgba(182,255,0,0.12)]">
      <UranioParticles active={currentStatus === "active" || currentStatus === "pending_deposit"} />
      <div className="relative z-10 grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">

        <UranioMark />

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
            Uranio global event live
          </p>

          <h3 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
            Opportunity detected
          </h3>

          <p className="mt-4 text-sm text-white/50">
            Uranio detected a global market window. Cross collateral is required before activation.
          </p>

          <div className="mt-5 grid max-w-xl grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">Collateral</p>
              <p className="mt-1 text-lg font-black text-white">$100</p>
            </div>

            <div className="rounded-2xl bg-[#b6ff00]/10 p-3 ring-1 ring-[#b6ff00]/15">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#b6ff00]/55">Max Profit</p>
              <p className="mt-1 text-lg font-black text-[#b6ff00]">+$600</p>
            </div>

            <div className="rounded-2xl bg-red-500/10 p-3 ring-1 ring-red-400/15">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-red-300/55">Max Loss</p>
              <p className="mt-1 text-lg font-black text-red-300">-$100</p>
            </div>
          </div>
        </div>

        <div className="min-w-[220px] rounded-[26px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-5 text-center">
          <p className="text-[10px] text-[#b6ff00]/65 uppercase">
            Window closes in
          </p>

          <p className="mt-2 text-5xl font-black text-[#b6ff00]">
            {minutes}:{secs}
          </p>

          <button
            onClick={async () => {
              setClicked(true);

              if (!userId || !event) return;

              setActivationPhase("connecting");
              await new Promise((resolve) => setTimeout(resolve, 1100));

              setActivationPhase("matching");
              await new Promise((resolve) => setTimeout(resolve, 1100));

              setActivationPhase("locking");
              await new Promise((resolve) => setTimeout(resolve, 1100));

              if (currentStatus !== "pending_deposit") {
                await updateDoc(doc(db, "users", userId), {
                  uranioPosition: {
                    active: true,
                    status: "pending_deposit",
                    signalId: event.signalId,
                    collateral: 100,
                    maxLoss: 100,
                    maxProfit: 600,
                    startedAt: Date.now(),
                    endsAt: event.expiresAt,
                    seen: true,
                  },
                  updatedAt: Date.now(),
                });
              }

              setActivationPhase("idle");
              onAddCollateral?.(100);
            }}
            disabled={currentStatus === "active"}
            className="mt-5 w-full rounded-2xl bg-[#b6ff00] px-6 py-4 text-black font-bold disabled:opacity-50"
          >
            {currentStatus === "active"
              ? "Active"
              : currentStatus === "pending_deposit"
              ? "Pay Pending Collateral"
              : clicked
              ? "Opening Deposit..."
              : "Deposit Cross Collateral"}
          </button>
        </div>

      </div>
    </section>
  );
}
