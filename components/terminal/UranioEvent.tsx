"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = {
  isTorion: boolean;
  portfolioUsd: number;
  userId?: string | null;
  onAddCollateral?: (amount: number) => void;
};

type GlobalUranio = {
  active?: boolean;
  signalId?: string;
  expiresAt?: number;
  volume?: number;
  volatility?: number;
};

function stableSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function UranioMark() {
  return (
    <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
      <div className="absolute inset-0 rounded-full bg-[#b6ff00]/10 blur-2xl" />
      <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6ff00] shadow-[0_0_35px_rgba(182,255,0,0.85)]" />
      <div className="absolute inset-1 animate-[spin_6s_linear_infinite] rounded-full border border-[#b6ff00]/20">
        <span className="absolute left-1/2 top-[-5px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#b6ff00]" />
      </div>
      <div className="absolute inset-4 animate-[spin_8s_linear_infinite_reverse] rounded-full border border-dashed border-[#b6ff00]/25">
        <span className="absolute right-[-4px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white/80" />
      </div>
      <div className="absolute inset-7 animate-[spin_4s_linear_infinite] rounded-full border border-[#b6ff00]/15">
        <span className="absolute bottom-[-4px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#b6ff00]/90" />
      </div>
    </div>
  );
}

export function UranioEvent({ isTorion, portfolioUsd, userId, onAddCollateral }: Props) {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<GlobalUranio | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system", "uranio"), (snap) => {
      setEvent(snap.exists() ? (snap.data() as GlobalUranio) : null);
    });

    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  if (!isTorion || !event?.active || !event.expiresAt || event.expiresAt <= now) {
    return null;
  }

  const signalId = event.signalId || "UR-000";
  const seconds = Math.max(0, Math.floor((event.expiresAt - now) / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  const countdown = `${minutes}:${secs}`;

  const seed = stableSeed(`${signalId}-${portfolioUsd}`);
  const collateral = 180 + (seed % 201);
  const maxLoss = Math.round(collateral * 0.5);
  const maxProfit = Math.round(collateral * 3);

  return (
    <>
      <section className="relative overflow-hidden rounded-[34px] border border-[#b6ff00]/15 bg-[#050705] p-6 shadow-[0_0_90px_rgba(182,255,0,0.08)]">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <UranioMark />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
                Uranio global event live
              </p>
              <span className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
                Discord live
              </span>
            </div>

            <h3 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl">
              Opportunity detected
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/52">
              Uranio detected a global market window. Your collateral and risk profile are calculated from your current balance.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/45">
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Signal {signalId}</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Volume {event.volume || 92}%</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Max loss ${maxLoss}</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Max profit ${maxProfit}</span>
            </div>
          </div>

          <div className="min-w-[220px] rounded-[26px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]/65">
              Window closes in
            </p>
            <p className="mt-2 text-5xl font-black text-[#b6ff00]">
              {countdown}
            </p>

            <button
              onClick={() => setOpen(true)}
              className="mt-5 w-full rounded-2xl bg-[#b6ff00] px-6 py-4 text-sm font-black text-black"
            >
              Activate Uranio
            </button>
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto bg-black/75 px-3 py-4 backdrop-blur-md sm:items-center">
          <div className="relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-[28px] border border-[#b6ff00]/20 bg-[#070807] p-4 shadow-[0_0_120px_rgba(182,255,0,0.12)] sm:rounded-[34px] sm:p-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-50 grid h-10 w-10 place-items-center rounded-full border border-white/[0.10] bg-black/70 text-2xl font-bold leading-none text-white/70"
            >
              ×
            </button>

            <div className="mb-4 flex items-start gap-3 pr-10">
              <UranioMark />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                  Uranio activation
                </p>
                <h3 className="mt-1 text-[32px] font-semibold leading-[0.98] tracking-[-0.06em] text-white">
                  Cross-collateral required
                </h3>
              </div>
            </div>

            <div className="rounded-[22px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-4">
              <p className="text-[13px] leading-5 text-white/58">
                This global Uranio window requires personalized cross-collateral. The amount is added to your balance and used as temporary protection during the event.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Collateral</p>
                  <p className="mt-1 text-2xl font-semibold text-[#b6ff00]">${collateral}</p>
                </div>

                <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Expires</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{countdown}</p>
                </div>

                <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Max loss</p>
                  <p className="mt-1 text-2xl font-semibold text-red-300">${maxLoss}</p>
                </div>

                <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Max profit</p>
                  <p className="mt-1 text-2xl font-semibold text-[#b6ff00]">${maxProfit}</p>
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                if (userId) {
                  await updateDoc(doc(db, "users", userId), {
                    uranioPosition: {
                      active: true,
                      status: "pending_deposit",
                      signalId,
                      collateral,
                      maxLoss,
                      maxProfit,
                      startedAt: Date.now(),
                      endsAt: event.expiresAt,
                    },
                    updatedAt: Date.now(),
                  });
                }

                setOpen(false);
                onAddCollateral?.(collateral);
              }}
              className="sticky bottom-0 mt-4 h-12 w-full rounded-2xl bg-[#b6ff00] text-sm font-black text-black"
            >
              Add ${collateral} Cross-Collateral
            </button>
          </div>
        </div>
      )}
    </>
  );
}
