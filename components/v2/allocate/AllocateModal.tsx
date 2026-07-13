"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

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
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleAllocate() {
    setError("");

    const allocationUsd = Number(amount);

    if (!allocationUsd || allocationUsd <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("Login required to allocate capital.");
      return;
    }

    setLoading(true);

    try {
      const idToken = await currentUser.getIdToken();

      const res = await fetch("/api/funds/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId,
          tier: "BULLION",
          capitalUsd: allocationUsd,
          managers: [
            {
              traderId,
              strategyId,
              allocationPct: 100,
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Allocation failed.");
      }

      setAmount("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Allocation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-[#090909] p-7 text-white shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
          BullPad Allocation
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.055em]">
          Copy Strategy
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/45">
          Allocate capital through the same Fund Engine used by BullPad.
        </p>

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in USD"
          inputMode="decimal"
          className="mt-7 w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none placeholder:text-white/25"
        />

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button
          disabled={loading}
          onClick={handleAllocate}
          className="mt-5 w-full rounded-2xl bg-[#b6ff00] py-4 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-40"
        >
          {loading ? "Activating..." : "Activate Fund"}
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-2xl border border-white/10 py-4 text-sm font-black uppercase tracking-[0.16em] text-white/55"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
