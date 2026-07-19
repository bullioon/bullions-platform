"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";

type Workspace = "trader" | "investor";

export function RoleOnboarding() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [savingWorkspace, setSavingWorkspace] =
    useState<Workspace | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  async function chooseWorkspace(workspace: Workspace) {
    if (!user || savingWorkspace) return;

    setError("");
    setSavingWorkspace(workspace);

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          workspaces: {
            trader: true,
            investor: true,
          },
          lastWorkspace: workspace,
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      router.replace(
        workspace === "trader"
          ? "/firm"
          : "/bullpad"
      );
    } catch (workspaceError) {
      console.error(
        "Unable to save workspace:",
        workspaceError
      );

      setError(
        "We could not open your workspace. Please try again."
      );

      setSavingWorkspace(null);
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-black text-white">
        <TopFloatingMenu />

        <div className="grid min-h-screen place-items-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />

            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Opening Bullions
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-28 text-white sm:px-6">
      <TopFloatingMenu />

      <section className="mx-auto max-w-[1080px]">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
            Welcome to Bullions
          </p>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.065em] sm:text-6xl">
            Choose your workspace.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/40">
            Choose how you want to enter Bullions today.
            You can switch workspaces at any time.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            disabled={savingWorkspace !== null}
            onClick={() => chooseWorkspace("trader")}
            className="group min-h-[360px] rounded-[34px] border border-white/10 bg-[#080909] p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-[#b6ff00]/40 hover:bg-[#0c0e0e] disabled:cursor-wait disabled:opacity-60 sm:p-9"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b6ff00]/20 bg-[#b6ff00]/10 text-2xl font-black text-[#b6ff00]">
              ↗
            </div>

            <p className="mt-10 text-[10px] font-black uppercase tracking-[0.25em] text-[#b6ff00]">
              Trader Workspace
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
              Continue as Trader
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/40">
              Build strategies, compete in Challenges and
              earn investors&apos; trust.
            </p>

            <div className="mt-9 inline-flex h-13 items-center justify-center rounded-full bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.16em] text-black">
              {savingWorkspace === "trader"
                ? "Opening..."
                : "Enter Trader Workspace"}
            </div>
          </button>

          <button
            type="button"
            disabled={savingWorkspace !== null}
            onClick={() => chooseWorkspace("investor")}
            className="group min-h-[360px] rounded-[34px] border border-white/10 bg-[#080909] p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-[#b6ff00]/40 hover:bg-[#0c0e0e] disabled:cursor-wait disabled:opacity-60 sm:p-9"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl font-black">
              $
            </div>

            <p className="mt-10 text-[10px] font-black uppercase tracking-[0.25em] text-white/35">
              Investor Workspace
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
              Continue as Investor
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/40">
              Discover top-performing traders and build
              your investment portfolio.
            </p>

            <div className="mt-9 inline-flex h-13 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-7 text-[10px] font-black uppercase tracking-[0.16em] text-white transition group-hover:border-[#b6ff00]/40 group-hover:text-[#b6ff00]">
              {savingWorkspace === "investor"
                ? "Opening..."
                : "Enter Investor Workspace"}
            </div>
          </button>
        </div>

        {error ? (
          <p className="mt-6 text-center text-sm font-semibold text-red-400">
            {error}
          </p>
        ) : null}

        <p className="mt-8 text-center text-xs text-white/25">
          You can switch workspaces at any time.
        </p>
      </section>
    </main>
  );
}
