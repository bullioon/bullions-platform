"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  name: string;
  detail: string;
  status: string;
  href: string;
};

export function ProofWall() {
  const [items, setItems] =
    useState<Activity[]>([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch(
          "/api/leaderboard/pulse",
          { cache: "no-store" }
        );

        const data = await response.json();

        const source =
          data?.rows ||
          data?.strategies ||
          [];

        if (!alive || !Array.isArray(source)) {
          return;
        }

        setItems(
          source.slice(0, 6).map((item: any) => {
            const strategyId = String(
              item.strategyId ||
                item.id ||
                ""
            );

            const managerUid =
              item.managerUid ||
              item.manager?.uid ||
              null;

            const roi = Number(
              item.roi ??
                item.performance?.roi ??
                0
            );

            return {
              id: strategyId,
              name: String(
                item.name ||
                  item.strategyName ||
                  "Verified Trader"
              ),
              detail: `${
                roi >= 0 ? "+" : ""
              }${roi.toFixed(2)}% ROI`,
              status: String(
                item.runtimeGrade ||
                  item.grade ||
                  "MT5 Verified"
              ),
              href: managerUid
                ? `/m/${encodeURIComponent(
                    managerUid
                  )}`
                : `/s/${encodeURIComponent(
                    strategyId
                  )}`,
            };
          })
        );
      } catch {
        setItems([]);
      }
    }

    load();
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-[38px] border border-white/10 bg-[#080909] p-7 sm:p-10">
      <div className="max-w-3xl">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
          Proof in motion
        </p>

        <h2 className="mt-4 text-4xl font-black tracking-[-0.065em] sm:text-6xl">
          Performance is public.
        </h2>
      </div>

      <div className="mt-9 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="rounded-[24px] border border-white/10 bg-black/20 p-6 transition hover:border-[#b6ff00]/25 hover:bg-[#b6ff00]/[0.025]"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#b6ff00]" />

              <span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/25">
                {item.status}
              </span>
            </div>

            <h3 className="mt-7 text-xl font-black">
              {item.name}
            </h3>

            <p className="mt-2 text-sm font-black text-[#b6ff00]">
              {item.detail}
            </p>

            <p className="mt-6 text-[9px] font-black uppercase tracking-[0.15em] text-white/25">
              Open Public Firm →
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
