"use client";

import Image from "next/image";
import { useState } from "react";
import { requestWithdrawal } from "@/lib/bullionsUser";

type Props = {
  open: boolean;
  onClose: () => void;
  tier: "BULLION" | "HELLION" | "TORION";
  maxWithdrawUsd: number;
  portfolioUsd: number;
  onUpgrade: () => void;
  userId: string | null;
  systemActive: boolean;
  pendingWithdrawal?: {
    amountUsd: number;
    wallet: string;
    status: "pending" | "released";
    requestedAt: number;
    weekKey: string;
  };
};

const tierConfig = {
  BULLION: {
    pct: "30%",
    next: "HELLION",
    requirement: "$500+ portfolio",
    progress: "40%",
  },
  HELLION: {
    pct: "30%",
    next: "TORION",
    requirement: "$1000+ portfolio",
    progress: "78%",
  },
  TORION: {
    pct: "Unlimited",
    next: "MAX LEVEL",
    requirement: "Unlocked",
    progress: "100%",
  },
};

export function WithdrawalModal({
  open,
  onClose,
  tier,
  maxWithdrawUsd,
  portfolioUsd,
  onUpgrade,
  userId,
  systemActive,
  pendingWithdrawal,
}: Props) {
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");

  if (!open) return null;

  const current = tierConfig[tier];

  const now = new Date();
  const isSunday = now.getDay() === 0;
  const weekKey = `${now.getFullYear()}-${Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7
  )}`;

  const hasPendingThisWeek =
    pendingWithdrawal?.weekKey === weekKey &&
    pendingWithdrawal?.status === "pending";

  const amountNumber = Number(amount);
  const blockedByEngine = systemActive;
  const blockedByDay = !isSunday;
  const blockedByPending = Boolean(hasPendingThisWeek);
  const invalidAmount =
    !amountNumber || amountNumber <= 0 || amountNumber > maxWithdrawUsd;

  const canRequest =
    Boolean(userId) &&
    !blockedByEngine &&
    !blockedByDay &&
    !blockedByPending &&
    !invalidAmount &&
    wallet.trim().length > 5;

  async function handleWithdrawalRequest() {
    if (!canRequest || !userId) return;

    await requestWithdrawal({
      userId,
      amountUsd: amountNumber,
      wallet: wallet.trim(),
      weekKey,
    });

    setAmount("");
  }

  const nextSunday = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0);

  const diff = nextSunday.getTime() - now.getTime();
  const countdownDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const countdownHours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const countdownMinutes = Math.floor((diff / (1000 * 60)) % 60);

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-xl">
      <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-[42px] border border-[#6CFF72]/15 bg-[#050607] p-6 shadow-[0_40px_140px_rgba(108,255,114,0.12)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.22),transparent_35%)] sm:p-8">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(108,255,114,0.18), transparent 35%), radial-gradient(circle at bottom left, rgba(177,108,255,0.18), transparent 35%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6CFF72]">
                Withdrawal Protocol
              </p>

              <h2 className="mt-4 text-[42px] font-semibold leading-[0.95] text-white sm:text-[48px]">
                Withdraw
                <br />
                capital
              </h2>
            </div>

            <button
              onClick={onClose}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-2xl text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              ×
            </button>
          </div>

          <p className="mt-6 max-w-[560px] text-[16px] leading-7 text-white/55">
            Your survival level controls withdrawal limits, payout priority and
            how much capital remains active inside the Bullions AI engine.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/[0.06] bg-black/30 p-5">
              <p className="text-sm text-white/40">Available this cycle</p>

              <p className="mt-3 text-[38px] font-semibold text-white">
                ${maxWithdrawUsd.toFixed(2)}
              </p>

              <p className="mt-2 text-sm font-medium text-[#6CFF72]">
                Max {current.pct} available every Sunday
              </p>

              <p className="mt-2 text-xs text-white/35">
                Next unlock in {countdownDays}D {countdownHours}H {countdownMinutes}M
              </p>
            </div>

            <div className="rounded-[24px] border border-white/[0.06] bg-black/30 p-5">
              <p className="text-sm text-white/40">Portfolio balance</p>

              <p className="mt-3 text-[38px] font-semibold text-white">
                ${portfolioUsd.toFixed(2)}
              </p>

              <p className="mt-2 text-sm text-white/50">AI engine active</p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/[0.06] bg-black/30 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Current tier</p>

                <p className="mt-2 text-2xl font-semibold text-white">{tier}</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-white/40">Next unlock</p>

                <p className="mt-2 text-sm font-medium text-[#6CFF72]">
                  {current.next} · {current.requirement}
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#6CFF72]"
                style={{ width: current.progress }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-[#8b5cf6]/40 bg-[#2d145f]/35 p-5 shadow-[0_0_45px_rgba(139,92,246,0.12)]">
            <label className="flex items-center gap-2 text-sm font-semibold text-white">
              <Image
                src="/assets/phantom.png"
                alt="Phantom"
                width={22}
                height={22}
                className="h-[22px] w-[22px] rounded-full object-contain"
              />
              Phantom destination
            </label>

            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Enter your Phantom / SOL wallet..."
              className="mt-3 h-[62px] w-full rounded-[22px] border border-white/[0.08] bg-black/35 px-5 text-white outline-none transition placeholder:text-white/25 focus:border-[#6CFF72]/50 focus:ring-4 focus:ring-[#6CFF72]/10"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm text-white/45">Withdrawal amount</label>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max $${maxWithdrawUsd.toFixed(2)}`}
              inputMode="decimal"
              className="mt-3 h-[62px] w-full rounded-[22px] border border-white/[0.08] bg-black/30 px-5 text-white outline-none transition placeholder:text-white/25 focus:border-[#6CFF72]/50 focus:ring-4 focus:ring-[#6CFF72]/10"
            />
          </div>

          {blockedByPending ? (
            <div className="mt-4 rounded-[22px] border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 p-4 text-sm leading-6 text-white/70">
              Withdrawal already requested this week: ${pendingWithdrawal?.amountUsd.toFixed(2)} to {pendingWithdrawal?.wallet}. Status: {pendingWithdrawal?.status}.
            </div>
          ) : blockedByEngine ? (
            <div className="mt-4 rounded-[22px] border border-[#f59e0b]/25 bg-[#f59e0b]/10 p-4 text-sm leading-6 text-white/70">
              Turn off the Copy Engine before requesting a withdrawal. Allocated capital must be released first.
            </div>
          ) : blockedByDay ? (
            <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/60">
              Withdrawals open every Sunday. Next unlock in {countdownDays}D {countdownHours}H {countdownMinutes}M.
            </div>
          ) : (
            <div className="mt-4 rounded-[22px] border border-[#6CFF72]/10 bg-[#6CFF72]/5 p-4 text-sm leading-6 text-white/60">
              Sunday withdrawal window is open. Requested capital will be deducted immediately and marked pending.
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleWithdrawalRequest}
              disabled={!canRequest}
              className={`
                h-[64px] flex-1 rounded-full text-sm font-semibold transition-all duration-300
                ${
                  canRequest
                    ? "bg-[#6CFF72] text-black shadow-[0_0_45px_rgba(108,255,114,0.28)] hover:scale-[1.01]"
                    : blockedByEngine
                      ? "border border-[#ff9d00]/25 bg-[#ff9d00]/10 text-[#ffb84d]"
                      : blockedByPending
                        ? "border border-[#8b5cf6]/30 bg-[#8b5cf6]/12 text-[#c4b5fd]"
                        : "border border-white/[0.08] bg-white/[0.04] text-white/35"
                }
              `}
            >
              {blockedByEngine
                ? "Turn Off Engine First"
                : blockedByPending
                  ? "Withdrawal Pending"
                  : blockedByDay
                    ? `Unlocks Sunday`
                    : "Request Withdrawal"}
            </button>

            <button
              onClick={onClose}
              className="
                h-[64px] flex-1 rounded-full
                border border-white/[0.08]
                bg-white/[0.03]
                text-sm font-semibold text-white/75
                transition-all duration-300
                hover:bg-white/[0.06]
              "
            >
              Continue Compounding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
