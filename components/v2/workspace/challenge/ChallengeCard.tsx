"use client";

import { ChallengeTiers } from "@/core/v2/challenge/tiers";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";
import type { Strategy } from "@/types/v2/domain/strategy";
import { Button } from "@/components/v2/ui/Button";
import { Card } from "@/components/v2/ui/Card";
import { ChallengeLeaderboard } from "./ChallengeLeaderboard";

type TierId = "demo_50k" | "demo_200k";

export function ChallengeCard({
  strategy,
}: {
  strategy: Strategy;
}) {
  const [season, setSeason] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);
  const [tierId, setTierId] = useState<TierId>("demo_50k");
  const [error, setError] = useState("");
  const [paymentPending, setPaymentPending] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/leaderboard/challenge", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;

        setSeason(data.season || null);

        const alreadyExists =
          Array.isArray(data.rows) &&
          data.rows.some(
            (row: any) => row.strategyId === strategy.id
          );

        setEntered(alreadyExists);
      })
      .catch(() => {
        if (alive) setSeason(null);
      });

    return () => {
      alive = false;
    };
  }, [strategy.id]);

  async function enter() {
    setError("");

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("Login required to enter the challenge.");
      return;
    }

    setLoading(true);

    try {
      const idToken = await currentUser.getIdToken();

      const res = await fetch("/api/challenge/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          strategyId: strategy.id,
          tierId,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.ok === false) {
        throw new Error(
          data.error || "Challenge registration failed."
        );
      }

      setEntered(true);
      setPaymentPending(data.entry?.paid !== true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Challenge registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!season) {
    return (
      <Card>
        <p className="text-white/40">
          No active challenge season.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
          Monthly Challenge
        </p>

        <h2 className="mt-3 text-3xl font-black text-white">
          {season.name}
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTierId("demo_50k")}
            className={`rounded-2xl border p-4 text-left transition ${
              tierId === "demo_50k"
                ? "border-[#b6ff00]/50 bg-[#b6ff00]/10"
                : "border-white/10 bg-white/[0.025]"
            }`}
          >
            <p className="text-xs font-black text-white">
              50K Demo
            </p>
            <p className="mt-2 text-xl font-black text-[#b6ff00]">
              ${ChallengeTiers.demo_50k.feeUsd}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTierId("demo_200k")}
            className={`rounded-2xl border p-4 text-left transition ${
              tierId === "demo_200k"
                ? "border-[#b6ff00]/50 bg-[#b6ff00]/10"
                : "border-white/10 bg-white/[0.025]"
            }`}
          >
            <p className="text-xs font-black text-white">
              200K Demo
            </p>
            <p className="mt-2 text-xl font-black text-[#b6ff00]">
              $1,080
            </p>
          </button>
        </div>

        <p className="mt-5 text-sm text-white/45">
          Prize pool $
          {Number(season.prizePoolUsd || 0).toLocaleString()}
        </p>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-7">
          {entered ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
              <p className="font-black text-white">
                Registered ✓
              </p>
              <p className="mt-1 text-sm text-white/40">
                {paymentPending
                  ? "Payment confirmation required before ranking."
                  : "Eligible for the live leaderboard."}
              </p>
            </div>
          ) : (
            <Button
              disabled={loading}
              onClick={enter}
            >
              {loading
                ? "Registering..."
                : "Enter Challenge"}
            </Button>
          )}
        </div>
      </Card>

      <ChallengeLeaderboard seasonId={season.id} />
    </div>
  );
}