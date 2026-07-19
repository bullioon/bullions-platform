"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { MT5CredentialsCard } from "@/components/v2/manager-profile/MT5CredentialsCard";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import { auth } from "@/lib/firebase";

type DeskStrategy = {
  id: string;
  name: string;
  capitalUsd: number;
  challengeStatus: string;
  accountStatus: string;
};

type DeskRuntime = {
  mt5Status: string;
  lastSyncedAt: number | null;
  totalTrades: number;
  openTrades: number;
  runtimeGrade: string | null;
};

type ExtendedStrategy = Awaited<
  ReturnType<typeof StrategyRepository.get>
> & {
  mt5?: {
    initialBalance?: number;
    accountStatus?: string;
    lastSyncAt?: number | null;
    lastSyncedAt?: number | null;
  };
  challenge?: {
    status?: string;
    tierId?: string;
  };
};

const MT5_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_MT5_DOWNLOAD_URL ||
  "https://www.metatrader5.com/en/download";

function resolveCapital(strategy: ExtendedStrategy): number {
  const tierId = strategy?.challenge?.tierId;

  if (tierId === "demo_200k") return 200000;
  if (tierId === "demo_50k") return 50000;

  const configuredCapital = Number(
    strategy?.mt5?.initialBalance || 0
  );

  return configuredCapital > 0
    ? configuredCapital
    : 50000;
}

