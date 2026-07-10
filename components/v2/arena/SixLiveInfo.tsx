"use client";

import { useEffect, useMemo, useState } from "react";

export function SixLiveInfo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 2600);
    return () => clearInterval(id);
  }, []);

  const live = useMemo(() => {
    return {
      health: 91 + (tick % 5),
      allocation: 88 + (tick % 8),
      exposure: tick % 3 === 0 ? "Gold High" : "Controlled",
      suggestion:
        tick % 3 === 0
          ? "Reduce Gold to 18%"
          : tick % 3 === 1
            ? "Increase Nasdaq exposure"
            : "Keep risk medium",
    };
  }, [tick]);

  return (
    <section className="mx-auto max-w-[980px] px-4">
      <div className="rounded-[34px] border border-[#8b5cf6]/25 bg-[#120b1b] p-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8b4ff]">
              6X Live
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.06em] md:text-5xl">
              AI capital layer.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/50">
              6X reads allocation, exposure, SL, TP and correlation before capital moves.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-black/20 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                Portfolio Health
              </p>

              <p className="text-4xl font-black tracking-[-0.06em] text-[#d8b4ff]">
                {live.health}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Mini label="Allocation" value={`${live.allocation}%`} good />
              <Mini label="Exposure" value={live.exposure} warning={live.exposure !== "Controlled"} />
              <Mini label="Risk" value="Medium" />
            </div>

            <div className="mt-5 rounded-[24px] border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d8b4ff]">
                Suggested action
              </p>
              <p className="mt-2 text-xl font-black tracking-[-0.04em]">
                {live.suggestion}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Mini({
  label,
  value,
  good = false,
  warning = false,
}: {
  label: string;
  value: string;
  good?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>
      <p
        className={`mt-2 text-sm font-black ${
          good ? "text-[#b6ff00]" : warning ? "text-[#d6b35a]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
