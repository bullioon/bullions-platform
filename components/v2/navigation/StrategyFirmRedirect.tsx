"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function StrategyFirmRedirect({
  strategyId,
}: {
  strategyId: string;
}) {
  const router = useRouter();

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function resolveFirm() {
      try {
        const response = await fetch(
          `/api/runtime/strategy/${encodeURIComponent(
            strategyId
          )}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Strategy could not be loaded"
          );
        }

        const runtime =
          data?.runtime || data;

        const managerUid =
          runtime?.managerUid ||
          runtime?.manager?.uid ||
          runtime?.strategy?.managerUid ||
          runtime?.strategy?.manager?.uid;

        if (!managerUid) {
          throw new Error(
            "This strategy is not connected to a public firm yet."
          );
        }

        if (!alive) return;

        router.replace(
          `/m/${encodeURIComponent(
            String(managerUid)
          )}`
        );
      } catch (reason) {
        if (!alive) return;

        setError(
          reason instanceof Error
            ? reason.message
            : "Public firm could not be opened."
        );
      }
    }

    resolveFirm();

    return () => {
      alive = false;
    };
  }, [router, strategyId]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050607] px-4 text-white">
        <section className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#080909] p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            Public Firm
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.055em]">
            Firm unavailable.
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/40">
            {error}
          </p>

          <a
            href="/discover"
            className="mt-7 inline-flex h-13 items-center justify-center rounded-full bg-[#b6ff00] px-8 text-[10px] font-black uppercase tracking-[0.16em] text-black"
          >
            Return to Discover
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#050607] text-white">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />

        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
          Opening Public Firm
        </p>
      </div>
    </main>
  );
}
