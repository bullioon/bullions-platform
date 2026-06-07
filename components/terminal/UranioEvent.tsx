"use client";
import { useEffect, useState } from "react";
type Props = {
  isTorion: boolean;
  onAddCollateral?: () => void;
};
const COLLATERAL = 380;
function UranioMark() {
  return (
    <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
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

              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="h-14 rounded-2xl bg-[#b6ff00] px-8 text-sm font-black text-black transition hover:scale-[1.01]"
          >
            View Signal
          </button>
        </div>
      </section>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto bg-black/75 px-3 py-4 backdrop-blur-md sm:items-center sm:px-4 sm:py-6">
          <div className="relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-[28px] border border-[#b6ff00]/20 bg-[#070807] p-4 shadow-[0_0_120px_rgba(182,255,0,0.12)] sm:rounded-[34px] sm:p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-50 grid h-10 w-10 place-items-center rounded-full border border-white/[0.10] bg-black/70 text-2xl font-bold leading-none text-white/70 backdrop-blur hover:text-white sm:right-5 sm:top-5"
            >
              ×
            </button>
            <div className="absolute right-[-80px] top-[-80px] h-[220px] w-[220px] rounded-full bg-[#b6ff00]/10 blur-[90px]" />
            <div className="relative z-10">
              <div className="mb-4 flex items-start gap-3 pr-10 sm:gap-4 sm:pr-12">
                <UranioMark />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                    Collateral required
                  </p>
                  <h3 className="mt-1 text-[32px] font-semibold leading-[0.98] tracking-[-0.06em] text-white sm:text-3xl">
                    Uranio activation warning
                  </h3>
                </div>
              </div>
              <div className="rounded-[22px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-4 sm:rounded-[26px] sm:p-5">
                <p className="text-[13px] leading-5 text-white/58 sm:text-sm sm:leading-6">
                  Uranio requires cross-collateral to open this high-volatility window. This amount is added to your Bullions balance and used as temporary collateral for the Uranio event.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                  <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Missing</p>
                    <p className="mt-1 text-2xl font-semibold text-[#b6ff00] sm:text-3xl">${COLLATERAL}</p>
                  </div>
                  <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Expires</p>
                    <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{minutes}:{secs}</p>
                  </div>
                </div>
                <p className="mt-4 text-[11px] leading-5 text-white/35 sm:text-xs">
                  This is not a withdrawal fee and it is not a lost charge. It increases your active collateral while unlocking this Uranio window.
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  onAddCollateral?.();
                }}
                className="sticky bottom-0 mt-4 h-12 w-full rounded-2xl bg-[#b6ff00] text-sm font-black text-black shadow-[0_-12px_35px_rgba(0,0,0,0.45)] transition hover:scale-[1.01] sm:static sm:mt-5 sm:h-14"
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
