"use client";

import { useEffect, useState } from "react";

import { ManagerService } from "@/core/v2/services/ManagerService";
import type { ManagerProfile } from "@/types/v2/profile/managerProfile";
import { ManagerLayout } from "@/components/v2/manager-profile/ManagerLayout";
import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";

export function ManagerProfilePage({ uid }: { uid: string }) {
  const [profile, setProfile] = useState<ManagerProfile | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      const baseProfile = await ManagerService.getProfile(uid);

      if (!baseProfile || !alive) {
        if (alive) setProfile(null);
        return;
      }

      try {
        const response = await fetch(
          `/api/runtime/manager/${encodeURIComponent(uid)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!alive) return;

        setProfile({
          ...baseProfile,
          runtime: data.runtime || null,
        });
      } catch {
        if (alive) {
          setProfile({
            ...baseProfile,
            runtime: null,
          });
        }
      }
    }

    loadProfile();

    return () => {
      alive = false;
    };
  }, [uid]);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050606] text-white">
        Loading manager...
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050607] px-4 pb-12 pt-10 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1600px]">
        <TopFloatingMenu />

        <section className="mt-6">
          <ManagerLayout profile={profile} />
        </section>
      </div>
    </main>
  );
}
