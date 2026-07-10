"use client";

import { useEffect, useState } from "react";

import { ManagerService } from "@/core/v2/services/ManagerService";
import type { ManagerProfile } from "@/types/v2/profile/managerProfile";
import { ManagerLayout } from "@/components/v2/manager-profile/ManagerLayout";

export function ManagerProfilePage({ uid }: { uid: string }) {
  const [profile, setProfile] = useState<ManagerProfile | null>(null);

  useEffect(() => {
    ManagerService.getProfile(uid).then(setProfile);
  }, [uid]);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050606] text-white">
        Loading manager...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050606] text-white">
      <section className="mx-auto max-w-[1600px] px-6 py-10">
        <ManagerLayout profile={profile} />
      </section>
    </main>
  );
}
