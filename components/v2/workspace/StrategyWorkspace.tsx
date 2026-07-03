"use client";

import { useEffect, useState } from "react";

import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import type { Strategy } from "@/types/v2/domain/strategy";
import { TraderProfilePage } from "@/components/v2/trader-profile/TraderProfilePage";

export function StrategyWorkspace({ id }: { id: string }) {
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  useEffect(() => {
    StrategyRepository.get(id).then(setStrategy);
  }, [id]);

  if (!strategy) {
    return (
      <main className="min-h-screen bg-[#050606] px-5 py-8 text-white">
        <p className="text-white/45">Loading trader profile...</p>
      </main>
    );
  }

  return <TraderProfilePage strategy={strategy} />;
}
