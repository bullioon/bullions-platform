"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import type { Strategy } from "@/types/v2/domain/strategy";
import { TraderProfilePage } from "@/components/v2/trader-profile/TraderProfilePage";
import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";

type WorkspaceState =
  | { status: "loading" }
  | { status: "logged_out" }
  | { status: "not_found" }
  | { status: "forbidden" }
  | { status: "ready"; strategy: Strategy };

export function StrategyWorkspace({
  id,
}: {
  id: string;
}) {
  const { user, loading } = useAuth();

  const [state, setState] =
    useState<WorkspaceState>({
      status: "loading",
    });

  useEffect(() => {
    let alive = true;

    async function loadWorkspace() {
      if (loading) return;

      if (!user) {
        setState({
          status: "logged_out",
        });
        return;
      }

      try {
        const strategy =
          await StrategyRepository.get(id);

        if (!alive) return;

        if (!strategy) {
          setState({
            status: "not_found",
          });
          return;
        }

        const managerUid =
          strategy.manager?.uid || "";

        if (
          !managerUid ||
          managerUid !== user.uid
        ) {
          setState({
            status: "forbidden",
          });
          return;
        }

        setState({
          status: "ready",
          strategy,
        });
      } catch {
        if (!alive) return;

        setState({
          status: "not_found",
        });
      }
    }

    loadWorkspace();

    return () => {
      alive = false;
    };
  }, [id, user, loading]);

  if (state.status === "ready") {
    return (
      <TraderProfilePage
        strategy={state.strategy}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#050606] px-4 pb-28 pt-8 text-white md:pb-14">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1380px]">
        <TopFloatingMenu />

        <section className="grid min-h-[65vh] place-items-center">
          {state.status === "loading" ? (
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />

              <p className="mt-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                Opening Workspace
              </p>
            </div>
          ) : (
            <div className="w-full max-w-[680px] rounded-[34px] border border-white/10 bg-[#080909] p-8 text-center sm:p-12">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
                Strategy Workspace
              </p>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.06em] sm:text-6xl">
                {state.status === "logged_out"
                  ? "Log in to continue."
                  : state.status === "forbidden"
                    ? "This workspace is private."
                    : "Strategy unavailable."}
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/40">
                {state.status === "logged_out"
                  ? "Your strategy workspace requires an active manager session."
                  : state.status === "forbidden"
                    ? "Only the manager who owns this strategy can open its workspace."
                    : "This strategy could not be found or may have been removed."}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/firm"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-[#b6ff00] px-8 text-[10px] font-black uppercase tracking-[0.16em] text-black"
                >
                  Return to Firm HQ
                </Link>

                <Link
                  href="/manager/strategies"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-8 text-[10px] font-black uppercase tracking-[0.16em] text-white/55"
                >
                  My Strategies
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
