"use client";
import { useEffect, useState } from "react";
type Props = {
  isTorion: boolean;
  onAddCollateral?: () => void;
};
const COLLATERAL = 380;
function UranioMark() {
  return (
    <div className="relative h-20 w-20 shrink-0">
      <div className="absolute inset-0 rounded-full bg-[#b6ff00]/5 blur-xl" />
      <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6ff00] shadow-[0_0_28px_rgba(182,255,0,0.75)]" />
      <div className="absolute inset-1 animate-[spin_5s_linear_infinite] rounded-full border border-[#b6ff00]/15">
        <span className="absolute left-1/2 top-[-5px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#b6ff00]" />
      </div>
      <div className="absolute inset-3 animate-[spin_7s_linear_infinite_reverse] rounded-full border border-dashed border-[#b6ff00]/20">
        <span className="absolute right-[-4px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white/80" />
      </div>
      <div className="absolute inset-5 animate-[spin_4s_linear_infinite] rounded-full border border-[#b6ff00]/10">
        <span className="absolute bottom-[-3px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#b6ff00]/80" />
      </div>
    </div>
  );
}
export function UranioEvent({ isTorion, onAddCollateral }: Props) {
  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(14 * 60 + 52);
  useEffect(() => {
    if (!isTorion) return;
    const timer = setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTorion]);
  if (!isTorion) return null;
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return (
    <>
      <section className="relative overflow-hidden rounded-[32px] border border-[#b6ff00]/15 bg-[#050705] p-6 shadow-[0_0_80px_rgba(182,255,0,0.08)]">
        <div className="absolute right-[-80px] top-[-80px] h-[240px] w-[240px] rounded-full bg-[#b6ff00]/10 blur-[90px]" />
        <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-5">
            <UranioMark />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                  Uranio signal detected
                </p>
                <span className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
                  Rare event
                </span>
              </div>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                High-volatility window found
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">
                Uranio has detected a temporary opportunity window. Review the signal before it expires.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
                <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Signal ID UR-047</span>
                <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Window {minutes}:{secs}</span>
                <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Access locked</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="h-14 rounded-2xl bg-[#b6ff00] px-8 text-sm font-black text-black transition hover:scale-[1.01]"
          >
            Review Signal
          </button>
        </div>
      </section>
      {open && (
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/70 px-4 backdrop-blur-md">
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-[34px] border border-[#b6ff00]/20 bg-[#070807] p-6 shadow-[0_0_120px_rgba(182,255,0,0.12)]">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-white/50"
            >
              Close
            </button>
            <div className="absolute right-[-80px] top-[-80px] h-[220px] w-[220px] rounded-full bg-[#b6ff00]/10 blur-[90px]" />
            <div className="relative z-10">
              <div className="mb-5 flex items-center gap-4">
                <UranioMark />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                    Collateral required
                  </p>
                  <h3 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-white">
                    Uranio locked
                  </h3>
                </div>
              </div>
              <div className="rounded-[26px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-5">
                <p className="text-sm leading-6 text-white/60">
                  You are short on collateral for this Uranio window. Add collateral to your Bullions balance to activate the event before it expires.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Missing</p>
                    <p className="mt-1 text-3xl font-semibold text-[#b6ff00]">${COLLATERAL}</p>
                  </div>
                  <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Expires</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{minutes}:{secs}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/35">
                  Collateral stays in your portfolio. Uranio access only unlocks the temporary exposure window.
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  onAddCollateral?.();
                }}
                className="mt-5 h-14 w-full rounded-2xl bg-[#b6ff00] text-sm font-black text-black transition hover:scale-[1.01]"
              >
                Add ${COLLATERAL} Collateral
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
