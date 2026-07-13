"use client";

import { UranioCertificate } from "@/components/terminal/UranioCertificate";
import html2canvas from "html2canvas";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { FundService } from "@/core/v2/services/FundService";
import { getSixMessage } from "@/lib/six";
import { mockTraders, type Trader } from "@/lib/mockTraders";
import {
  subscribeWeeklyLeaderboard,
} from "@/lib/challengeLeaderboard";
import {
  ensureBullionsUser,
  subscribeBullionsUser,
  registerCryptoDeposit,
  addProfit,
  recordDailyPerformance,
  setCopyEngine,
  updateEmoji,
  type BullionsUser,
} from "@/lib/bullionsUser";
import { TerminalLeaderboard } from "@/components/terminal/TerminalLeaderboard";
import { TraderPassport } from "@/components/trader/TraderPassport";
import { FundBuilder } from "@/components/fund/FundBuilder";
import { ProtocolPanel } from "@/components/fund/ProtocolPanel";
import { TierOpportunity } from "@/components/terminal/TierOpportunity";
import { UranioEvent } from "@/components/terminal/UranioEvent";
import { TerminalInvestPanel } from "@/components/terminal/TerminalInvestPanel";
import { TerminalChat } from "@/components/terminal/TerminalChat";
import { ChallengeRegister } from "@/components/terminal/ChallengeRegister";
import { AffiliateDashboard } from "@/components/terminal/AffiliateDashboard";
import { PerformanceChart } from "@/components/ui/PerformanceChart";
import { UserIntroCard } from "@/components/wallet/UserIntroCard";
import { CopyEnginePanel } from "@/components/terminal/CopyEnginePanel";
import { CashModal } from "@/components/terminal/CashModal";
import { createWithdrawalRequest } from "@/lib/withdrawals";
import { WithdrawalModal } from "@/components/terminal/WithdrawalModal";
import { resolveTier, maxAllocationPct } from "@/lib/tierSystem";
import {
  generateMove,
  resolveEngineState,
  engineEvents,
  engineStateConfig,
  type EngineState,
} from "@/lib/engineBehavior";

const ENGINE_PULSE_MS =
  process.env.NODE_ENV === "development" ? 8000 : 15000;




function resolveTraderPair(trader?: { id?: string; name?: string; tag?: string; pair?: string }) {
  const value = `${trader?.pair || ""} ${trader?.tag || ""} ${trader?.name || ""} ${trader?.id || ""}`.toUpperCase();
  if (value.includes("BTC")) return "BTC/USD";
  if (value.includes("ETH")) return "ETH/USD";
  if (value.includes("SOL")) return "SOL/USD";
  if (value.includes("CRYPTO")) return "CRYPTO";
  if (value.includes("XAU") || value.includes("GOLD")) return "XAU/USD";
  if (value.includes("EUR")) return "EUR/USD";
  if (value.includes("NAS")) return "NAS100";
  if (value.includes("US30")) return "US30";
  return trader?.pair || trader?.tag || "TRADITIONAL";
}
function isCryptoPair(pair?: string) {
  const value = (pair || "").toUpperCase();
  return (
    value.includes("BTC") ||
    value.includes("ETH") ||
    value.includes("SOL") ||
    value.includes("CRYPTO")
  );
}
function isTraditionalMarketClosed(pair?: string) {
  if (isCryptoPair(pair)) return false;

  const nowNy = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  const day = nowNy.getDay();
  const hour = nowNy.getHours();

  // Friday after 3pm NY
  if (day === 5 && hour >= 15) return true;

  // Saturday
  if (day === 6) return true;

  // Sunday before 5pm NY
  if (day === 0 && hour < 17) return true;

  return false;
}



function missionRankingToTrader(row: any): Trader {
  const initialBalance = Number(row.initialBalance || 0);
  const equity = Number(row.equity || initialBalance);
  const profitUsd = Number(row.profitUsd || equity - initialBalance);
  const roi = Number(row.roi || 0);

  return {
    id: String(row.id),
    name: String(row.name || "Unknown Strategy"),
    pair: String(row.market || "Multi-asset"),
    tag: String(row.engine === "AI" ? "Bullions AI" : "Verified MT5"),
    avatar: String(row.name || "ST").slice(0, 2).toUpperCase(),
    roi,
    profitUsd,
    balance: equity,
    topTrade: Number(row.profitFactor || 0) * 10,
    maxLoss: Number(row.drawdown || 0),
    strategyId: String(row.id),
    bullionsScore: Math.round(Number(row.allocatorScore || 0)),
    specialty: `${row.accountSize || "50K"} · ${row.engine || "MT5"}`,
  } as Trader;
}

