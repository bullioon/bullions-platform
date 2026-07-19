"use client";

import { useEffect, useState } from "react";

import { ManagerService } from "@/core/v2/services/ManagerService";
import type { ManagerProfile } from "@/types/v2/profile/managerProfile";
import { ManagerLayout } from "@/components/v2/manager-profile/ManagerLayout";
import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";

type LoadState =
  | "loading"
  | "ready"
  | "not_found"
  | "error";

export function ManagerProfilePage({
  uid,
}: {
  uid: string;
}) {
  const [profile, setProfile] =
    useState<ManagerProfile | null>(null);

  const [loadState, setLoadState] =
    useState<LoadState>("loading");

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      setLoadState("loading");

      try {
        const baseProfile =
          await ManagerService.getProfile(uid);

        if (!alive) return;

        if (!baseProfile) {
          setProfile(null);
          setLoadState("not_found");
          return;
        }

        let runtime = null;

        try {
          const response = await fetch(
            `/api/runtime/manager/${encodeURIComponent(uid)}`,
            { cache: "no-store" }
          );

          if (response.ok) {
            const data = await response.json();
            runtime = data.runtime || null;
          }
        } catch {
          runtime = null;
        }

        if (!alive) return;

        setProfile({
          ...baseProfile,
          runtime,
        });

        setLoadState("ready");
      } catch (error) {
        console.error(
          "[ManagerProfilePage] load failed",
          error
        );

        if (!alive) return;

        setProfile(null);
        setLoadState("error");
      }
    }

    loadProfile();

    return () => {
      alive = false;
    };
  }, [uid]);

  if (loadState === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050607] px-6 text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
            Loading Headquarters
          </p>
        </div>
      </main>
    );
  }

  if (loadState === "not_found") {
    return (
      <main className="min-h-screen bg-[#050607] px-4 py-10 text-white">
        <div className="mx-auto max-w-[1480px]">
          <TopFloatingMenu />

          <section className="mt-8 grid min-h-[520px] place-items-center rounded-[38px] border border-white/10 bg-[#080909] px-6 text-center">
            <div className="max-w-lg">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
                Headquarters unavailable
              </p>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.06em]">
                This manager has not published a Headquarters yet.
              </h1>

              <a
                href="/discover"
                className="mt-8 inline-flex h-13 items-center rounded-full bg-[#b6ff00] px-8 text-[10px] font-black uppercase tracking-[0.17em] text-black"
              >
                Explore Managers
              </a>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (loadState === "error" || !profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050607] px-6 text-center text-white">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.05em]">
            Could not load Headquarters
          </h1>

          <p className="mt-3 text-sm text-white/40">
            Refresh the page or try again shortly.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-7 h-12 rounded-full bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.16em] text-black"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-12 pt-8 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1600px]">
        <TopFloatingMenu />

        <section className="mt-5">
          <ManagerLayout profile={profile} />
        </section>
      </div>
    </main>
  );
}
