"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  isTorion: boolean;
  onAddCollateral?: () => void;
};

function UranioMark() {
  return (
    <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
      <div className="absolute inset-0 rounded-full bg-[#b6ff00]/10 blur-2xl" />
      <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b6ff00] shadow-[0_0_35px_rgba(182,255,0,0.85)]" />

      <div className="absolute inset-1 animate-[spin_6s_linear_infinite] rounded-full border border-[#b6ff00]/20">
        <span className="absolute left-1/2 top-[-5px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#b6ff00] shadow-[0_0_18px_rgba(182,255,0,0.8)]" />
      </div>

      <div className="absolute inset-4 animate-[spin_8s_linear_infinite_reverse] rounded-full border border-dashed border-[#b6ff00]/25">
        <span className="absolute right-[-4px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_14px_rgba(255,255,255,0.65)]" />
      </div>

      <div className="absolute inset-7 animate-[spin_4s_linear_infinite] rounded-full border border-[#b6ff00]/15">
        <span className="absolute bottom-[-4px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#b6ff00]/90" />
      </div>
    </div>
  );
}

export function UranioEvent({ isTorion, onAddCollateral }: Props) {
  const [open, setOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(14 * 60 + 52);
  const [dismissed, setDismissed] = useState(false);

  const collateral = useMemo(() => {
    return 180 + Math.floor(Math.random() * 280);
  }, []);

  useEffect(() => {
    if (!isTorion) return;

    const key = "bullions_uranio_expires_at";
    const existing = Number(localStorage.getItem(key) || 0);
    const nextExpiresAt = existing > Date.now() ? existing : Date.now() + (14 * 60 + 52) * 1000;

    localStorage.setItem(key, String(nextExpiresAt));
    setExpiresAt(nextExpiresAt);

    const timer = setInterval(() => {
      setSeconds(Math.max(0, Math.floor((nextExpiresAt - Date.now()) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [isTorion]);

  useEffect(() => {
    if (seconds > 0) return;

    const timer = setTimeout(() => {
      setDismissed(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [seconds]);

  if (!isTorion || dismissed) return null;

  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  const countdown = `${minutes}:${secs}`;
  const expired = seconds <= 0;

  return (
    <>
      <section className="relative overflow-hidden rounded-[34px] border border-[#b6ff00]/15 bg-[#050705] p-6 shadow-[0_0_90px_rgba(182,255,0,0.08)]">
        <div className="absolute right-[-90px] top-[-90px] h-[260px] w-[260px] rounded-full bg-[#b6ff00]/10 blur-[90px]" />
        <div className="absolute bottom-[-120px] left-[-120px] h-[260px] w-[260px] rounded-full bg-[#b6ff00]/5 blur-[100px]" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <UranioMark />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
                Uranio opportunity live
              </p>
              <span className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
                Rare event
              </span>
            </div>

            <h3 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl">
              Rare signal detected
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/52">
              Temporary high-volatility window detected. Review the signal before the opportunity expires.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/45">
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">
                Signal ID UR-047
              </span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">
                Torion-only access
              </span>
            </div>
          </div>

          <div className="min-w-[220px] rounded-[26px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]/65">
              Window closes in
            </p>
            <p className="mt-2 text-5xl font-black tracking-[-0.06em] text-[#b6ff00]">
              {countdown}
            </p>

            <button
              disabled={expired}
              onClick={() => !expired && setOpen(true)}
              className={expired ? "mt-5 h-13 w-full rounded-2xl bg-white/[0.08] px-6 py-4 text-sm font-black text-white/35" : "mt-5 h-13 w-full rounded-2xl bg-[#b6ff00] px-6 py-4 text-sm font-black text-black transition hover:scale-[1.01]"}
            >
              {expired ? "Signal Expired" : "Unlock Uranio"}
            </button>
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto bg-black/75 px-3 py-4 backdrop-blur-md sm:items-center sm:px-4 sm:py-6">
          <div className="relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-[28px] border border-[#b6ff00]/20 bg-[#070807] p-4 shadow-[0_0_120px_rgba(182,255,0,0.12)] sm:rounded-[34px] sm:p-6">
            <button
              type="button"
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
                    Uranio activation
                  </p>
                  <h3 className="mt-1 text-[32px] font-semibold leading-[0.98] tracking-[-0.06em] text-white sm:text-3xl">
                    Cross-collateral required
                  </h3>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-4 sm:rounded-[26px] sm:p-5">
                <p className="text-[13px] leading-5 text-white/58 sm:text-sm sm:leading-6">
                  Uranio requires cross-collateral to open this high-volatility window. This amount is added to your Bullions balance and used as temporary collateral for the Uranio event.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
                  <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Required
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[#b6ff00] sm:text-3xl">
                      ${collateral}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06] sm:p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Expires
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                      {countdown}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-[11px] leading-5 text-white/45 sm:text-xs">
                  <p>✓ Added to your Bullions balance</p>
                  <p>✓ Not a withdrawal fee</p>
                  <p>✓ Not consumed or lost</p>
                  <p>✓ Unlocks this Uranio window</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  onAddCollateral?.();
                }}
                className="sticky bottom-0 mt-4 h-12 w-full rounded-2xl bg-[#b6ff00] text-sm font-black text-black shadow-[0_-12px_35px_rgba(0,0,0,0.45)] transition hover:scale-[1.01] sm:static sm:mt-5 sm:h-14"
              >
                Add ${collateral} Cross-Collateral
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
