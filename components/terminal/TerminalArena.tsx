"use client";

import { UranioCertificate } from "@/components/terminal/UranioCertificate";
import html2canvas from "html2canvas";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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
  recordPerformanceSnapshot,
  setCopyEngine,
  updateEmoji,
  type BullionsUser,
} from "@/lib/bullionsUser";
import { TerminalLeaderboard } from "@/components/terminal/TerminalLeaderboard";
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
import { SurvivalPanel } from "@/components/terminal/SurvivalPanel";
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
  const [cashModal, setCashModal] = useState<"deposit" | "withdraw" | null>(null);
  const [cashAmount, setCashAmount] = useState(0);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [network, setNetwork] = useState<"BTC" | "SOL">("SOL");
  const [txHash, setTxHash] = useState("");
  const [loginHint, setLoginHint] = useState<"deposit" | "withdraw" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showUranioResult, setShowUranioResult] = useState(false);

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

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");

    if (ref) {
      localStorage.setItem("bullions_ref", ref);
      console.log("Referral captured:", ref);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard/pulse", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!active) return;

        if (Array.isArray(data.traders) && data.traders.length > 0) {
          setTraders(data.traders);

          if (!selectedTraderId && data.traders[0]?.id) {
            setSelectedTraderId(data.traders[0].id);
          }
        }
      } catch {
        // retry silently
      }
    }

    loadLeaderboard();

    const interval = setInterval(loadLeaderboard, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedTraderId]);


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

  useEffect(() => {
    if (!userId || !engineIsActive || !copiedTrader || (user?.allocatedUsd || 0) <= 0) return;

    // Frontend live pulse stays active so BullPad feels alive.
    const interval = setInterval(async () => {
      const accountSize = user?.allocatedUsd || 0;

      const activePair = resolveTraderPair(copiedTrader);

      if (isTraditionalMarketClosed(activePair)) {
        const cryptoTrader = traders.find((t) => isCryptoPair(t.pair));

        setEvents((current) =>
          [
            cryptoTrader
              ? `MARKET CLOSED • ${activePair} paused. Crypto traders stay active on weekends: ${cryptoTrader.name}`
              : `MARKET CLOSED • ${activePair} reopens Sunday 5PM NY. Crypto markets remain open 24/7.`,
            ...current,
          ].slice(0, 6)
        );
        return;
      }
      const currentRoi =
        accountSize > 0 ? ((user?.profitUsd || 0) / accountSize) * 100 : 0;
      const tierMove = generateTierMove({
        tier,
        profitUsd: user?.profitUsd || 0,
        allocatedUsd: accountSize,
      });

      const nextState: EngineState =
        (tierMove?.state as EngineState | undefined) || resolveEngineState(currentRoi);

      setEngineState(nextState);

      const movePct =
        tierMove?.movePct ?? generateMove(nextState);

      const scaledMovePct =
        tier === "TORION"
          ? movePct * tierMultiplier(tier)
          : movePct;

      let nextMove =
        accountSize * (scaledMovePct / 100);

      const lastEngineUpdate = Number(user?.lastEngineUpdate || user?.updatedAt || 0);
      const missedTicks =
        lastEngineUpdate > 0
          ? Math.min(
              8,
              Math.max(1, Math.floor((Date.now() - lastEngineUpdate) / ENGINE_PULSE_MS))
            )
          : 1;

      if (tier !== "TORION" && missedTicks > 1) {
        nextMove = nextMove * missedTicks;
      }

      if (currentRoi > 120 && nextMove > 0) {
        nextMove = -(accountSize * ((4 + Math.random() * 10) / 100));
      }

      if (currentRoi < -35 && nextMove < 0) {
        nextMove = accountSize * ((6 + Math.random() * 12) / 100);
      }
      const stateEvents = engineEvents[nextState] || ["TORION engine updated"];
      const event = stateEvents[Math.floor(Math.random() * stateEvents.length)];

      const nextProfitUsd = (user?.profitUsd || 0) + nextMove;

      await addProfit(userId, nextMove);

      await recordPerformanceSnapshot({
        userId,
        depositedUsd: user?.depositedUsd || 0,
        profitUsd: nextProfitUsd,
      });

      setEvents((current) =>
        [
          `${nextState} • ${copiedTrader.name} ${nextMove >= 0 ? "+" : "-"}$${Math.abs(nextMove).toFixed(2)} • ${event}`,
          ...current,
        ].slice(0, 6)
      );
    }, ENGINE_PULSE_MS);

    return () => clearInterval(interval);
  }, [userId, engineIsActive, user?.allocatedUsd, user?.profitUsd, copiedTrader]);

  async function handleCopy(amount: number, traderOverride?: Trader) {
    if (!requireLogin() || !userId || !user) return;

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
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">

          <TerminalLeaderboard
            traders={traders}
            selectedTraderId={selectedTraderId}
            onSelectTrader={setSelectedTraderId}
          />
        </div>

        <div className="space-y-5">
          <ChallengeRegister />
        </div>
      </div>



      <TierOpportunity userId={userId}
        depositedUsd={activeUser.depositedUsd || 0}
        profitUsd={activeUser.profitUsd || 0}
        onDepositAmount={(amount) => {
          setCashModal("deposit");
          setCashAmount(amount);
        }}
      />

      <SurvivalPanel
        tier={tier}
        depositedUsd={activeUser.depositedUsd || 0}
        profitUsd={activeUser.profitUsd || 0}
        allocatedUsd={activeUser.allocatedUsd || 0}
        availableUsd={availableUsd}
        maxAllocationPct={maxAllocationPct(tier)}
        systemActive={activeUser.systemActive}
        enginePhase={enginePhase}
      />


      <div id="copy-terminal" className="grid scroll-mt-28 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <CopyEnginePanel
          isActive={activeUser.systemActive}
          traderName={copiedTrader?.name}
          selectedTraderName={selectedTrader?.name}
          depositedUsd={activeUser.depositedUsd}
          profitUsd={activeUser.profitUsd}
          allocatedUsd={activeUser.allocatedUsd || 0}
          onToggle={toggleEngine}
          onDisconnect={disconnectTrader}
        />

        <TerminalInvestPanel
          trader={copiedTrader || selectedTrader}
          totalInvested={availableUsd}
          estimatedProfit={activeUser.profitUsd}
          allocatedUsd={activeUser.allocatedUsd || 0}
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


      <WithdrawalModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        tier={tier}
        maxWithdrawUsd={Math.max(0, ((activeUser.depositedUsd || 0) + (activeUser.profitUsd || 0)) * (tier === "BULLION" ? 0.3 : tier === "HELLION" ? 0.3 : 1))}
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