function generateTierMove({
  tier,
  profitUsd,
  allocatedUsd,
}: {
  tier: "BULLION" | "HELLION" | "TORION";
  profitUsd: number;
  allocatedUsd: number;
}) {
  const roi = allocatedUsd > 0 ? (profitUsd / allocatedUsd) * 100 : 0;

  if (tier === "TORION") {
    const daySeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const regimeRoll = (daySeed * 9301 + 49297) % 100;
    const tickRoll = Math.random();

    let movePct = 0;
    let state: "STABLE" | "LOSS_DAY" | "RECOVERY" | "BREAKER" = "STABLE";

    // If Torion is insanely up, force realistic mean reversion.
    // Example: $1,000 -> $14,000 = +1300% ROI. That needs serious drawdowns.
    if (roi > 900) {
      if (tickRoll < 0.82) {
        movePct = -(1.8 + Math.random() * 4.2);
        state = "BREAKER";
      } else if (tickRoll < 0.95) {
        movePct = -(0.2 + Math.random() * 0.8);
        state = "LOSS_DAY";
      } else {
        movePct = 0.3 + Math.random() * 1.4;
        state = "RECOVERY";
      }

      return {
        movePct: Number(movePct.toFixed(2)),
        state,
      };
    }

    if (roi > 350) {
      if (tickRoll < 0.72) {
        movePct = -(0.9 + Math.random() * 2.6);
        state = "LOSS_DAY";
      } else if (tickRoll < 0.9) {
        movePct = Math.random() * 0.4 - 0.25;
        state = "STABLE";
      } else {
        movePct = 0.25 + Math.random() * 1.1;
        state = "RECOVERY";
      }

      return {
        movePct: Number(movePct.toFixed(2)),
        state,
      };
    }

    // Automatic market regimes by day.
    // 0-20: Bull, 20-55: Range, 55-85: Bear, 85-100: Panic.
    if (regimeRoll < 20) {
      if (tickRoll < 0.65) {
        movePct = 0.25 + Math.random() * 1.2;
        state = "RECOVERY";
      } else {
        movePct = -(0.15 + Math.random() * 0.7);
        state = "LOSS_DAY";
      }
    } else if (regimeRoll < 55) {
      movePct = Math.random() * 0.7 - 0.35;
      state = Math.abs(movePct) < 0.15 ? "STABLE" : movePct > 0 ? "RECOVERY" : "LOSS_DAY";
    } else if (regimeRoll < 85) {
      if (tickRoll < 0.7) {
        movePct = -(0.35 + Math.random() * 1.6);
        state = "LOSS_DAY";
      } else {
        movePct = 0.15 + Math.random() * 0.7;
        state = "RECOVERY";
      }
    } else {
      if (tickRoll < 0.88) {
        movePct = -(1.2 + Math.random() * 3.8);
        state = "BREAKER";
      } else {
        movePct = 0.25 + Math.random() * 1.2;
        state = "RECOVERY";
      }
    }

    return {
      movePct: Number(movePct.toFixed(2)),
      state,
    };
  }

  const isBullion = tier === "BULLION";

  const recoveryMode = isBullion ? roi < -7 : roi < -12;

  const winChance = recoveryMode
    ? isBullion
      ? 0.8
      : 0.7
    : isBullion
      ? 0.65
      : 0.6;

  const positive = Math.random() < winChance;

  let movePct = 0;

  if (positive) {
    movePct = isBullion
      ? 0.3 + Math.random() * 0.9
      : 0.6 + Math.random() * 1.4;
  } else {
    movePct = isBullion
      ? -(0.2 + Math.random() * 0.5)
      : -(0.4 + Math.random() * 1.1);
  }

  // drawdown protection
  if (isBullion && roi < -15 && movePct < 0) {
    movePct = 0.2 + Math.random() * 0.5;
  }

  if (!isBullion && roi < -25 && movePct < 0) {
    movePct = 0.4 + Math.random() * 0.9;
  }

  return {
    movePct: Number(movePct.toFixed(2)),
    state: recoveryMode ? "RECOVERY" : positive ? "STABLE" : "LOSS_DAY",
  };
}


