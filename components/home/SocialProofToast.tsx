"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  "🟢 AxWsta online",
  "🚀 New Bullion account activated",
  "🏆 New Beat The Bot participant",
  "📈 Bullions Bot copied",
  "🔥 Hellion upgraded",
  "💸 Withdrawal request submitted",
  "🟢 TrevorHenry20 online",
  "⚡ Torion account active",
  "🚀 New investor joined",
  "🏆 Leaderboard updated",
];

export function SocialProofToast() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % ITEMS.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-5 left-5 z-[999]">
      <div className="rounded-2xl border border-[#b6ff00]/15 bg-black/85 px-4 py-3 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.45)]">
        <p className="text-sm font-medium text-white">
          {ITEMS[index]}
        </p>
        <p className="mt-1 text-[11px] text-white/40">
          {2 + index * 3} min ago
        </p>
      </div>
    </div>
  );
}
