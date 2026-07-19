"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import {
  subscribeBullionsUser,
  type BullionsUser,
} from "@/lib/bullionsUser";
import { resolveTier } from "@/lib/tierSystem";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import { FundService } from "@/core/v2/services/FundService";
import { NextMoveCard } from "@/components/home/NextMoveCard";
import { HomeMissionControlCard } from "@/components/home/HomeMissionControlCard";


type StrategyState = {
  id: string;
  name: string;
  challengeStatus: string;
  runtimeActive: boolean;

  roi: number;
  rank: number | null;

  initialBalanceUsd: number;
  balanceUsd: number;
  equityUsd: number;

  openTrades: number;
  totalTrades: number;

  mt5Status: string;
  lastSyncedAt: number;
} | null;

type ModuleStatus =
  | "active"
  | "available"
  | "locked"
  | "coming";

type PulseTrader = {
  id: string;
  name: string;
  tag: string;
  pair: string;
  roi: number;
  balance: number;
  maxLoss: number;
};

export function BullionsHQ({
  userId,
}: {
  userId: string;
}) {
  const [user, setUser] =
    useState<BullionsUser | null>(null);

  const [strategy, setStrategy] =
    useState<StrategyState>(null);

  const [strategyLoading, setStrategyLoading] =
    useState(true);

  const [ownedStrategyCount, setOwnedStrategyCount] =
    useState(0);

  const [authDisplayName, setAuthDisplayName] =
    useState("");

  const [fundTraderIds, setFundTraderIds] =
    useState<string[]>([]);

  const [referralCount, setReferralCount] =
    useState(0);

  const [topTrader, setTopTrader] =
    useState<PulseTrader | null>(null);

  useEffect(() => {
    return subscribeBullionsUser(
      userId,
      setUser
    );
  }, [userId]);

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        if (
          !currentUser ||
          currentUser.uid !== userId
        ) {
          setAuthDisplayName("");
          return;
        }

        setAuthDisplayName(
          currentUser.displayName?.trim() ||
            currentUser.email
              ?.split("@")[0]
              ?.trim() ||
            ""
        );
      }
    );
  }, [userId]);

  useEffect(() => {
    let alive = true;

    async function loadStrategy() {
      setStrategyLoading(true);

      try {
        const strategies =
          await StrategyRepository.listByManager(
            userId
          );

        const activeOwnedStrategies =
          strategies.filter((candidate: any) => {
            const state =
              candidate.status?.state ||
              candidate.status;

            const challengeStatus =
              candidate.challenge?.status;

            const hasActiveChallenge =
              Boolean(challengeStatus) &&
              challengeStatus !==
                "not_enrolled" &&
              challengeStatus !== "draft";

            const hasAssignedMt5 =
              Boolean(
                candidate.mt5?.accountId
              );

            return (
              state === "published" &&
              (hasActiveChallenge ||
                hasAssignedMt5)
            );
          });

        if (alive) {
          setOwnedStrategyCount(
            activeOwnedStrategies.length
          );
        }

        const selected =
          activeOwnedStrategies[0] ||
          strategies[0];

        if (!selected) {
          if (alive) {
            setStrategy(null);
          }

          return;
        }

        let runtime: any = null;

        try {
          const response = await fetch(
            `/api/runtime/strategy/${encodeURIComponent(
              selected.id
            )}`,
            {
              cache: "no-store",
            }
          );

          const payload = await response.json();

          runtime = payload.runtime || null;
        } catch {
          runtime = null;
        }

        const extended = selected as typeof selected & {
          challenge?: {
            status?: string;
            rank?: number | null;
          };
        };

        const selectedAny = selected as any;

        const runtimePerformance =
          runtime?.performance || {};

        const runtimeMt5 =
          runtime?.mt5 || {};

        if (!alive) return;

        setStrategy({
          id: selected.id,
          name:
            selected.identity?.name ||
            "Your Strategy",
          challengeStatus:
            runtime?.challenge?.status ||
            extended.challenge?.status ||
            "not_enrolled",
          runtimeActive:
            runtime?.mt5?.status === "live" &&
            Boolean(runtime?.universe?.grade),
          roi: Number(
            runtime?.performance?.roi ||
              selected.performance?.roi ||
              0
          ),
          rank:
            runtime?.challenge?.rank ??
            extended.challenge?.rank ??
            null,

          initialBalanceUsd: Number(
            runtimePerformance.initialBalance ??
              runtimeMt5.initialBalance ??
              selectedAny.performance?.initialBalance ??
              selectedAny.mt5?.initialBalance ??
              0
          ),

          balanceUsd: Number(
            runtimePerformance.balance ??
              runtimeMt5.balance ??
              selectedAny.performance?.balance ??
              selectedAny.mt5?.balance ??
              0
          ),

          equityUsd: Number(
            runtimePerformance.equity ??
              runtimeMt5.equity ??
              selectedAny.performance?.equity ??
              selectedAny.mt5?.equity ??
              0
          ),

          openTrades: Number(
            runtimePerformance.openTrades ??
              runtimeMt5.openTrades ??
              selectedAny.performance?.openTrades ??
              selectedAny.mt5?.openTrades ??
              0
          ),

          totalTrades: Number(
            runtimePerformance.totalTrades ??
              runtimeMt5.totalTrades ??
              selectedAny.performance?.totalTrades ??
              selectedAny.mt5?.totalTrades ??
              0
          ),

          mt5Status: String(
            runtimeMt5.status ??
              selectedAny.mt5?.status ??
              "offline"
          ).toLowerCase(),

          lastSyncedAt: Number(
            runtimePerformance.lastSyncedAt ??
              runtimePerformance.syncedAt ??
              runtimeMt5.lastSyncedAt ??
              runtimeMt5.lastSyncAt ??
              selectedAny.performance?.lastSyncedAt ??
              0
          ),
        });
      } finally {
        if (alive) {
          setStrategyLoading(false);
        }
      }
    }

    loadStrategy().catch(() => {
      if (alive) {
        setStrategy(null);
        setOwnedStrategyCount(0);
        setStrategyLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    let alive = true;

    FundService.getSelectedTraderIds(userId)
      .then((ids) => {
        if (alive) {
          setFundTraderIds(ids);
        }
      })
      .catch(() => {
        if (alive) {
          setFundTraderIds([]);
        }
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    let alive = true;

    fetch("/api/mission-control", {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Leaderboard unavailable");
        }

        return response.json();
      })
      .then((payload) => {
        if (!alive) return;

        const traders = Array.isArray(
          payload?.leaderboards?.investment
        )
          ? payload.leaderboards.investment
          : Array.isArray(payload?.traders)
            ? payload.traders
            : [];

        const leader = [...traders]
          .filter((trader) => {
            const mt5Live =
              String(
                trader?.mt5Status || ""
              ).toLowerCase() === "live";

            const hasActivity =
              Number(
                trader?.openTrades || 0
              ) > 0 ||
              Number(
                trader?.totalTrades || 0
              ) > 0;

            return mt5Live && hasActivity;
          })
          .sort((a, b) => {
            const roiDifference =
              Number(b?.roi || 0) -
              Number(a?.roi || 0);

            if (roiDifference !== 0) {
              return roiDifference;
            }

            return (
              Number(b?.equity || 0) -
              Number(a?.equity || 0)
            );
          })[0];

        if (!leader) {
          setTopTrader(null);
          return;
        }

        setTopTrader({
          id: String(leader.id || ""),
          name: String(leader.name || "Top Trader"),
          tag: String(
            leader.tag ||
              leader.specialty ||
              "MT5 Verified"
          ),
          pair: String(
            leader.market ||
              leader.pair ||
              "Multi Asset"
          ),
          roi: Number(leader.roi || 0),
          balance: Number(
            leader.equity ||
              leader.balance ||
              0
          ),
          maxLoss: Number(leader.maxLoss || 0),
        });
      })
      .catch(() => {
        if (alive) {
          setTopTrader(null);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.username) {
      setReferralCount(0);
      return;
    }

    const referralCode =
      user.username.trim().toLowerCase();

    if (!referralCode) return;

    const referralsQuery = query(
      collection(db, "users"),
      where("referredBy", "==", referralCode)
    );

    return onSnapshot(
      referralsQuery,
      (snapshot) => {
        setReferralCount(snapshot.size);
      },
      () => {
        setReferralCount(0);
      }
    );
  }, [user?.username]);

  if (!user) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />
      </div>
    );
  }

  const depositedUsd = Number(
    user.depositedUsd || 0
  );

  const historicalProfitUsd = Number(
    user.profitUsd || 0
  );

  /*
   * Active fund performance is stored separately from
   * the user's historical profit.
   */
  const liveFundPnlUsd = Boolean(
    user.activeFundId || user.fundActive
  )
    ? Number(user.fundPnlUsd || 0)
    : 0;

  const profitUsd = Number(
    (
      historicalProfitUsd +
      liveFundPnlUsd
    ).toFixed(2)
  );

  const portfolioUsd = Number(
    (
      depositedUsd +
      profitUsd
    ).toFixed(2)
  );

  const allocatedUsd = Number(
    user.allocatedUsd || 0
  );

  const availableUsd = Math.max(
    0,
    portfolioUsd - allocatedUsd
  );

  const pendingWithdrawalUsd = Number(
    user.pendingWithdrawal?.amountUsd || 0
  );

  const tier = resolveTier(portfolioUsd);

  const challengeJoined =
    Boolean(strategy) &&
    strategy?.challengeStatus !==
      "not_enrolled" &&
    strategy?.challengeStatus !==
      "draft";

  const profileName =
    user.name?.trim() || "";

  const profileUsername =
    user.username?.trim() || "";

  const genericNames = new Set([
    "bullions user",
    "user",
  ]);

  const resolvedName =
    !genericNames.has(
      profileName.toLowerCase()
    ) &&
    profileName
      ? profileName
      : authDisplayName ||
        (!genericNames.has(
          profileUsername.toLowerCase()
        )
          ? profileUsername
          : "") ||
        user.email?.split("@")[0] ||
        "Member";

  const firstName = resolvedName.trim();

  const activeProducts = [
    portfolioUsd > 0,
    challengeJoined,
    Boolean(user.fundActive),
  ].filter(Boolean).length;

  const sixMessage = (() => {
    if (portfolioUsd <= 0) {
      return {
        title: "Capital is waiting.",
        body:
          "Fund your BullPad to unlock portfolio intelligence and allocation guidance.",
        status: "Setup required",
      };
    }

    if (!user.fundActive) {
      return {
        title: "Your portfolio is idle.",
        body:
          "Select verified strategies and activate your first BullPad fund.",
        status: "Opportunity",
      };
    }

    if (profitUsd >= 0) {
      return {
        title: "Portfolio remains constructive.",
        body:
          "SIX is watching allocation, strategy behavior and downside exposure.",
        status: "Monitoring",
      };
    }

    return {
      title: "Risk requires attention.",
      body:
        "SIX is monitoring recovery behavior and current portfolio drawdown.",
      status: "Risk watch",
    };
  })();

  const nextAction = (() => {
    if (portfolioUsd <= 0) {
      return {
        eyebrow: "Capital required",
        title: "Fund your BullPad",
        description:
          "Add capital to begin building your Bullions portfolio.",
        href: "/bullpad",
        action: "Fund BullPad",
        status: "required" as const,
      };
    }

    if (!user.fundActive || fundTraderIds.length === 0) {
      return {
        eyebrow: "Portfolio setup",
        title: "Activate your first allocation",
        description:
          "Select verified strategies and activate your BullPad fund.",
        href: "/bullpad",
        action: "Build Portfolio",
        status: "attention" as const,
      };
    }

    if (!strategy) {
      return {
        eyebrow: "Trader opportunity",
        title: "Launch your own strategy",
        description:
          "Receive a verified MT5 account and enter the Bullions Challenge.",
        href: "/challenge",
        action: "Start Challenge",
        status: "available" as const,
      };
    }

    if (!challengeJoined) {
      return {
        eyebrow: "Challenge ready",
        title: "Enter the Bullions Challenge",
        description:
          "Your strategy exists and is ready to begin competing.",
        href: `/challenge?strategyId=${encodeURIComponent(strategy.id)}`,
        action: "Join Challenge",
        status: "available" as const,
      };
    }

    return {
      eyebrow: "Systems operational",
      title: "Your ecosystem is active",
      description:
        "BullPad, strategies and SIX monitoring are currently online.",
      href: "/bullpad",
      action: "Open BullPad",
      status: "stable" as const,
    };
  })();

  const hasTraderAccount = Boolean(
    strategy &&
      (
        strategy.runtimeActive ||
        strategy.mt5Status === "live" ||
        strategy.equityUsd > 0 ||
        (
          strategy.challengeStatus !== "not_enrolled" &&
          strategy.challengeStatus !== "draft"
        )
      )
  );

  const hasInvestorCapital =
    portfolioUsd > 0;

  const homeMode =
    hasTraderAccount && hasInvestorCapital
      ? "operator"
      : hasTraderAccount
        ? "trader"
        : "investor";

  const traderEquityUsd = Number(
    strategy?.equityUsd ||
      strategy?.balanceUsd ||
      strategy?.initialBalanceUsd ||
      0
  );

  const traderBalanceUsd = Number(
    strategy?.balanceUsd ||
      strategy?.initialBalanceUsd ||
      0
  );

  const traderAccountSizeUsd = Number(
    strategy?.initialBalanceUsd ||
      strategy?.balanceUsd ||
      0
  );

  return (
    <div className="mx-auto max-w-[1450px] space-y-6">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#050606]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(182,255,0,0.10),transparent_25%),radial-gradient(circle_at_16%_88%,rgba(122,70,255,0.10),transparent_30%),linear-gradient(to_bottom,#080909,#050606)]" />

        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full border border-[#b6ff00]/10" />
        <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full border border-[#7a46ff]/15" />

        <div className="relative z-10 px-6 pb-10 pt-8 sm:px-8">
          <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#b6ff00]" />

                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
                  Bullions Live
                </span>
              </div>

              <div className="mt-7 flex min-w-0 items-center gap-5 sm:gap-7">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[22px] border border-[#b6ff00]/25 bg-[linear-gradient(135deg,rgba(182,255,0,0.18),rgba(122,70,255,0.24))] text-3xl font-black uppercase text-white shadow-[0_0_50px_rgba(122,70,255,0.16)] sm:h-20 sm:w-20">
                  {firstName.slice(0, 1)}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/30">
                    {homeMode === "operator"
                      ? "Bullions Operator"
                      : homeMode === "trader"
                        ? "Bullions Trader"
                        : "Bullions Member"}
                  </p>

                  <h1 className="mt-2 max-w-full break-words text-[clamp(2.7rem,6vw,5.5rem)] font-black leading-[0.95] tracking-[-0.065em]">
                    {firstName}
                  </h1>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                  {homeMode === "trader"
                    ? "Live MT5 Equity"
                    : homeMode === "operator"
                      ? "Investor Capital"
                      : "Total Portfolio"}
                </p>

                <p className="mt-2 text-5xl font-black tracking-[-0.075em] text-white sm:text-7xl">
                  {homeMode === "trader"
                    ? money(traderEquityUsd)
                    : money(portfolioUsd)}
                </p>

                {homeMode === "trader" ? (
                  <p className="mt-3 text-sm font-bold text-white/35">
                    {strategy?.name || "Your Strategy"} · Verified MT5 account
                  </p>
                ) : null}
              </div>

              {homeMode === "trader" ? (
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/[0.08] pt-6">
                  <HeroDetail
                    label="ROI"
                    value={
                      strategy
                        ? signedPercent(strategy.roi)
                        : "—"
                    }
                    accent={
                      Number(strategy?.roi || 0) >= 0
                    }
                  />

                  <div className="h-9 w-px bg-white/[0.08]" />

                  <HeroDetail
                    label="Rank"
                    value={
                      strategy?.rank
                        ? `#${strategy.rank}`
                        : "Pending"
                    }
                  />

                  <div className="h-9 w-px bg-white/[0.08]" />

                  <HeroDetail
                    label="Open Positions"
                    value={`${strategy?.openTrades || 0}`}
                  />
                </div>
              ) : (
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/[0.08] pt-6">
                  <HeroDetail
                    label="Tier"
                    value={tier}
                  />

                  <div className="h-9 w-px bg-white/[0.08]" />

                  <HeroDetail
                    label="Products"
                    value={`${activeProducts} Active`}
                  />

                  <div className="h-9 w-px bg-white/[0.08]" />

                  <HeroDetail
                    label="Allocations"
                    value={`${fundTraderIds.length}`}
                  />
                </div>
              )}
            </div>

            {hasTraderAccount ? (
              <div className="w-full max-w-[430px] overflow-hidden rounded-[30px] border border-[#b6ff00]/15 bg-black/35 backdrop-blur-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                        {homeMode === "operator"
                          ? "Trader Account"
                          : "Challenge Live"}
                      </p>

                      <h2 className="mt-3 truncate text-3xl font-black tracking-[-0.05em] text-white">
                        {strategy?.name || "Your Strategy"}
                      </h2>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-2 text-[8px] font-black uppercase tracking-[0.15em] text-[#b6ff00]">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b6ff00]" />
                      MT5 Live
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/35">
                    Verified Challenge performance and live account activity.
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-4">
                      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                        {homeMode === "operator"
                          ? "Live Equity"
                          : "Account Size"}
                      </p>

                      <p className="mt-2 text-xl font-black text-white">
                        {homeMode === "operator"
                          ? money(traderEquityUsd)
                          : money(traderAccountSizeUsd)}
                      </p>
                    </div>

                    <div className="rounded-[20px] border border-[#b6ff00]/15 bg-[#b6ff00]/[0.06] p-4">
                      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                        {homeMode === "operator"
                          ? "Live ROI"
                          : "Balance"}
                      </p>

                      <p className="mt-2 text-xl font-black text-[#b6ff00]">
                        {homeMode === "operator"
                          ? strategy
                            ? signedPercent(strategy.roi)
                            : "—"
                          : money(traderBalanceUsd)}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="/firm"
                  className="flex h-16 w-full items-center justify-between border-t border-white/[0.08] px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#b6ff00] hover:text-black"
                >
                  <span>Open Trading Desk</span>
                  <span>→</span>
                </a>
              </div>
            ) : (
              <div className="w-full max-w-[390px] overflow-hidden rounded-[30px] border border-white/10 bg-black/35 backdrop-blur-xl">
                <div className="p-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                    BullPad
                  </p>

                  <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                    Your capital workspace
                  </h2>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/35">
                    Monitor your live portfolio, allocations and strategy performance.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-4">
                      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                        Available
                      </p>

                      <p className="mt-2 text-xl font-black text-white">
                        {money(availableUsd)}
                      </p>
                    </div>

                    <div className="rounded-[20px] border border-[#b6ff00]/15 bg-[#b6ff00]/[0.06] p-4">
                      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                        Profit
                      </p>

                      <p
                        className={
                          profitUsd >= 0
                            ? "mt-2 text-xl font-black text-[#b6ff00]"
                            : "mt-2 text-xl font-black text-red-400"
                        }
                      >
                        {profitUsd >= 0 ? "+" : ""}
                        {money(profitUsd)}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="/bullpad"
                  className="flex h-16 w-full items-center justify-between border-t border-white/[0.08] px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#b6ff00] hover:text-black"
                >
                  <span>Open BullPad</span>
                  <span>→</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {challengeJoined && strategy ? (
        <HomeMissionControlCard strategy={strategy} />
      ) : null}


      <section className="relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-[#080909]">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#b6ff00]/[0.07] blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#b6ff00] text-[10px] font-black text-black">
                01
              </span>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
                  Strategy Universe
                </p>

                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/25">
                  Current leader
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/[0.07] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.17em] text-[#b6ff00]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b6ff00]" />
              MT5 Live
            </span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex min-w-0 items-center gap-5">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.08] text-2xl font-black uppercase text-[#b6ff00]">
                {(topTrader?.name || "T").slice(0, 1)}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
                  {topTrader?.name || "Leaderboard syncing"}
                </h2>

                <p className="mt-2 text-sm font-medium text-white/35">
                  {topTrader
                    ? `${topTrader.pair} · Verified performance`
                    : "Reading live MT5 performance"}
                </p>
              </div>
            </div>

            <div className="lg:text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
                Live ROI
              </p>

              <p
                className={
                  topTrader && topTrader.roi < 0
                    ? "mt-2 text-5xl font-black tracking-[-0.07em] text-red-400"
                    : "mt-2 text-5xl font-black tracking-[-0.07em] text-[#b6ff00]"
                }
              >
                {topTrader
                  ? signedPercent(topTrader.roi)
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/[0.07] bg-white/[0.018] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/25">
                  Live Equity
                </p>

                <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">
                  {topTrader
                    ? money(topTrader.balance)
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/25">
                  Market
                </p>

                <p className="mt-2 text-sm font-black text-white/70">
                  {topTrader?.pair || "—"}
                </p>
              </div>
            </div>

            <a
              href="/discover"
              className="inline-flex h-13 items-center justify-between gap-8 rounded-2xl bg-[#b6ff00] px-6 text-[10px] font-black uppercase tracking-[0.17em] text-black transition hover:scale-[1.01] hover:bg-[#c7ff42]"
            >
              <span>Discover & Copy</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>


      <section>
        <NextMoveCard
          nextAction={nextAction}
          strategy={strategy}
          challengeJoined={challengeJoined}
          strategyLoading={strategyLoading}
          portfolioUsd={portfolioUsd}
          fundTraderCount={fundTraderIds.length}
          fundActive={Boolean(user.fundActive)}
        />
      </section>

      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/25">
            Core Products
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl">
            Your Bullions ecosystem
          </h2>
        </div>

        <p className="hidden max-w-sm text-right text-sm leading-6 text-white/30 md:block">
          Two products. One capital identity.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="group relative overflow-hidden rounded-[32px] border border-[#b6ff00]/15 bg-[#080909]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#b6ff00]/[0.08] blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[15px] border border-[#b6ff00]/20 bg-[#b6ff00]/10 text-xs font-black text-[#b6ff00]">
                  BP
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.23em] text-[#b6ff00]">
                    BullPad
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    Investment portfolio
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/[0.07] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-[#b6ff00]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b6ff00]" />
                {user.fundActive
                  ? "Live"
                  : portfolioUsd > 0
                    ? "Ready"
                    : "Setup"}
              </span>
            </div>

            <div className="mt-10">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
                Portfolio Value
              </p>

              <p className="mt-2 text-5xl font-black tracking-[-0.07em] text-white sm:text-6xl">
                {money(portfolioUsd)}
              </p>

              <p
                className={
                  profitUsd >= 0
                    ? "mt-3 text-sm font-black text-[#b6ff00]"
                    : "mt-3 text-sm font-black text-red-400"
                }
              >
                {profitUsd >= 0 ? "+" : ""}
                {money(profitUsd)} total profit
              </p>
            </div>
          </div>

          <div className="relative flex flex-col gap-5 border-t border-white/[0.07] bg-white/[0.018] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  Available
                </p>

                <p className="mt-1 text-sm font-black text-white/70">
                  {money(availableUsd)}
                </p>
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  Allocations
                </p>

                <p className="mt-1 text-sm font-black text-white/70">
                  {fundTraderIds.length}
                </p>
              </div>
            </div>

            <a
              href="/bullpad"
              className="inline-flex h-12 items-center justify-between gap-8 rounded-2xl bg-[#b6ff00] px-5 text-[9px] font-black uppercase tracking-[0.17em] text-black transition group-hover:bg-[#c7ff42]"
            >
              <span>Open BullPad</span>
              <span>→</span>
            </a>
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-[32px] border border-[#7a46ff]/20 bg-[#080909]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#7a46ff]/[0.13] blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[15px] border border-[#7a46ff]/25 bg-[#7a46ff]/10 text-xs font-black text-[#c7b3ff]">
                  CH
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.23em] text-[#a985ff]">
                    Challenge
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    Trader workspace
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-[#7a46ff]/20 bg-[#7a46ff]/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-[#c7b3ff]">
                {strategyLoading
                  ? "Syncing"
                  : strategy?.runtimeActive
                    ? "MT5 Live"
                    : challengeJoined
                      ? "Active"
                      : "Available"}
              </span>
            </div>

            <div className="mt-10">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
                Your Strategy
              </p>

              <h3 className="mt-3 truncate text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
                {strategyLoading
                  ? "Loading..."
                  : strategy
                    ? strategy.name
                    : "Launch Strategy"}
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/35">
                {strategy
                  ? challengeJoined
                    ? "Competing with verified MT5 performance."
                    : "Ready to enter the Bullions Challenge."
                  : "Build a verified public trading track record."}
              </p>
            </div>
          </div>

          <div className="relative flex flex-col gap-5 border-t border-white/[0.07] bg-white/[0.018] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  ROI
                </p>

                <p
                  className={
                    Number(strategy?.roi || 0) >= 0
                      ? "mt-1 text-sm font-black text-[#b6ff00]"
                      : "mt-1 text-sm font-black text-red-400"
                  }
                >
                  {strategy
                    ? signedPercent(strategy.roi)
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  Rank
                </p>

                <p className="mt-1 text-sm font-black text-white/70">
                  {strategy?.rank
                    ? `#${strategy.rank}`
                    : "Pending"}
                </p>
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  Runtime
                </p>

                <p className="mt-1 text-sm font-black text-white/70">
                  {strategy?.runtimeActive
                    ? "Verified"
                    : "Pending"}
                </p>
              </div>
            </div>

            <a
              href={
                strategy
                  ? challengeJoined
                    ? "/firm"
                    : `/challenge?strategyId=${encodeURIComponent(
                        strategy.id
                      )}`
                  : "/challenge"
              }
              className="inline-flex h-12 items-center justify-between gap-8 rounded-2xl border border-[#7a46ff]/30 bg-[#7a46ff]/10 px-5 text-[9px] font-black uppercase tracking-[0.17em] text-[#d7c9ff] transition group-hover:bg-[#7a46ff] group-hover:text-white"
            >
              <span>
                {!strategy
                  ? "Start Challenge"
                  : challengeJoined
                    ? "Open Firm"
                    : "Join Challenge"}
              </span>

              <span>→</span>
            </a>
          </div>
        </article>
      </section>

      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/25">
            Control Center
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl">
            Your essential tools
          </h2>
        </div>

        <p className="hidden max-w-sm text-right text-sm leading-6 text-white/30 md:block">
          Money, intelligence and growth at a glance.
        </p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.12fr_1fr_0.88fr]">
        <article className="group relative overflow-hidden rounded-[32px] border border-[#b6ff00]/15 bg-[#080909]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#b6ff00]/[0.08] blur-3xl" />

          <div className="relative p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[10px] font-black text-[#b6ff00]">
                  WA
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#b6ff00]">
                    Wallet
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    Available capital
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.17em] text-[#b6ff00]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b6ff00]" />
                Ready
              </span>
            </div>

            <div className="mt-9">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
                Available
              </p>

              <p className="mt-2 text-5xl font-black tracking-[-0.07em] text-white">
                {money(availableUsd)}
              </p>
            </div>

            <div className="mt-8 flex gap-8 border-t border-white/[0.07] pt-5">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  Deposited
                </p>

                <p className="mt-2 text-sm font-black text-white/65">
                  {money(depositedUsd)}
                </p>
              </div>

              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  Pending
                </p>

                <p className="mt-2 text-sm font-black text-white/65">
                  {money(pendingWithdrawalUsd)}
                </p>
              </div>
            </div>
          </div>

          <a
            href="/bullpad"
            className="relative flex h-14 items-center justify-between border-t border-white/[0.07] px-6 text-[9px] font-black uppercase tracking-[0.18em] text-white/60 transition hover:bg-[#b6ff00] hover:text-black"
          >
            <span>Manage Wallet</span>
            <span>→</span>
          </a>
        </article>

        <article className="group relative overflow-hidden rounded-[32px] border border-[#7a46ff]/20 bg-[#080909]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7a46ff]/[0.15] blur-3xl" />

          <div className="relative flex h-full min-h-[310px] flex-col p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-[#7a46ff]/25 bg-[#7a46ff]/10 text-[10px] font-black text-[#c7b3ff]">
                  6X
                </div>

                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#a985ff]">
                  SIX Intelligence
                </p>
              </div>

              <span className="rounded-full border border-[#7a46ff]/20 bg-[#7a46ff]/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#c7b3ff]">
                {sixMessage.status}
              </span>
            </div>

            <div className="my-auto py-8">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/20">
                Current assessment
              </p>

              <h3 className="mt-3 text-3xl font-black tracking-[-0.055em] text-white">
                {sixMessage.title}
              </h3>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/40">
                {sixMessage.body}
              </p>
            </div>

            <a
              href="/bullpad"
              className="flex h-12 items-center justify-between rounded-2xl border border-[#7a46ff]/25 bg-[#7a46ff]/10 px-5 text-[9px] font-black uppercase tracking-[0.17em] text-[#d5c8ff] transition group-hover:bg-[#7a46ff] group-hover:text-white"
            >
              <span>Open Intelligence</span>
              <span>→</span>
            </a>
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-[#080909]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/[0.04] blur-3xl" />

          <div className="relative flex h-full min-h-[310px] flex-col p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-white/10 bg-white/[0.04] text-[10px] font-black text-white/60">
                NW
              </div>

              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">
                Network
              </p>
            </div>

            <div className="my-auto py-8">
              <p className="text-5xl font-black tracking-[-0.07em] text-white">
                {referralCount}
              </p>

              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                Referrals
              </p>
            </div>

            <div className="rounded-[20px] border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                Referral code
              </p>

              <p className="mt-2 truncate text-sm font-black text-white/70">
                {user.username || "Not configured"}
              </p>
            </div>

            <a
              href="/bullpad"
              className="mt-4 flex h-12 items-center justify-between rounded-2xl border border-white/10 px-5 text-[9px] font-black uppercase tracking-[0.17em] text-white/50 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
            >
              <span>Open Network</span>
              <span>→</span>
            </a>
          </div>
        </article>
      </section>

      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/25">
            Bullions OS
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl">
            Expand when you are ready
          </h2>
        </div>

        <p className="hidden max-w-sm text-right text-sm leading-6 text-white/30 md:block">
          Add new capabilities without complicating your core experience.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
        <article className="group relative overflow-hidden rounded-[34px] border border-[#b6ff00]/15 bg-[#080909]">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#b6ff00]/[0.09] blur-3xl" />

          <div className="relative flex min-h-[360px] flex-col p-7 sm:p-9">
            <div className="flex items-start justify-between gap-5">
              <div className="grid h-14 w-14 place-items-center rounded-[19px] border border-[#b6ff00]/20 bg-[#b6ff00]/10 text-sm font-black text-[#b6ff00]">
                UR
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/[0.07] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#b6ff00]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b6ff00]" />

                {user.uranioPosition?.active
                  ? "Active"
                  : "Available"}
              </span>
            </div>

            <div className="my-auto py-10">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                Featured Module
              </p>

              <h3 className="mt-4 text-5xl font-black tracking-[-0.07em] text-white sm:text-6xl">
                Uranio
              </h3>

              <p className="mt-4 max-w-lg text-sm leading-6 text-white/40">
                Access asymmetric, event-driven opportunities from inside your Bullions ecosystem.
              </p>
            </div>

            <div className="flex flex-col gap-5 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                  Access
                </p>

                <p className="mt-2 text-sm font-black text-white/70">
                  BullPad integrated
                </p>
              </div>

              <a
                href="/bullpad"
                className="inline-flex h-13 items-center justify-between gap-10 rounded-2xl bg-[#b6ff00] px-6 text-[9px] font-black uppercase tracking-[0.17em] text-black transition group-hover:bg-[#c7ff42]"
              >
                <span>
                  {user.uranioPosition?.active
                    ? "Open Uranio"
                    : "Explore Uranio"}
                </span>

                <span>→</span>
              </a>
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-[34px] border border-white/[0.09] bg-[#080909]">
          <div className="border-b border-white/[0.07] p-7">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
              Roadmap
            </p>

            <h3 className="mt-3 text-2xl font-black tracking-[-0.05em] text-white">
              Coming to Bullions OS
            </h3>
          </div>

          <div className="divide-y divide-white/[0.07]">
            <div className="group flex items-center gap-4 p-6 transition hover:bg-white/[0.025]">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] border border-[#7a46ff]/20 bg-[#7a46ff]/10 text-[9px] font-black text-[#c7b3ff]">
                AI
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-base font-black text-white">
                  Bullions AI
                </h4>

                <p className="mt-1 text-xs text-white/30">
                  Advanced portfolio intelligence
                </p>
              </div>

              <span className="rounded-full border border-[#7a46ff]/20 bg-[#7a46ff]/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#c7b3ff]">
                Coming
              </span>
            </div>

            <div className="group flex items-center gap-4 p-6 transition hover:bg-white/[0.025]">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] border border-white/10 bg-white/[0.04] text-[9px] font-black text-white/50">
                AC
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-base font-black text-white">
                  Academy
                </h4>

                <p className="mt-1 text-xs text-white/30">
                  Trading and capital education
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
                Coming
              </span>
            </div>

            <div className="group flex items-center gap-4 p-6 transition hover:bg-white/[0.025]">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] border border-white/10 bg-white/[0.04] text-[9px] font-black text-white/50">
                API
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-base font-black text-white">
                  Developer API
                </h4>

                <p className="mt-1 text-xs text-white/30">
                  Connect external systems
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/35">
                Locked
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function HeroDetail({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p
        className={
          accent
            ? "mt-2 text-sm font-black text-[#b6ff00]"
            : "mt-2 text-sm font-black text-white/75"
        }
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] sm:text-3xl">
          {title}
        </h2>
      </div>

      {description ? (
        <p className="max-w-md text-xs leading-5 text-white/30">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ProductCard({
  eyebrow,
  title,
  description,
  href,
  action,
  status,
  featured = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  action: string;
  status: string;
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[34px] border p-7 transition duration-300 sm:p-8 ${
        featured
          ? "border-[#b6ff00]/30 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.12),transparent_38%),#080909]"
          : "border-white/10 bg-[#080909]"
      }`}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            {eyebrow}
          </p>

          <h3 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
            {title}
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-white/35">
            {description}
          </p>
        </div>

        <StatusBadge value={status} />
      </div>

      <div className="mt-9 grid grid-cols-3 gap-3">
        {children}
      </div>

      <a
        href={href}
        className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition group-hover:text-[#b6ff00]"
      >
        {action}
        <span>→</span>
      </a>
    </article>
  );
}

function ToolCard({
  eyebrow,
  title,
  description,
  href,
  action,
  badge,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  action: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="group rounded-[30px] border border-white/10 bg-[#080909] p-7 transition hover:border-[#b6ff00]/30">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[9px] font-black uppercase tracking-[0.27em] text-[#b6ff00]">
          {eyebrow}
        </p>

        {badge ? (
          <StatusBadge value={badge} />
        ) : null}
      </div>

      <h3 className="mt-5 text-2xl font-black tracking-[-0.045em]">
        {title}
      </h3>

      <p className="mt-3 min-h-12 text-xs leading-5 text-white/35">
        {description}
      </p>

      {children ? (
        <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
          {children}
        </div>
      ) : null}

      <a
        href={href}
        className="mt-7 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.18em] text-white/50 transition group-hover:text-[#b6ff00]"
      >
        {action}
        <span>→</span>
      </a>
    </article>
  );
}

function ModuleCard({
  name,
  description,
  status,
  href,
}: {
  name: string;
  description: string;
  status: ModuleStatus;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg">
          {moduleIcon(name)}
        </div>

        <ModuleBadge status={status} />
      </div>

      <h3 className="mt-7 text-xl font-black tracking-[-0.04em]">
        {name}
      </h3>

      <p className="mt-2 min-h-10 text-xs leading-5 text-white/30">
        {description}
      </p>

      <div className="mt-6 text-[9px] font-black uppercase tracking-[0.17em] text-white/35">
        {status === "active"
          ? "Open →"
          : status === "available"
            ? "Explore →"
            : status === "locked"
              ? "Locked"
              : "Coming Soon"}
      </div>
    </>
  );

  const className =
    "rounded-[28px] border border-white/10 bg-[#080909] p-6 transition hover:border-[#b6ff00]/25";

  return href &&
    (status === "active" ||
      status === "available") ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <article className={className}>
      {content}
    </article>
  );
}

function ActionStatus({
  status,
}: {
  status: "required" | "attention" | "available" | "stable";
}) {
  const label = {
    required: "Action required",
    attention: "Needs attention",
    available: "Available",
    stable: "Operational",
  }[status];

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[7px] font-black uppercase tracking-[0.16em] ${
        status === "stable"
          ? "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]"
          : status === "available"
            ? "border-white/15 bg-white/[0.04] text-white/60"
            : "border-[#b6ff00]/25 bg-[#b6ff00]/[0.07] text-[#b6ff00]"
      }`}
    >
      {label}
    </span>
  );
}

function SystemRow({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-white/[0.07] pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? "bg-[#b6ff00] shadow-[0_0_10px_rgba(182,255,0,0.65)]"
              : "bg-white/20"
          }`}
        />

        <span className="text-xs font-bold text-white/55">
          {label}
        </span>
      </div>

      <span
        className={`text-[8px] font-black uppercase tracking-[0.15em] ${
          active ? "text-[#b6ff00]" : "text-white/30"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-[#111] via-[#0b0b0b] to-black p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#b6ff00]/40">

      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#b6ff00]/10 blur-2xl" />

      <div className="relative flex items-center justify-between">

        <div>

          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">
            {label}
          </p>

          <p className="mt-3 text-2xl font-black">
            {value}
          </p>

        </div>

      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p
        className={`mt-2 truncate text-sm font-black sm:text-base ${
          positive
            ? "text-[#b6ff00]"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SmallRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="text-white/30">
        {label}
      </span>

      <span className="max-w-[55%] truncate font-bold text-white/70">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="shrink-0 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/[0.07] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#b6ff00]">
      {value}
    </span>
  );
}

function ModuleBadge({
  status,
}: {
  status: ModuleStatus;
}) {
  const label = {
    active: "Active",
    available: "Available",
    locked: "Locked",
    coming: "Coming Soon",
  }[status];

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[7px] font-black uppercase tracking-[0.15em] ${
        status === "active"
          ? "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]"
          : status === "available"
            ? "border-white/15 bg-white/[0.04] text-white/60"
            : "border-white/10 bg-white/[0.02] text-white/25"
      }`}
    >
      {label}
    </span>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function signedMoney(value: number) {
  return `${value >= 0 ? "+" : "-"}${money(
    Math.abs(value)
  )}`;
}

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(
    2
  )}%`;
}

function moduleIcon(name: string) {
  if (name === "Uranio") return "☢";
  if (name === "Bullions AI") return "✦";
  if (name === "Academy") return "A";
  return "</>";
}