function tierMultiplier(tier: "BULLION" | "HELLION" | "TORION") {
  switch (tier) {
    case "BULLION":
      return 1.05;

    case "HELLION":
      return 1.25;

    case "TORION":
      return 1.0;
  }
}

const guestUser: BullionsUser = {
  name: "Guest",
  username: "guest",
  email: "",
  emoji: "💀",
  depositedUsd: 0,
  profitUsd: 0,
  allocatedUsd: 0,
  maxLossUsd: 10,
  copiedTraderId: null,
  systemActive: false,
  dailyPerformance: [],

};

export function TerminalArena() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [user, setUser] = useState<BullionsUser | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTraderId, setSelectedTraderId] = useState("");
  const [passportOpen, setPassportOpen] = useState(false);
  const [fundTraderIds, setFundTraderIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authUser?.uid) return;

    FundService.getSelectedTraderIds(authUser.uid).then((ids) => {
      setFundTraderIds(ids);
    });
  }, [authUser?.uid]);
  const [cashModal, setCashModal] = useState<"deposit" | "withdraw" | null>(null);
  const [cashAmount, setCashAmount] = useState(0);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [network, setNetwork] = useState<"BTC" | "SOL">("SOL");
  const [txHash, setTxHash] = useState("");
  const [loginHint, setLoginHint] = useState<"deposit" | "withdraw" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showUranioResult, setShowUranioResult] = useState(false);
  const [showMt5Password, setShowMt5Password] = useState(false);
  useEffect(() => {
    if (!notice) return;

    const timeout = setTimeout(() => {
      setNotice(null);
    }, 2800);

    return () => clearTimeout(timeout);
  }, [notice]);


  const [events, setEvents] = useState<string[]>([
    "BullPad loaded in guest mode.",
    "Login to load deposits, profit and history.",
    "Copy Engine is paused.",
  ]);

  const [engineState, setEngineState] = useState<EngineState>("STABLE");

  const [enginePhase, setEnginePhase] = useState<
    "STABLE" | "EUPHORIA" | "RECOVERY" | "LOSS_DAY" | "BREAKER"
  >("STABLE");

  const userId = authUser?.uid || null;
  const activeUser = user || guestUser;
  const isLoggedIn = Boolean(authUser && user);
  const portfolioUsd = (activeUser.depositedUsd || 0) + (activeUser.profitUsd || 0);
  const tier = resolveTier(portfolioUsd);
  const maxAllocatableUsd = Number((portfolioUsd * maxAllocationPct(tier)).toFixed(2));
  const remainingAllocationRoom = Math.max(0, maxAllocatableUsd - (activeUser.allocatedUsd || 0));

  
  useEffect(() => {
    if (
      user?.uranioPosition?.status === "completed" &&
      user?.uranioPosition?.seen === false
    ) {
      setShowUranioResult(true);
    }
  }, [user]);

