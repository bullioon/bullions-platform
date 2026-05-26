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
  recordPerformanceSnapshot,
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
import { createWithdrawalRequest } from "@/lib/withdrawals";
import { SurvivalPanel } from "@/components/terminal/SurvivalPanel";
import { WithdrawalModal } from "@/components/terminal/WithdrawalModal";
import { resolveTier, maxAllocationPct } from "@/lib/tierSystem";
import { generateMove, engineEvents } from "@/lib/engineBehavior";

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

  const [events, setEvents] = useState<string[]>([
    "BullPad loaded in guest mode.",
    "Login to load deposits, profit and history.",
    "Copy Engine is paused.",
  ]);

  const userId = authUser?.uid || null;
  const activeUser = user || guestUser;
  const isLoggedIn = Boolean(authUser && user);
  const tier = resolveTier(activeUser.depositedUsd || 0);
  const maxAllocatableUsd = Number(((activeUser.depositedUsd || 0) * maxAllocationPct(tier)).toFixed(2));
  const remainingAllocationRoom = Math.max(0, maxAllocatableUsd - (activeUser.allocatedUsd || 0));

  const availableUsd = Math.max(
    0,
    Number(
      Math.min(
        remainingAllocationRoom,
        (activeUser.depositedUsd || 0) +
          (activeUser.profitUsd || 0) -
          (activeUser.allocatedUsd || 0)
      ).toFixed(2)
    )
  );

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
      } catch (error) {
        console.error("Leaderboard load error:", error);
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

  const engineIsActive = Boolean(
    activeUser.systemActive &&
      activeUser.copiedTraderId &&
      copiedTrader &&
      (activeUser.allocatedUsd || 0) > 0
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
    if (!userId || !engineIsActive || !copiedTrader || (user?.allocatedUsd || 0) <= 0) return;

    const interval = setInterval(async () => {
      const accountSize = user?.allocatedUsd || 0;
      const { phase, move } = generateMove();
      let nextMove = accountSize * (move / 100);

      const currentRoi =
        accountSize > 0 ? ((user?.profitUsd || 0) / accountSize) * 100 : 0;

      if (currentRoi > 120 && nextMove > 0) {
        nextMove = -(accountSize * ((4 + Math.random() * 10) / 100));
      }

      if (currentRoi < -35 && nextMove < 0) {
        nextMove = accountSize * ((6 + Math.random() * 12) / 100);
      }
      const event = engineEvents[Math.floor(Math.random() * engineEvents.length)];

      const nextProfitUsd = (user?.profitUsd || 0) + nextMove;

      await addProfit(userId, nextMove);

      await recordPerformanceSnapshot({
        userId,
        depositedUsd: user?.depositedUsd || 0,
        profitUsd: nextProfitUsd,
      });

      setEvents((current) =>
        [
          `${copiedTrader.name} PnL ${nextMove >= 0 ? "+" : "-"}$${Math.abs(nextMove).toFixed(2)}`,
          ...current,
        ].slice(0, 6)
      );
    }, 22000);

    return () => clearInterval(interval);
  }, [userId, engineIsActive, user?.allocatedUsd, user?.profitUsd, copiedTrader]);

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
            if (!isLoggedIn || !userId) {
              setLoginHint("withdraw");
              return;
            }

            setWithdrawOpen(true);
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

      <SurvivalPanel
        tier={tier}
        depositedUsd={activeUser.depositedUsd || 0}
        allocatedUsd={activeUser.allocatedUsd || 0}
        availableUsd={availableUsd}
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

      <TerminalChat events={events} />

      <p className="text-center text-[11px] leading-4 text-white/30">
        {isLoggedIn
          ? "Account loaded. Deposits and Copy Engine are connected to your profile."
          : "Guest mode: values start at zero. Login to load your real Bullions profile."}
      </p>


      <WithdrawalModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        tier={tier}
        maxWithdrawUsd={Math.max(0, ((activeUser.depositedUsd || 0) + (activeUser.profitUsd || 0) - (activeUser.allocatedUsd || 0)) * (tier === "BULLION" ? 0.1 : tier === "HELLION" ? 0.3 : 1))}
        portfolioUsd={(activeUser.depositedUsd || 0) + (activeUser.profitUsd || 0)}
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
