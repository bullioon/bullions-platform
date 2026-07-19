"use client";

import { useEffect, useState } from "react";

type ProofState = {
  strategies: number;
  verifiedTrades: number;
  mt5Accounts: number;
  sixAssessments: number;
};

const emptyProof: ProofState = {
  strategies: 0,
  verifiedTrades: 0,
  mt5Accounts: 0,
  sixAssessments: 0,
};

export function SocialProofStrip() {
  const [proof, setProof] =
    useState<ProofState>(emptyProof);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch(
          "/api/mission-control",
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!alive) return;

        const rows =
          data?.rows ||
          data?.strategies ||
          data?.traders ||
          [];

        if (!Array.isArray(rows)) return;

        const strategies = rows.length;

        const verifiedTrades = rows.reduce(
          (sum: number, item: any) =>
            sum +
            Number(
              item.totalTrades ||
                item.performance?.totalTrades ||
                0
            ),
          0
        );

        const mt5Accounts = rows.filter(
          (item: any) =>
            item.mt5 ||
            item.engine === "MT5" ||
            item.source === "MT5"
        ).length;

        const sixAssessments = rows.filter(
          (item: any) =>
            item.six ||
            item.assessment ||
            item.runtimeGrade
        ).length;

        setProof({
          strategies,
          verifiedTrades,
          mt5Accounts,
          sixAssessments,
        });
      } catch {
        setProof(emptyProof);
      }
    }

    load();
  }, []);

  const items = [
    {
      label: "Active strategies",
      value: proof.strategies,
    },
    {
      label: "Verified trades",
      value: proof.verifiedTrades,
    },
    {
      label: "MT5 connections",
      value: proof.mt5Accounts,
    },
    {
      label: "SIX assessments",
      value: proof.sixAssessments,
    },
  ];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#080909] px-6 py-7 sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            Live on Bullions
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-[-0.05em]">
            Every number comes from the system.
          </h2>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 lg:max-w-3xl lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-[20px] border border-white/10 bg-black/20 p-4"
            >
              <p className="text-2xl font-black tracking-[-0.05em]">
                {item.value.toLocaleString()}
              </p>

              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/25">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