const availableUsd = Math.max(
    0,
    Number(
      Math.min(
        remainingAllocationRoom,
        portfolioUsd - (activeUser.allocatedUsd || 0)
      ).toFixed(2)
    )
  );

  const allocatedPrincipalUsd = Number(activeUser.allocatedUsd || 0);
  const fundEquityUsd = Number(
    Math.max(
      0,
      Number(activeUser.fundEquityUsd ?? allocatedPrincipalUsd + (activeUser.profitUsd || 0))
    ).toFixed(2)
  );
  const fundPnlUsd = Number((fundEquityUsd - allocatedPrincipalUsd).toFixed(2));

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");

    if (ref) {
      localStorage.setItem("bullions_ref", ref);
      console.log("Referral captured:", ref);
    }
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadMissionRankings() {
      try {
        const res = await fetch("/api/mission-control", { cache: "no-store" });
        const data = await res.json();

        const nextTraders = Array.isArray(data.rankings)
          ? data.rankings.map(missionRankingToTrader)
          : [];

        if (!alive) return;

        if (nextTraders.length) {
          setTraders(nextTraders);
          setSelectedTraderId((prev) => prev || nextTraders[0]?.id || "");
          return;
        }

        setTraders([]);
        setSelectedTraderId("");
      } catch (error) {
        console.warn("[BullPad] mission-control failed", error);
        if (!alive) return;
        setTraders([]);
        setSelectedTraderId("");
      }
    }

    loadMissionRankings();

    return () => {
      alive = false;
    };
  }, []);


  useEffect(() => {
    let unsubscribeUser: null | (() => void) = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthUser(firebaseUser);

      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      if (!firebaseUser) {
        setUser(null);
        return;
      }

      const referralCode =
        typeof window !== "undefined"
          ? localStorage.getItem("bullions_ref")
          : null;

      console.log("Referral before user creation:", referralCode);

      await ensureBullionsUser(firebaseUser.uid, firebaseUser.email || "", referralCode);
      unsubscribeUser = subscribeBullionsUser(firebaseUser.uid, setUser);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const selectedTrader = useMemo(
    () => traders.find((t) => t.id === selectedTraderId),
    [traders, selectedTraderId]
  );

  const copiedTrader = useMemo(
    () => traders.find((t) => t.id === activeUser.copiedTraderId),
    [traders, activeUser.copiedTraderId]
  );

  const engineIsActive = Boolean(
    activeUser.systemActive &&
      activeUser.copiedTraderId &&
      copiedTrader &&
      (activeUser.allocatedUsd || 0) > 0
  );

  function showNotice(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 4500);
  }

  function requireLogin() {
    if (!isLoggedIn) {
      setEvents((current) =>
        ["Login first to use deposits, wallet and Copy Engine.", ...current].slice(0, 6)
      );
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (!engineIsActive || !copiedTrader) return;

    const activePair = resolveTraderPair(copiedTrader);

    if (isTraditionalMarketClosed(activePair)) {
      setEvents((current) =>
        [
          `MARKET CLOSED • ${activePair} paused. Weekend crypto traders remain active.`,
          ...current,
        ].slice(0, 6)
      );
    }
  }, [engineIsActive, copiedTrader]);

  // Engine movement is handled server-side by /api/cron/engine-pulse.
  // Do not move balances from the browser.

  const fundSelectedTrader =
    copiedTrader ||
    selectedTrader ||
    traders.find((t) => t.id === fundTraderIds[0]) ||
    mockTraders.find((t) => t.id === fundTraderIds[0]) ||
    null;

  function allocationForManagerCount(count: number) {
    if (count === 1) return [100];
    if (count === 2) return tier === "BULLION" ? [100] : [70, 30];
    if (count === 3) return [40, 35, 25];
    return [];
  }

  function buildFundManagers(ids: string[]) {
    const allocationPct = allocationForManagerCount(ids.length);

    return ids.map((traderId, index) => ({
      traderId,
      allocationPct: allocationPct[index] || 0,
    }));
  }

  async function handleAddManager(traderId: string) {
    if (!traderId) return;

    const maxManagers =
      tier === "TORION" ? 3 : tier === "HELLION" ? 2 : 1;

    const nextIds = Array.from(new Set([...fundTraderIds, traderId]));

    if (nextIds.length > maxManagers) {
      setNotice(`${tier} Protocol allows up to ${maxManagers} manager${maxManagers === 1 ? "" : "s"}.`);
      return;
    }

    setFundTraderIds(nextIds);

    if (!authUser?.uid || !userId || !activeUser.fundActive || allocatedPrincipalUsd <= 0) {
      return;
    }

    const idToken = await authUser.getIdToken();

    const res = await fetch("/api/funds/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        userId,
        tier,
        capitalUsd: allocatedPrincipalUsd,
        managers: buildFundManagers(nextIds),
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      setNotice(data.error || "Could not rebalance fund.");
      return;
    }

    setNotice("Fund rebalanced.");
  }

  async function handleCopy(amount: number, traderOverride?: Trader) {
    if (!requireLogin() || !userId || !user || !authUser) return;

    const traderToCopy = traderOverride || selectedTrader;
    if (!traderToCopy || amount <= 0 || amount > availableUsd) return;

    const traderPair = resolveTraderPair(traderToCopy);

    if (isTraditionalMarketClosed(traderPair)) {
      const msg = `Market closed: ${traderPair} cannot be copied on weekends. Choose BTC/ETH/SOL traders instead.`;

      showNotice(msg);

      setEvents((current) =>
        [
          `MARKET CLOSED • ${traderPair} traders cannot be copied on weekends. Choose BTC/ETH/SOL traders instead.`,
          ...current,
        ].slice(0, 6)
      );
      return;
    }

    const activeManagers = fundTraderIds.length
      ? fundTraderIds
      : [traderToCopy.id];

    const managers = buildFundManagers(activeManagers);

    const idToken = await authUser.getIdToken();

    const fundRes = await fetch("/api/funds/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        userId,
        tier,
        capitalUsd: amount,
        managers,
      }),
    });

    const fundData = await fundRes.json();

    if (!fundData.ok) {
      setNotice(fundData.error || "Could not activate fund.");
      return;
    }

    await setCopyEngine({
      userId,
      copiedTraderId: traderToCopy.id,
      systemActive: true,
      allocationUsd: amount,
    });

    setEvents((current) =>
      [`Copy Engine connected to ${traderToCopy.name}`, "Live PnL tracking started", ...current].slice(0, 6)
    );
  }

  async function toggleEngine() {
    if (!requireLogin() || !userId || !user) return;

    if (!user.copiedTraderId && selectedTrader) {
      await setCopyEngine({
        userId,
        copiedTraderId: selectedTrader.id,
        systemActive: true,
        allocationUsd: availableUsd,
      });
      return;
    }

    const traderForToggle = traders.find((t) => t.id === (user.copiedTraderId || selectedTrader?.id));
    const traderPair = resolveTraderPair(traderForToggle || selectedTrader);

    if (!user.systemActive && isTraditionalMarketClosed(traderPair)) {
      const msg = `Market closed: ${traderPair} cannot be activated on weekends. Copy BTC/ETH/SOL traders instead.`;

      showNotice(msg);

      setEvents((current) =>
        [
          `MARKET CLOSED • ${traderPair} traders cannot be activated on weekends. Copy BTC/ETH/SOL traders instead.`,
          ...current,
        ].slice(0, 6)
      );
      return;
    }

    if (user.systemActive) {
      await recordDailyPerformance({ userId, user });
    }

    await setCopyEngine({
      userId,
      copiedTraderId: user.copiedTraderId || selectedTrader?.id || null,
      systemActive: !engineIsActive,
      allocationUsd: user.allocatedUsd || availableUsd || 0,
    });
  }

  async function disconnectTrader() {
    if (!requireLogin() || !userId || !user) return;

    if (user.depositedUsd > 0) {
      await recordDailyPerformance({ userId, user });
    }

    await setCopyEngine({
      userId,
      copiedTraderId: null,
      systemActive: false,
      allocationUsd: 0,
    });

    setEvents((current) =>
      ["Copy Engine disconnected.", ...current].slice(0, 6)
    );
  }

  return (
    <>
      {notice && (
        <div className="fixed left-1/2 top-5 z-[9999] w-[calc(100%-32px)] max-w-[560px] -translate-x-1/2 rounded-[22px] border border-[#f59e0b]/25 bg-[#1a1408]/95 px-5 py-4 text-sm font-semibold text-[#f5c27a] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {notice}
        </div>
      )}


      {showUranioResult && user?.uranioPosition && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-[40px] border border-white/10 bg-[#0b0b0b]/95 p-10 text-center shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-xl">

            <div className={`absolute inset-x-0 top-0 h-px ${
              user.uranioPosition.result === "WIN"
                ? "bg-[#b6ff00]/50"
                : "bg-red-400/40"
            }`} />

            <div className={`mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border ${
              user.uranioPosition.result === "WIN"
                ? "border-[#b6ff00]/25 bg-[#b6ff00]/10"
                : "border-red-400/20 bg-red-400/10"
            } text-5xl`}>
              {user.uranioPosition.result === "WIN" ? "☢️" : "✕"}
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-white/40">
              URANIO EVENT
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white">
              {user.uranioPosition.result === "WIN"
                ? "Opportunity Captured"
                : "Window Closed"}
            </h2>

            <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-white/55">
              {user.uranioPosition.result === "WIN"
                ? "The AI identified a profitable market inefficiency."
                : "Protection mechanisms limited exposure during the event."}
            </p>

            <p className={`mt-10 text-6xl font-black tracking-[-0.06em] ${
              user.uranioPosition.result === "WIN"
                ? "text-[#b6ff00]"
                : "text-red-400"
            }`}>
              {user.uranioPosition.result === "WIN" ? "+" : "−"}
              ${Math.abs(user.uranioPosition.payout || 0)}
            </p>

            <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/45">
              {user.uranioPosition.result === "WIN"
                ? "Credited instantly to your account"
                : "Cross-collateral protection applied"}
            </div>

            <button
              onClick={async () => {
                const node = document.getElementById("uranio-certificate");
                if (!node) return;

                const canvas = await html2canvas(node, {
                  backgroundColor: "#050705",
                  scale: 3,
                });

                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `Bullions-Uranio-${user?.uranioPosition?.result || "RESULT"}.png`;
                link.click();
                alert("Uranio result image downloaded.");
              }}
              className="mt-7 h-14 w-full rounded-2xl bg-[#5865F2] text-sm font-black text-white shadow-[0_0_45px_rgba(88,101,242,0.28)] transition hover:scale-[1.01] hover:bg-[#4752C4]"
            >
              Download Result Image
            </button>

            <button
              onClick={async () => {
                if (!userId) return;

                await updateDoc(doc(db, "users", userId), {
                  "uranioPosition.seen": true,
                  updatedAt: Date.now(),
                });

                setShowUranioResult(false);
              }}
              className="mt-10 h-14 w-full rounded-2xl bg-[#b6ff00] text-sm font-black text-black transition hover:scale-[1.01]"
            >
              Continue
            </button>

            <UranioCertificate
              result={user?.uranioPosition?.result}
              payout={user?.uranioPosition?.payout}
              signalId={user?.uranioPosition?.signalId}
              username={activeUser.username}
            />
          </div>
        </div>
      )}

      <section id="bullpad" className="mx-auto w-full max-w-[1480px] min-w-0 overflow-x-hidden scroll-mt-28 space-y-5 pb-10 px-4 sm:px-0">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <UserIntroCard
          name={activeUser.name}
          username={isLoggedIn ? authUser?.email?.split("@")[0] || activeUser.username : "guest"}
          emoji={activeUser.emoji}
          balanceUsd={activeUser.depositedUsd}
          profitUsd={activeUser.profitUsd}
          activeTrader={copiedTrader?.name}
          systemActive={activeUser.systemActive}
          engineState={engineState}
          onChangeEmoji={(emoji) => userId && updateEmoji(userId, emoji)}
          onDeposit={() => {
            if (!isLoggedIn) {
              setLoginHint("deposit");
              return;
            }

            setCashModal("deposit");
            setCashAmount(0);
          }}
          onWithdraw={() => {
            if (!isLoggedIn || !userId) {
              setLoginHint("withdraw");
              return;
            }

            setWithdrawOpen(true);
          }}
        />

        <PerformanceChart
          depositedUsd={activeUser.depositedUsd}
          profitUsd={activeUser.profitUsd}
          dailyPerformance={activeUser.dailyPerformance || []}
        />
      </div>


      {(() => {
        const topTrader = [...(traders || [])]
          .sort((a, b) => Number((b as any).bullionsScore || b.topTrade || 0) - Number((a as any).bullionsScore || a.topTrade || 0))[0];

        const six = getSixMessage({
          engineOn: Boolean(activeUser.systemActive),
          selectedManagers: fundTraderIds.length,
          copiedTraderName: copiedTrader?.name,
          depositedUsd: Number(activeUser.depositedUsd || 0),
          profitUsd: Number(activeUser.profitUsd || 0),
          topTraderName: topTrader?.name,
          hasBullionsAiAccess: false,
        });

        const toneClass =
          six.tone === "risk"
            ? "border-red-400/25 bg-red-400/10 text-red-300"
            : six.tone === "attention"
              ? "border-[#ffd23f]/25 bg-[#ffd23f]/10 text-[#ffd23f]"
              : six.tone === "opportunity"
                ? "border-[#b66dff]/25 bg-[#b66dff]/10 text-[#d8b4ff]"
                : six.tone === "achievement"
                  ? "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]"
                  : "border-white/10 bg-white/[0.035] text-white/70";

        return (
          <section className="border-y border-white/10 py-5">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex min-w-0 items-start gap-5">
                <div className="flex shrink-0 items-center gap-3 pt-1">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black ${toneClass}`}>
                    6
                  </span>

                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.24em] text-white">
                      SIX
                    </p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
                      {six.tone}
                    </p>
                  </div>
                </div>

                <div className="h-11 w-px bg-white/10" />

                <div className="min-w-0">
                  <p className="text-base font-black leading-6 text-white">
                    {six.title}
                  </p>
                  <p className="mt-1 max-w-4xl text-sm leading-6 text-white/40">
                    {six.body}
                  </p>
                </div>
              </div>

              <p className="shrink-0 text-xs font-semibold text-white/30">
                Updated 2m ago
              </p>
            </div>
          </section>
        );
      })()}

      <section className="rounded-[30px] border border-white/10 bg-[#080909] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
              MT5 Beta
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              MetaTrader Access
            </h3>
            <p className="mt-1 text-sm text-white/40">
              Some users will receive MT5 login credentials during the beta rollout.
            </p>
          </div>

          <span className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
            Beta
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">Login</p>
            <p className="mt-2 text-lg font-black text-white/60">
              {activeUser.mt5Login || "Pending"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">Server</p>
            <p className="mt-2 text-lg font-black text-white/60">
              {activeUser.mt5Server || (activeUser as any)["mt5Server "] || "Pending"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">Password</p>
            <button
              onClick={() => setShowMt5Password((v) => !v)}
              className="mt-2 text-left text-lg font-black text-white/60 hover:text-[#b6ff00]"
            >
              {showMt5Password
                ? activeUser.mt5Password || "Pending"
                : activeUser.mt5Password
                  ? "••••••••"
                  : "Pending"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">Status</p>
            <p className="mt-2 text-lg font-black text-[#b6ff00]">
              {activeUser.mt5Status === "active" ? "Active" : "Beta Queue"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <TerminalLeaderboard
          traders={traders.length ? traders : mockTraders}
          selectedTraderId={selectedTraderId}
          fundTraderIds={fundTraderIds}
          currentUserId={authUser?.uid || ""}
          currentUsername={activeUser.username || activeUser.name || ""}
          currentEmail={authUser?.email || activeUser.email || ""}
          onSelectTrader={(id) => {
            setSelectedTraderId(id);
          }}
          onAddToFund={handleAddManager}
        />

        <ChallengeRegister />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ProtocolPanel
          tier={tier}
          selectedCount={fundTraderIds.length}
          portfolioUsd={portfolioUsd}
        />

        <FundBuilder
          traders={traders.length ? traders : mockTraders}
          selectedIds={fundTraderIds}
          tier={tier}
          onAdd={handleAddManager}
          onRemove={async (traderId) => {
            if (!authUser?.uid || !userId) return;

            const idToken = await authUser.getIdToken();

            const res = await fetch("/api/funds/deallocate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                userId,
                traderId,
              }),
            });

            const data = await res.json();

            if (!res.ok || !data.ok) {
              setNotice(data.error || "Could not remove manager.");
              return;
            }

            const nextIds = Array.isArray(data.nextIds) ? data.nextIds : [];
            setFundTraderIds(nextIds);

            if (nextIds.length === 0) {
              await setCopyEngine({
                userId,
                copiedTraderId: null,
                systemActive: false,
                allocationUsd: 0,
              });
            }

            setNotice("Manager removed from your fund.");
          }}
          onActivate={async () => {
            setNotice("Use Fund Setup to deploy capital.");
          }}
        />
      </div>

      <TierOpportunity userId={userId}
        depositedUsd={activeUser.depositedUsd || 0}
        profitUsd={activeUser.profitUsd || 0}
        onDepositAmount={(amount) => {
          setCashModal("deposit");
          setCashAmount(amount);
        }}
      />

        {/* SurvivalPanel removed - merged into Fund Protocol */}


      <div id="copy-terminal" className="grid scroll-mt-28 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <CopyEnginePanel
          isActive={activeUser.systemActive}
          traderName={copiedTrader?.name}
          selectedTraderName={selectedTrader?.name}
          depositedUsd={activeUser.depositedUsd}
          profitUsd={activeUser.profitUsd}
          allocatedUsd={fundEquityUsd}
          onToggle={toggleEngine}
          onDisconnect={disconnectTrader}
        />

        <TerminalInvestPanel
          trader={fundSelectedTrader || undefined}
          fundManagers={fundTraderIds
            .map((id) => traders.find((t) => t.id === id) || mockTraders.find((t) => t.id === id))
            .filter(Boolean) as Trader[]}
          allocationMix={allocationForManagerCount(fundTraderIds.length)}
          totalInvested={availableUsd}
          estimatedProfit={fundPnlUsd}
          allocatedUsd={fundEquityUsd}
          isActive={activeUser.systemActive}
          onInvest={handleCopy}
        />
      </div>

      <AffiliateDashboard username={activeUser.username || "user"} />

      <TerminalChat events={events} userName={isLoggedIn ? activeUser.username || activeUser.name || authUser?.email?.split("@")[0] || "User" : "Guest"} />

      <p className="text-center text-[11px] leading-4 text-white/30">
        {isLoggedIn
          ? "Account loaded. Deposits and Copy Engine are connected to your profile."
          : "Guest mode: values start at zero. Login to load your real Bullions profile."}
      </p>



      <TraderPassport
        open={passportOpen}
        trader={traders.find((t) => t.id === selectedTraderId) || null}
        onClose={() => setPassportOpen(false)}
        onCopy={(traderId) => {
          setSelectedTraderId(traderId);
          setFundTraderIds((current) => {
            if (current.includes(traderId)) return current;
            if (current.length >= 3) return current;
            return [...current, traderId];
          });
          setPassportOpen(false);
          setNotice("Manager added to your fund.");
        }}
      />

      <WithdrawalModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        tier={tier}
        maxWithdrawUsd={Math.max(0, ((activeUser.depositedUsd || 0) + (activeUser.profitUsd || 0)) * (tier === "BULLION" ? 0.3 : tier === "HELLION" ? 0.3 : 0.1))}
        portfolioUsd={(activeUser.depositedUsd || 0) + (activeUser.profitUsd || 0)}
        onUpgrade={() => {
          setCashModal(null);
          setTimeout(() => setCashModal("deposit"), 80);
        }}
        userId={userId}
        systemActive={activeUser.systemActive}
        pendingWithdrawal={activeUser.pendingWithdrawal}
      />

      {loginHint && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <section className="w-full max-w-[430px] rounded-[30px] bg-[#121417] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,.75)] ring-1 ring-white/5">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#8b5cf6]/15 ring-1 ring-[#8b5cf6]/25">
              <span className="text-2xl">👻</span>
            </div>

            <h3 className="text-2xl font-semibold text-white">
              Login required
            </h3>

            <p className="mx-auto mt-3 max-w-[330px] text-sm leading-6 text-white/50">
              {loginHint === "deposit"
                ? "Create or login to your Bullions account first. Deposits are processed securely through Phantom Wallet."
                : "Create or login to your Bullions account first before requesting a withdrawal."}
            </p>

            {loginHint === "deposit" && (
              <div className="mt-5 rounded-[18px] bg-[#8b5cf6]/10 p-4 text-left ring-1 ring-[#8b5cf6]/20">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b6ff00]">
                  Powered by Phantom
                </p>
                <p className="mt-2 text-sm leading-5 text-white/60">
                  You will scan a QR or pay directly with Phantom. The wallet opens with the SOL amount and address already filled.
                </p>
              </div>
            )}

            <div className="mt-7 grid gap-3">
              <button
                onClick={() => setLoginHint(null)}
                className="h-[54px] rounded-full bg-[#b6ff00] text-sm font-semibold text-black"
              >
                Got it
              </button>

              <button
                onClick={() => setLoginHint(null)}
                className="h-[46px] rounded-full border border-white/10 text-xs font-semibold text-white/50"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {cashModal && (
        <CashModal
          type={cashModal}
          amount={cashAmount}
          network={network}
          txHash={txHash}
          onAmountChange={setCashAmount}
          onNetworkChange={setNetwork}
          onTxHashChange={setTxHash}
          onClose={() => setCashModal(null)}
          onAutoVerified={async (deposit) => {
            if (!userId) return;

            await registerCryptoDeposit({
              userId,
              network: deposit.network,
              amountUsd: deposit.amountUsd,
              amountCrypto: deposit.amountCrypto,
              txHash: deposit.txHash,
            });

            if (user?.uranioPosition?.status === "pending_deposit") {
              await updateDoc(doc(db, "users", userId), {
                "uranioPosition.status": "active",
                "uranioPosition.depositTxHash": deposit.txHash,
                "uranioPosition.activatedAt": Date.now(),
                updatedAt: Date.now(),
              });
            }

            setEvents((current) =>
              [`SOL deposit verified: ${deposit.amountCrypto.toFixed(4)} SOL`, ...current].slice(0, 6)
            );

            setTimeout(() => setCashModal(null), 1800);
          }}
        />
      )}
      </section>
    </>
  );
}

export default TerminalArena;
