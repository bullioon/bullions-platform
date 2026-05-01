"use client";

import { BullionsUser } from "@/lib/bullionsUser";

type Props = {
  user: BullionsUser;
  onChangeEmoji: () => void;
};

export function UserWalletHeader({ user, onChangeEmoji }: Props) {
  return (
    <section className="rounded-[28px] bg-[#111214]/80 p-5 ring-1 ring-white/5 backdrop-blur-xl">

      <div className="flex items-center gap-4">
        <button
          onClick={onChangeEmoji}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-xl"
        >
          {user.avatarEmoji}
        </button>

        <div>
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-xs text-white/40">@{user.username}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs text-white/35">Balance</p>
        <h1 className="text-4xl font-semibold text-white">
          ${user.balanceUsd.toLocaleString()}
        </h1>

        <p className="mt-1 text-sm text-[#b6ff00]">
          +${user.profitUsd.toLocaleString()} profit
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-white/[0.05] p-3">
          <p className="text-xs text-white/35">BTC Deposits</p>
          <p className="mt-1 font-medium text-white">
            ${user.btcDepositedUsd}
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.05] p-3">
          <p className="text-xs text-white/35">SOL Deposits</p>
          <p className="mt-1 font-medium text-white">
            ${user.solDepositedUsd}
          </p>
        </div>
      </div>
    </section>
  );
}
