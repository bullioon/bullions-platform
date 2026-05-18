"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
import { TerminalInvestPanel } from "@/components/terminal/TerminalInvestPanel";
import { TerminalChat } from "@/components/terminal/TerminalChat";
import { ChallengeRegister } from "@/components/terminal/ChallengeRegister";
import { PerformanceChart } from "@/components/ui/PerformanceChart";
import { UserIntroCard } from "@/components/wallet/UserIntroCard";
import { CopyEnginePanel } from "@/components/terminal/CopyEnginePanel";
import { CashModal } from "@/components/terminal/CashModal";

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
  const [network, setNetwork] = useState<"BTC" | "SOL">("SOL");
  const [txHash, setTxHash] = useState("");
  const [loginHint, setLoginHint] = useState<"deposit" | "withdraw" | null>(null);

  const [events, setEvents] = useState<string[]>([
    "BullPad loaded in guest mode.",
    "Login to load deposits, profit and history.",
    "Copy Engine is paused.",
  ]);

  const userId = authUser?.uid || null;
  const activeUser = user || guestUser;
  const isLoggedIn = Boolean(authUser && user);
  const availableUsd = Math.max(
    0,
    Number(
      (
        (activeUser.depositedUsd || 0) +
        (activeUser.profitUsd || 0) -
        (activeUser.allocatedUsd || 0)
      ).toFixed(2)
    )
  );

  useEffect(() => {
    let unsub: null | (() => void) = null;

    async function startWeeklyLeaderboard() {
      unsub = subscribeWeeklyLeaderboard((liveTraders) => {
        setTraders(liveTraders);

        if (liveTraders[0]?.id && !selectedTraderId) {
          setSelectedTraderId(liveTraders[0].id);
        }
      });
    }

    startWeeklyLeaderboard();

    fetch("/api/leaderboard/pulse").catch(console.error);

    const pulse = setInterval(() => {
      fetch("/api/leaderboard/pulse").catch(console.error);
    }, 45000);

    return () => {
      if (unsub) unsub();
      clearInterval(pulse);
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

      await ensureBullionsUser(firebaseUser.uid, firebaseUser.email || "");
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
    if (!userId || !user?.systemActive || !copiedTrader || (user.allocatedUsd || 0) <= 0) return;

    const interval = setInterval(async () => {
      const accountSize = user.allocatedUsd || 0;
      const traderStrength = Math.min(1.2, Math.max(0.55, copiedTrader.roi / 60));
      const riskControl = Math.max(0.45, 1 - copiedTrader.maxLoss / 35);

      const hour = new Date().getHours();
      const bucket = hour % 6;

      let regime:
        | "consolidation"
        | "trend"
        | "pullback"
        | "breakout"
        | "volatile";

      if (bucket === 0 || bucket === 1) regime = "consolidation";
      else if (bucket === 2 || bucket === 3) regime = "trend";
      else if (bucket === 4) regime = "pullback";
      else regime = Math.random() < 0.7 ? "breakout" : "volatile";

      let movePct = 0;

      if (regime === "consolidation") {
        const direction = Math.random() < 0.52 ? 1 : -1;
        movePct = direction * (0.12 + Math.random() * 0.28) * riskControl;
      }

      if (regime === "trend") {
        const isWin = Math.random() < 0.66;
        movePct = isWin
          ? (0.35 + Math.random() * 0.75) * traderStrength * riskControl
          : -(0.18 + Math.random() * 0.38) * riskControl;
      }

      if (regime === "pullback") {
        const isRelief = Math.random() < 0.28;
        movePct = isRelief
          ? (0.18 + Math.random() * 0.35) * traderStrength
          : -(0.28 + Math.random() * 0.65) * riskControl;
      }

      if (regime === "breakout") {
        const isWin = Math.random() < 0.72;
        movePct = isWin
          ? (0.75 + Math.random() * 1.35) * traderStrength * riskControl
          : -(0.28 + Math.random() * 0.55);
      }

      if (regime === "volatile") {
        const isShockDown = Math.random() < 0.44;
        movePct = isShockDown
          ? -(0.55 + Math.random() * 1.15)
          : (0.45 + Math.random() * 0.95) * traderStrength;
      }

      const nextMove = accountSize * (movePct / 100);

      await addProfit(userId, nextMove);

      setEvents((current) =>
        [
          `${copiedTrader.name} PnL ${nextMove >= 0 ? "+" : "-"}$${Math.abs(nextMove).toFixed(2)}`,
          ...current,
        ].slice(0, 6)
      );
    }, 5500);

    return () => clearInterval(interval);
  }, [userId, user?.systemActive, user?.allocatedUsd, copiedTrader]);

  async function handleCopy(amount: number, traderOverride?: Trader) {
    if (!requireLogin() || !userId || !user) return;

    const traderToCopy = traderOverride || selectedTrader;
    if (!traderToCopy || amount <= 0 || amount > availableUsd) return;

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

    if (user.systemActive) {
      await recordDailyPerformance({ userId, user });
    }

    await setCopyEngine({
      userId,
      copiedTraderId: user.copiedTraderId,
      systemActive: !user.systemActive,
      allocationUsd: user.allocatedUsd || 0,
    });
  }

  async function disconnectTrader() {
    if (!requireLogin() || !userId || !user) return;

    await recordDailyPerformance({ userId, user });

    await setCopyEngine({
      userId,
      copiedTraderId: null,
      systemActive: false,
      allocationUsd: 0,
    });

    setEvents((current) => ["Copy Engine disconnected.", ...current].slice(0, 6));
  }

  return (
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
            if (!isLoggedIn) {
              setLoginHint("withdraw");
              return;
            }

            setCashModal("withdraw");
            setCashAmount(0);
          }}
        />

        <PerformanceChart
          active={activeUser.systemActive}
          data={activeUser.dailyPerformance || []}
          liveWallet={activeUser.depositedUsd + activeUser.profitUsd}
          depositedUsd={activeUser.depositedUsd}
          profitUsd={activeUser.profitUsd}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <TerminalLeaderboard
          traders={traders}
          selectedTraderId={selectedTraderId}
          onSelectTrader={setSelectedTraderId}
        />

        <ChallengeRegister />
      </div>

      <div id="copy-terminal" className="grid scroll-mt-28 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <CopyEnginePanel
          isActive={activeUser.systemActive}
          traderName={copiedTrader?.name}
          selectedTraderName={selectedTrader?.name}
          depositedUsd={activeUser.depositedUsd}
          profitUsd={activeUser.profitUsd}
          onToggle={toggleEngine}
          onDisconnect={disconnectTrader}
        />

        <TerminalInvestPanel
          trader={selectedTrader}
          totalInvested={availableUsd}
          estimatedProfit={activeUser.profitUsd}
          onInvest={handleCopy}
        />
      </div>

      <TerminalChat events={events} />

      <p className="text-center text-[11px] leading-4 text-white/30">
        {isLoggedIn
          ? "Account loaded. Deposits and Copy Engine are connected to your profile."
          : "Guest mode: values start at zero. Login to load your real Bullions profile."}
      </p>


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

            setEvents((current) =>
              [`SOL deposit verified: ${deposit.amountCrypto.toFixed(4)} SOL`, ...current].slice(0, 6)
            );

            setTimeout(() => setCashModal(null), 1800);
          }}
        />
      )}
    </section>
  );
}

export default TerminalArena;
