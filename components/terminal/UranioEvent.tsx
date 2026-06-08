"use client";

import { useEffect, useState } from "react";

type Props = {
  isTorion: boolean;
  portfolioUsd: number;
  onAddCollateral?: (amount: number) => void;
};

type Signal = {
  signalId: string;
  status: "waiting" | "active" | "complete";
  collateral: number;
  volume: number;
  maxLoss: number;
  maxWin: number;
  resultUsd?: number;
  createdAt: number;
  expiresAt: number;
  activeUntil?: number;
  nextScanAt: number;
};

const EVENT_MS = 15 * 60 * 1000;
const ACTIVE_MS = 15 * 60 * 1000;

function randomBetween(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function nextScanTime() {
  return Date.now() + randomBetween(4, 48) * 60 * 60 * 1000;
}

function createSignal(portfolioUsd: number): Signal {
  return {
    signalId: `UR-${randomBetween(100, 999)}`,
    status: "waiting",
    collateral: randomBetween(180, 380),
    volume: randomBetween(75, 98),
    maxLoss: Math.round(portfolioUsd * 0.1),
    maxWin: Math.round(portfolioUsd * 0.3),
    createdAt: Date.now(),
    expiresAt: Date.now() + EVENT_MS,
    nextScanAt: nextScanTime(),
  };
}

function calculateResult(maxLoss: number, maxWin: number) {
  const roll = Math.random();

  if (roll < 0.7) {
    return -Math.round(maxLoss * (0.3 + Math.random() * 0.7));
  }

  if (roll < 0.95) {
    return Math.round(maxWin * (0.1 + Math.random() * 0.4));
  }

  return Math.round(maxWin);
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const savedSound = localStorage.getItem("bullions_uranio_sound");
    if (savedSound === "off") setSoundEnabled(false);
  }, []);

  useEffect(() => {
    if (!isTorion) return;

    const key = "bullions_uranio_signal";
    const saved = localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as Signal) : null;

    if (parsed) {
      if (parsed.status === "complete") {
        setSignal(parsed);
      } else if (parsed.expiresAt > Date.now() || parsed.activeUntil && parsed.activeUntil > Date.now()) {
        setSignal(parsed);
      } else if (Date.now() >= parsed.nextScanAt && Math.random() < 0.18) {
        const fresh = createSignal(portfolioUsd);
        localStorage.setItem(key, JSON.stringify(fresh));
        setSignal(fresh);
      } else {
        setSignal(null);
      }
    } else if (Math.random() < 0.18) {
      const fresh = createSignal(portfolioUsd);
      localStorage.setItem(key, JSON.stringify(fresh));
      setSignal(fresh);
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isTorion, portfolioUsd]);

  useEffect(() => {
    if (!signal) return;

    if (signal.status === "active" && signal.activeUntil && signal.activeUntil <= now) {
      const completeSignal: Signal = {
        ...signal,
        status: "complete",
        resultUsd: signal.resultUsd ?? calculateResult(signal.maxLoss, signal.maxWin),
        nextScanAt: nextScanTime(),
      };

      localStorage.setItem("bullions_uranio_signal", JSON.stringify(completeSignal));

      const certs = JSON.parse(localStorage.getItem("bullions_uranio_certificates") || "[]");
      localStorage.setItem(
        "bullions_uranio_certificates",
        JSON.stringify([completeSignal, ...certs].slice(0, 6))
      );

      setSignal(completeSignal);
    }

    if (signal.status === "waiting" && signal.expiresAt <= now) {
      localStorage.setItem(
        "bullions_uranio_signal",
        JSON.stringify({ ...signal, expiresAt: 0, nextScanAt: nextScanTime() })
      );

      setTimeout(() => setSignal(null), 5000);
    }
  }, [signal, now]);

  useEffect(() => {
    if (!signal || signal.status !== "waiting") return;

    const key = `bullions_uranio_notified_${signal.signalId}`;
    if (localStorage.getItem(key)) return;

    localStorage.setItem(key, "1");
    setAlertVisible(true);

    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
for (let i = 0; i < 4; i++) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const t = audioCtx.currentTime + i * 0.55;
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(980, t);
  oscillator.frequency.setValueAtTime(620, t + 0.18);
  gainNode.gain.setValueAtTime(0.0001, t);
  gainNode.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start(t);
  oscillator.stop(t + 0.45);
}
navigator.vibrate?.([250, 120, 250, 120, 250]);
      } catch {}
    }

    const timer = setTimeout(() => setAlertVisible(false), 7000);
    return () => clearTimeout(timer);
  }, [signal, soundEnabled]);

  if (!isTorion || !signal) return null;

  const targetTime = signal.status === "active" ? signal.activeUntil || now : signal.expiresAt;
  const seconds = Math.max(0, Math.floor((targetTime - now) / 1000));
  const expired = signal.status === "waiting" && seconds <= 0;
  const minutes = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  const countdown = `${minutes}:${secs}`;

  return (
    <>
      {alertVisible && (
        <div className="fixed left-1/2 top-5 z-[9999] w-[calc(100%-28px)] max-w-[520px] -translate-x-1/2 rounded-[24px] border border-[#b6ff00]/25 bg-[#071007]/95 p-4 shadow-[0_0_80px_rgba(182,255,0,0.18)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
            Uranio alert
          </p>
          <p className="mt-1 text-lg font-black text-white">
            Rare opportunity detected
          </p>
          <p className="mt-1 text-sm text-white/45">
            Signal {signal.signalId} · Window active for 15 minutes
          </p>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[34px] border border-[#b6ff00]/15 bg-[#050705] p-6 shadow-[0_0_90px_rgba(182,255,0,0.08)]">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <UranioMark />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
                Uranio opportunity live
              </p>
              <span className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
                {signal.status === "complete" ? "Certificate ready" : "Rare event"}
              </span>

              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  localStorage.setItem("bullions_uranio_sound", next ? "on" : "off");
                }}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/45"
              >
                {soundEnabled ? "Sound on" : "Muted"}
              </button>
            </div>

            <h3 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl">
              {signal.status === "active"
                ? "Uranio active"
                : signal.status === "complete"
                  ? "Event complete"
                  : expired
                    ? "Market window closed"
                    : "Opportunity detected"}
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/52">
              {signal.status === "active"
                ? "Cross-collateral confirmed. Uranio exposure window is running."
                : signal.status === "complete"
                  ? "Uranio sequence closed. Certificate generated for this event."
                  : expired
                    ? "Uranio is searching for new opportunities."
                    : "Volume spike and volatility window detected. Uranio calculated a temporary event with defined risk limits."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/45">
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Signal {signal.signalId}</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Volume {signal.volume}%</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Max loss ${signal.maxLoss}</span>
              <span className="rounded-full bg-white/[0.04] px-3 py-1 ring-1 ring-white/[0.06]">Max upside ${signal.maxWin}</span>
            </div>
          </div>

          <div className="min-w-[220px] rounded-[26px] border border-[#b6ff00]/12 bg-[#b6ff00]/5 p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]/65">
              {signal.status === "active" ? "Active window" : signal.status === "complete" ? "Certificate" : "Window closes in"}
            </p>

            <p className={expired ? "mt-2 text-4xl font-black text-red-400" : "mt-2 text-5xl font-black text-[#b6ff00]"}>
              {signal.status === "complete"
                ? `${signal.resultUsd && signal.resultUsd >= 0 ? "+" : ""}$${signal.resultUsd || 0}`
                : expired
                  ? "EXPIRED"
                  : countdown}
            </p>

            {expired && (
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                Searching for new opportunities
              </p>
            )}

            <button
              disabled={expired}
              onClick={() => {
                if (expired) return;

                if (signal.status === "waiting") {
                  setOpen(true);
                  return;
                }

                if (signal.status === "active" || signal.status === "complete") {
                  return;
                }

                setOpen(true);
              }}
              className={expired ? "mt-5 w-full rounded-2xl bg-white/[0.08] px-6 py-4 text-sm font-black text-white/35" : "mt-5 w-full rounded-2xl bg-[#b6ff00] px-6 py-4 text-sm font-black text-black"}
            >
              {signal.status === "active"
                ? "Uranio Active"
                : signal.status === "complete"
                  ? "Certificate Ready"
                  : expired
                    ? "Market window closed"
                    : "Unlock Uranio"}
            </button>
          </div>
        </div>
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
                  Uranio events operate using cross-collateral protection. Additional collateral increases available margin during high-volatility execution windows and helps absorb temporary drawdowns while the event remains active.
                </p>

                <div className="mt-4 space-y-2 text-xs text-white/45">
                  <div className="flex justify-between">
                    <span>Collateral required</span>
                    <span className="font-semibold text-[#b6ff00]">${signal.collateral}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum downside</span>
                    <span className="font-semibold text-red-300">${signal.maxLoss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum upside</span>
                    <span className="font-semibold text-[#b6ff00]">${signal.maxWin}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
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
