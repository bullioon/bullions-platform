"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function ChallengeLeaderboard() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard/challenge")
      .then((res) => res.json())
      .then((data) => setRows(data.rows || []));
  }, []);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#070807] p-5 text-white">
      <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
        Challenge Leaderboard
      </p>

      <h3 className="mt-2 text-3xl font-black">Top Managers</h3>

      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <Link
            key={row.id}
            href={`/s/${row.strategyId}`}
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#b6ff00]/40 hover:bg-white/[0.06]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white">
                  #{row.position} {row.strategyName}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  {row.managerName} · Score {Number(row.score || 0).toFixed(1)}
                </p>
              </div>

              <p className="text-sm font-black text-[#b6ff00]">
                ROI {Number(row.roi || 0).toFixed(2)}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
