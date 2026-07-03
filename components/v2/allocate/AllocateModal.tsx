"use client";

import { useState } from "react";

import { FundRepository } from "@/core/v2/repositories/FundRepository";
import { setCopyEngine } from "@/lib/bullionsUser";

type Props = {
  open: boolean;
  onClose: () => void;

  userId?: string;
  traderId: string;
  strategyId: string;
};

export function AllocateModal({
  open,
  onClose,
  userId = "demo-user",
  traderId,
  strategyId,
}: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleAllocate() {
    if (!amount) return;

    setLoading(true);

    const allocationUsd = Number(amount);

    await FundRepository.create({
      userId,
      traderId,
      strategyId,
      amount: allocationUsd,
    });

    await setCopyEngine({
      userId,
      copiedTraderId: traderId,
      systemActive: true,
      allocationUsd,
    });

    setLoading(false);

    setAmount("");

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#090909] p-8 text-white">

        <h2 className="text-3xl font-black">
          Allocate Capital
        </h2>

        <p className="mt-2 text-white/50">
          Strategy Allocation
        </p>

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (USD)"
          className="mt-8 w-full rounded-xl border border-white/10 bg-black px-4 py-4 outline-none"
        />

        <button
          disabled={loading}
          onClick={handleAllocate}
          className="mt-6 w-full rounded-xl bg-[#b6ff00] py-4 font-bold text-black disabled:opacity-40"
        >
          {loading ? "Allocating..." : "Confirm Allocation"}
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-xl border border-white/10 py-4"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}
