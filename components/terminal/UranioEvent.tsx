"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  isTorion: boolean;
  portfolioUsd: number;
  onAddCollateral?: (amount: number) => void;
};

type Certificate = {
  id: string;
  resultUsd: number;
  createdAt: number;
  maxLoss: number;
  maxWin: number;
};

type Signal = {
  status?: "detected" | "active" | "complete";
  activeUntil?: number;
  resultUsd?: number;
  expiresAt: number;
  nextScanAt: number;
  collateral: number;
  signalId: string;
  volumeScore: number;
  volatilityScore: number;
};

const EVENT_MS = 15 * 60 * 1000;
const EXPIRED_HIDE_MS = 5000;
const MIN_NEXT_SCAN_MS = 20 * 60 * 1000;
const MAX_NEXT_SCAN_MS = 6 * 60 * 60 * 1000;

function randomBetween(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function createSignal(): Signal {
  const now = Date.now();

  return {
    status: "detected",
    expiresAt: now + EVENT_MS,
    nextScanAt: now + randomBetween(MIN_NEXT_SCAN_MS, MAX_NEXT_SCAN_MS),
    collateral: randomBetween(180, 380),
    signalId: `UR-${randomBetween(41, 99)}`,
    volumeScore: randomBetween(72, 96),
    volatilityScore: randomBetween(68, 94),
  };
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

export function UranioEvent({ isTorion, portfolioUsd, onAddCollateral }: Props) {
  const [open, setOpen] = useState(false);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [now, setNow] = useState(Date.now());
  const [dismissed, setDismissed] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const maxLoss = useMemo(() => Math.round(portfolioUsd * 0.1), [portfolioUsd]);
  const maxWin = useMemo(() => Math.round(portfolioUsd * 0.3), [portfolioUsd]);

  useEffect(() => {
    const savedCertificates = localStorage.getItem("bullions_uranio_certificates");
    if (savedCertificates) {
      setCertificates(JSON.parse(savedCertificates));
    }
  }, []);

  useEffect(() => {
    if (!isTorion) return;

    const key = "bullions_uranio_signal";
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) as Signal : null;

    if (parsed && parsed.nextScanAt > Date.now()) {
      setSignal(parsed);
    } else {
      const fresh = createSignal();
      localStorage.setItem(key, JSON.stringify(fresh));
      setSignal(fresh);
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isTorion]);

  useEffect(() => {
    if (!signal) return;

    if (signal.status === "active" && signal.activeUntil && signal.activeUntil <= now) {
      const completeSignal = { ...signal, status: "complete" as const };
      const certificate: Certificate = {
        id: signal.signalId,
        resultUsd: signal.resultUsd || 0,
        createdAt: Date.now(),
        maxLoss,
        maxWin,
      };

      const updatedCertificates = [certificate, ...certificates].slice(0, 6);
      localStorage.setItem("bullions_uranio_certificates", JSON.stringify(updatedCertificates));
      localStorage.setItem("bullions_uranio_signal", JSON.stringify(completeSignal));

      setCertificates(updatedCertificates);
      setSignal(completeSignal);
      return;
    }

    if (signal.status === "complete") return;

    if (signal.expiresAt > now) return;

    const timer = setTimeout(() => {
      setDismissed(true);
      localStorage.setItem("bullions_uranio_signal", JSON.stringify({
        ...signal,
        nextScanAt: Date.now() + randomBetween(MIN_NEXT_SCAN_MS, MAX_NEXT_SCAN_MS),
      }));
    }, EXPIRED_HIDE_MS);

    return () => clearTimeout(timer);
  }, [signal, now]);

  if (!isTorion || !signal || dismissed) return null;

  const activeSeconds = signal.activeUntil ? Math.max(0, Math.floor((signal.activeUntil - now) / 1000)) : 0;
  const seconds = signal.status === "active" ? activeSeconds : Math.max(0, Math.floor((signal.expiresAt - now) / 1000));
  const expired = seconds <= 0;
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  const countdown = `${minutes}:${secs}`;

  return (
    <>
      <section className="relative overflow-hidden rounded-[34px] border border-[#b6ff00]/15 bg-[#050705] p-6 shadow-[0_0_90px_rgba(182,255,0,0.08)]">
        <div className="absolute right-[-90px] top-[-90px] h-[260px] w-[260px] rounded-full bg-[#b6ff00]/10 blur-[90px]" />

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
              Opportunity detected
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/52">
              Volume spike and volatility window detected. Uranio calculated a temporary event with defined risk limits.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/45">
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Signal {signal.signalId}</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Volume {signal.volumeScore}%</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Max loss ${maxLoss}</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Max upside ${maxWin}</span>
            </div>
          </div>

          <div className="min-w-[220px] rounded-[26px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]/65">
              Window closes in
            </p>
            <p className={expired ? "mt-2 text-4xl font-black text-red-400" : "mt-2 text-5xl font-black text-[#b6ff00]"}>
              {expired ? "EXPIRED" : countdown}
            </p>

            {expired && <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/35">Searching for new opportunities</p>}

            <button
              disabled={expired}
              onClick={() => !expired && setOpen(true)}
              className={expired ? "mt-5 w-full rounded-2xl bg-white/[0.08] px-6 py-4 text-sm font-black text-white/35" : "mt-5 w-full rounded-2xl bg-[#b6ff00] px-6 py-4 text-sm font-black text-black"}
            >
              {expired ? "Market window closed" : signal.status === "active" ? "Uranio Active" : signal.status === "complete" ? "Certificate Ready" : "Unlock Uranio"}
            </button>
          </div>
        </div>
        {certificates.length > 0 && (
          <div className="relative z-10 mt-5 rounded-[26px] border border-white/[0.06] bg-black/25 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
                  Certificate vault
                </p>
                <p className="mt-1 text-sm font-semibold text-white/75">
                  Uranio events completed
                </p>
              </div>

              <span className="rounded-full bg-[#b6ff00]/10 px-3 py-1 text-xs font-black text-[#b6ff00]">
                {certificates.length}
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {certificates.slice(0, 3).map((cert) => (
                <div
                  key={`${cert.id}-${cert.createdAt}`}
                  className="rounded-2xl bg-white/[0.035] p-3 ring-1 ring-white/[0.05]"
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {cert.id}
                  </p>
                  <p className={cert.resultUsd >= 0 ? "mt-1 text-lg font-black text-[#b6ff00]" : "mt-1 text-lg font-black text-red-300"}>
                    {cert.resultUsd >= 0 ? "+" : ""}${cert.resultUsd}
                  </p>
                  <p className="mt-1 text-[10px] text-white/35">
                    Max risk ${cert.maxLoss} · Upside ${cert.maxWin}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto bg-black/75 px-3 py-4 backdrop-blur-md sm:items-center">
          <div className="relative max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-[28px] border border-[#b6ff00]/20 bg-[#070807] p-4 shadow-[0_0_120px_rgba(182,255,0,0.12)] sm:rounded-[34px] sm:p-6">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-50 grid h-10 w-10 place-items-center rounded-full border border-white/[0.10] bg-black/70 text-2xl font-bold leading-none text-white/70">
              ×
            </button>

            <div className="relative z-10">
              <div className="mb-4 flex items-start gap-3 pr-10">
                <UranioMark />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">Uranio activation</p>
                  <h3 className="mt-1 text-[32px] font-semibold leading-[0.98] tracking-[-0.06em] text-white">
                    Cross-collateral required
                  </h3>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-4">
                <p className="text-[13px] leading-5 text-white/58">
                  Uranio requires cross-collateral to open this high-volatility window. The event is calculated with defined risk limits and no guaranteed result.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-black/30 p-3 ring-1 ring-white/[0.06]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Collateral</p>
                    <p className="mt-1 text-2xl font-semibold text-[#b6ff00]">${signal.collateral}</p>
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
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Max upside</p>
                    <p className="mt-1 text-2xl font-semibold text-[#b6ff00]">${maxWin}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-[11px] leading-5 text-white/45">
                 <div className="mt-4 rounded-2xl border border-[#b6ff00]/10 bg-black/20 p-4">
  <p className="text-sm leading-6 text-white/60">
    Uranio events operate using cross-collateral protection.
    Additional collateral increases available margin during
    high-volatility execution windows and helps absorb temporary
    drawdowns while the event remains active.
  </p>

  <div className="mt-4 space-y-2 text-xs text-white/45">
    <div className="flex justify-between">
      <span>Collateral required</span>
      <span className="text-[#b6ff00] font-semibold">
        ${signal.collateral}
      </span>
    </div>

    <div className="flex justify-between">
      <span>Maximum downside</span>
      <span className="text-red-300 font-semibold">
        ${maxLoss}
      </span>
    </div>

    <div className="flex justify-between">
      <span>Maximum upside</span>
      <span className="text-[#b6ff00] font-semibold">
        ${maxWin}
      </span>
    </div>
  </div>
</div>

                </div>
              </div>

              <button
                onClick={() => {
                  const maxLossAmount = Math.round(portfolioUsd * 0.1);
                  const maxWinAmount = Math.round(portfolioUsd * 0.3);
                  const negative = Math.random() < 0.75;
                  const resultUsd = negative
                    ? -Math.round(maxLossAmount * (0.35 + Math.random() * 0.65))
                    : Math.round(maxWinAmount * (0.15 + Math.random() * 0.85));

                  const activeSignal = {
                    ...signal,
                    status: "active" as const,
                    activeUntil: Date.now() + EVENT_MS,
                    resultUsd,
                  };

                  localStorage.setItem("bullions_uranio_signal", JSON.stringify(activeSignal));
                  setSignal(activeSignal);
                  setOpen(false);
                  onAddCollateral?.(signal.collateral);
                }}
                className="sticky bottom-0 mt-4 h-12 w-full rounded-2xl bg-[#b6ff00] text-sm font-black text-black"
              >
                Add ${signal.collateral} Cross-Collateral
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
