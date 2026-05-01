"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { mockTraders, type Trader } from "@/lib/mockTraders";
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
  copiedTraderId: null,
  systemActive: false,
  dailyPerformance: [],

  avatarEmoji?: string;};

export function TerminalArena() {
  const [authUser, setAuthUser] = useState<User | null>(null);
 = useState<User | null>(null);
  const [user, setUser] = useState<BullionsUser | null>(null);
  const [traders] = useState<Trader[]>(mockTraders);
  const [selectedTraderId, setSelectedTraderId] = useState(mockTraders[0]?.id || "");
  const [cashModal, setCashModal] = useState<"deposit" | "withdraw" | null>(null);
  const [cashAmount, setCashAmount] = useState(0);
  const [network, setNetwork] = useState<"BTC" | "SOL">("SOL");
  const [txHash, setTxHash] = useState("");

  const [events, setEvents] = useState<string[]>([
    "BullPad loaded in guest mode.",
    "Login to load deposits, profit and history.",
    "Copy Engine is paused.",
  ]);

  const userId = authUser?.uid || null;
  const activeUser = user || guestUser;
  const isLoggedIn = Boolean(authUser && user);

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
    if (!userId || !user?.systemActive || !copiedTrader || user.depositedUsd <= 0) return;

    const interval = setInterval(async () => {
      const edge = (copiedTrader.roi / 100) * 0.045;
      const volatility =
        copiedTrader.maxLoss >= 20 ? 1.85 : copiedTrader.maxLoss >= 12 ? 1.25 : 0.75;
      const noise = (Math.random() - 0.5) * volatility;
      const shock = Math.random() < 0.22 ? -Math.random() * volatility * 1.4 : 0;
      const nextMove = user.depositedUsd * ((edge + noise + shock) / 100);

      await addProfit(userId, nextMove);

      setEvents((current) =>
        [
          `${copiedTrader.name} PnL ${nextMove >= 0 ? "+" : "-"}$${Math.abs(nextMove).toFixed(2)}`,
          ...current,
        ].slice(0, 6)
      );
    }, 5500);

    return () => clearInterval(interval);
  }, [userId, user?.systemActive, user?.depositedUsd, copiedTrader]);

  async function handleCopy(amount: number, traderOverride?: Trader) {
    if (!requireLogin() || !userId || !user) return;

    const traderToCopy = traderOverride || selectedTrader;
    if (!traderToCopy || user.depositedUsd <= 0) return;

    await setCopyEngine({
      userId,
      copiedTraderId: traderToCopy.id,
      systemActive: true,
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
    });
  }

  async function disconnectTrader() {
    if (!requireLogin() || !userId || !user) return;

    await recordDailyPerformance({ userId, user });

    await setCopyEngine({
      userId,
      copiedTraderId: null,
      systemActive: false,
    });

    setEvents((current) => ["Copy Engine disconnected.", ...current].slice(0, 6));
  }

  return (
    <section id="bullpad" className="mx-auto w-full max-w-[1480px] scroll-mt-28 space-y-5 pb-10">
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
            if (!requireLogin()) return;
            setCashModal("deposit");
            setCashAmount(0);
          }}
          onWithdraw={() => {
            if (!requireLogin()) return;
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
          totalInvested={activeUser.depositedUsd}
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