export function TradingDesk({
  strategyId,
}: {
  strategyId: string;
}) {
  const [strategy, setStrategy] =
    useState<DeskStrategy | null>(null);

  const [runtime, setRuntime] =
    useState<DeskRuntime>({
      mt5Status: "assigned",
      lastSyncedAt: null,
      totalTrades: 0,
      openTrades: 0,
      runtimeGrade: null,
    });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    let pollId: ReturnType<typeof setInterval> | null =
      null;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!alive) return;

        if (!strategyId) {
          setError("No strategy was selected.");
          setLoading(false);
          return;
        }

        if (!user) {
          setError(
            "Log in to access your Trading Desk."
          );
          setLoading(false);
          return;
        }

        try {
          const nextStrategy =
            (await StrategyRepository.get(
              strategyId
            )) as ExtendedStrategy;

          if (!nextStrategy) {
            throw new Error("Strategy not found.");
          }

          if (
            nextStrategy.manager?.uid !== user.uid
          ) {
            throw new Error(
              "You do not own this strategy."
            );
          }

          if (!alive) return;

          setStrategy({
            id: nextStrategy.id,
            name:
              nextStrategy.identity?.name ||
              "Bullions Strategy",
            capitalUsd:
              resolveCapital(nextStrategy),
            challengeStatus: String(
              nextStrategy.challenge?.status ||
                "enrolled"
            ),
            accountStatus: String(
              nextStrategy.mt5?.accountStatus ||
                "ASSIGNED"
            ),
          });

          async function refreshRuntime() {
            try {
              const response = await fetch(
                `/api/runtime/strategy/${encodeURIComponent(
                  strategyId
                )}`,
                {
                  cache: "no-store",
                }
              );

              const data = await response.json();
              const nextRuntime = data.runtime;

              if (!alive || !nextRuntime) return;

              setRuntime({
                mt5Status: String(
                  nextRuntime.mt5?.status ||
                    "assigned"
                ),
                lastSyncedAt:
                  Number(
                    nextRuntime.performance
                      ?.lastSyncedAt || 0
                  ) || null,
                totalTrades: Number(
                  nextRuntime.performance
                    ?.totalTrades || 0
                ),
                openTrades: Number(
                  nextRuntime.performance
                    ?.openTrades || 0
                ),
                runtimeGrade:
                  nextRuntime.universe?.grade ||
                  null,
              });
            } catch {
              // Keep the last known state.
            }
          }

          await refreshRuntime();

          pollId = setInterval(
            refreshRuntime,
            8000
          );
        } catch (caught) {
          if (!alive) return;

          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load Trading Desk."
          );
        } finally {
          if (alive) setLoading(false);
        }
      }
    );

    return () => {
      alive = false;
      unsubscribe();

      if (pollId) {
        clearInterval(pollId);
      }
    };
  }, [strategyId]);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050607] text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
            Opening Trading Desk
          </p>
        </div>
      </main>
    );
  }

  if (!strategy || error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050607] px-5 text-white">
        <section className="w-full max-w-lg rounded-[30px] border border-red-500/20 bg-red-500/[0.06] p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">
            Trading Desk unavailable
          </p>

          <h1 className="mt-4 text-3xl font-black">
            We could not open your account.
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/45">
            {error}
          </p>

          <a
            href="/challenge"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-[10px] font-black uppercase tracking-[0.16em] text-black"
          >
            Return to Challenge
          </a>
        </section>
      </main>
    );
  }

  const loginDetected =
    Boolean(runtime.lastSyncedAt) ||
    runtime.mt5Status === "live";

  const firstTradeDetected =
    runtime.totalTrades > 0 ||
    runtime.openTrades > 0;

  const runtimeActive =
    firstTradeDetected &&
    runtime.mt5Status === "live" &&
    Boolean(runtime.runtimeGrade);

  const completedSteps = [
    true,
    true,
    true,
    loginDetected,
    firstTradeDetected,
    runtimeActive,
  ].filter(Boolean).length;

  const progressPct = Math.round(
    (completedSteps / 6) * 100
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-14 pt-8 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.08),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1380px]">
        <TopFloatingMenu />

        <section className="mt-6 overflow-hidden rounded-[38px] border border-white/10 bg-[#080909] shadow-[0_35px_120px_rgba(0,0,0,0.4)]">
          <header className="border-b border-white/10 px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
                  Step 3 of 4 · Trading Desk
                </p>

                <h1 className="mt-4 text-4xl font-black tracking-[-0.065em] sm:text-6xl">
                  {runtimeActive
                    ? "Your strategy is live."
                    : "Open MT5. Start trading."}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
                  {runtimeActive
                    ? "Bullions is now verifying your performance automatically."
                    : "Use the credentials below, log in to MetaTrader 5 and place your first trade. Bullions will detect everything automatically."}
                </p>
              </div>

              <span
                className={`w-fit rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] ${
                  runtimeActive
                    ? "border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00]"
                    : "border-[#d6b35a]/25 bg-[#d6b35a]/10 text-[#d6b35a]"
                }`}
              >
                {runtimeActive
                  ? "Runtime Active"
                  : "Ready to Trade"}
              </span>
            </div>
          </header>

          <div className="grid gap-5 p-6 sm:p-10 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-5">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
                      Challenge Account
                    </p>

                    <p className="mt-3 text-5xl font-black tracking-[-0.07em]">
                      $
                      {strategy.capitalUsd.toLocaleString()}
                    </p>
                  </div>

                  <p className="text-right text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                    {strategy.name}
                  </p>
                </div>
              </section>

              <section className="rounded-[28px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.04] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                      Your Progress
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      {progressPct}%
                    </p>
                  </div>

                  <p className="text-xs font-semibold text-white/35">
                    {completedSteps} of 6 complete
                  </p>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-[#b6ff00] transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                    }}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <JourneyStep
                    label="Strategy created"
                    complete
                  />

                  <JourneyStep
                    label="Challenge joined"
                    complete
                  />

                  <JourneyStep
                    label="MT5 account assigned"
                    complete
                  />

                  <JourneyStep
                    label="MT5 login detected"
                    complete={loginDetected}
                    active={!loginDetected}
                  />

                  <JourneyStep
                    label="First trade detected"
                    complete={firstTradeDetected}
                    active={
                      loginDetected &&
                      !firstTradeDetected
                    }
                  />

                  <JourneyStep
                    label="Runtime activated"
                    complete={runtimeActive}
                    active={
                      firstTradeDetected &&
                      !runtimeActive
                    }
                  />
                </div>
              </section>

              {!runtimeActive ? (
                <section className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
                    Current Mission
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-[-0.055em]">
                    {!loginDetected
                      ? "Log in to MT5."
                      : !firstTradeDetected
                        ? "Place your first trade."
                        : "Runtime is activating."}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/40">
                    This page checks your account automatically. You do not need to upload proof or contact support.
                  </p>

                  <a
                    href={MT5_DOWNLOAD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative mt-6 flex w-full items-center gap-4 overflow-hidden rounded-[24px] border border-[#168cff]/45 bg-[linear-gradient(135deg,#087fe5_0%,#0755a6_55%,#032a55_100%)] p-4 text-left shadow-[0_20px_60px_rgba(0,119,255,0.25)] transition duration-300 hover:-translate-y-0.5 hover:border-[#72c0ff]/80 hover:shadow-[0_25px_75px_rgba(0,119,255,0.38)]"
                  >
                    <span className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#71c2ff]/25 blur-3xl" />

                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[17px] border border-white/25 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.3)]">
                      <Image
                        src="/mt5.jpeg"
                        alt="MetaTrader 5"
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                      />
                    </span>

                    <span className="relative min-w-0 flex-1">
                      <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-blue-100/65">
                        MetaTrader 5
                      </span>

                      <span className="mt-1 block text-lg font-black uppercase tracking-[-0.025em] text-white">
                        Login to MT5
                      </span>

                      <span className="mt-1 block text-[10px] font-bold text-blue-100/55">
                        Use your assigned login, server and Master Password
                      </span>
                    </span>

                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-lg font-black text-white transition group-hover:translate-x-1">
                      →
                    </span>
                  </a>

                  <p className="mt-4 text-center text-[9px] font-black uppercase tracking-[0.14em] text-white/25">
                    Your credentials are available in MT5 Access
                  </p>
                </section>
              ) : (
                <section className="rounded-[28px] border border-[#b6ff00]/25 bg-[#b6ff00]/[0.06] p-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                    Next Mission
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-[-0.055em]">
                    Build your public firm.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/40">
                    Add your identity and explain your strategy before investors discover you.
                  </p>

                  <a
                    href={`/manager/profile?strategyId=${encodeURIComponent(
                      strategy.id
                    )}`}
                    className="mt-6 flex h-14 items-center justify-center rounded-full bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.18em] text-black"
                  >
                    Build My Firm
                  </a>
                </section>
              )}
            </div>

            <section className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
                  What to do now
                </p>

                <p className="mt-3 text-lg font-black">
                  1. Reveal your credentials
                </p>
                <p className="mt-2 text-lg font-black">
                  2. Log in to MetaTrader 5
                </p>
                <p className="mt-2 text-lg font-black">
                  3. Place your first trade
                </p>
              </div>

              <MT5CredentialsCard
                strategyId={strategy.id}
                strategyName={strategy.name}
              />

              <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5 text-center">
                <div className="mx-auto h-2 w-2 animate-pulse rounded-full bg-[#b6ff00]" />

                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Monitoring MT5
                </p>

                <p className="mt-2 text-xs leading-5 text-white/30">
                  This page updates automatically every eight seconds.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function JourneyStep({
  label,
  complete,
  active = false,
}: {
  label: string;
  complete: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-black ${
          complete
            ? "border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00]"
            : active
              ? "border-[#d6b35a]/30 bg-[#d6b35a]/10 text-[#d6b35a]"
              : "border-white/10 bg-white/[0.02] text-white/20"
        }`}
      >
        {complete ? "✓" : active ? "→" : "·"}
      </span>

      <p
        className={`text-sm ${
          complete
            ? "text-white/65"
            : active
              ? "font-semibold text-white"
              : "text-white/25"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
