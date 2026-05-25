"use client";

import { useMemo, useState } from "react";
import { type DailyPerformance } from "@/lib/bullionsUser";

type Range = "1H" | "4H" | "1D" | "7D";

type ChartPoint = {
  label: string;
  value: number;
};

const shapes: Record<Range, number[]> = {
  "1H": [0, 0.08, 0.05, 0.14, 0.11, 0.2, 0.18, 0.27, 0.31, 0.28, 0.36, 0.41],
  "4H": [0, 0.05, 0.03, 0.1, 0.08, 0.18, 0.24, 0.21, 0.32, 0.38, 0.34, 0.43],
  "1D": [0, -0.03, 0.05, 0.02, -0.02, 0.08, 0.06, 0.14, 0.2, 0.19, 0.28, 0.33],
  "7D": [0, 0.12, 0.24, 0.39, 0.55, 0.53, 0.58],
};

export function PerformanceChart({
  active = true,
  data = [],
  liveWallet = 0,
  profitUsd = 0,
  depositedUsd = 0,
}: {
  active?: boolean;
  data?: DailyPerformance[];
  liveWallet?: number;
  profitUsd?: number;
  depositedUsd?: number;
}) {
  const [range, setRange] = useState<Range>("1H");

  const currentPct = depositedUsd > 0 ? (profitUsd / depositedUsd) * 100 : 0;

  const points = useMemo<ChartPoint[]>(() => {
    const real = (data || []).filter((p) => typeof p.pnlPct === "number");

    if (real.length >= 2) {
      const limit = range === "1H" ? 18 : range === "4H" ? 32 : range === "1D" ? 60 : 120;

      return real.slice(-limit).map((p, i) => ({
        label: p.date || `${i + 1}`,
        value: Number(p.pnlPct.toFixed(2)),
      }));
    }

    return [
      { label: "Start", value: Number(currentPct.toFixed(2)) },
      { label: "Collecting", value: Number(currentPct.toFixed(2)) },
      { label: "Now", value: Number(currentPct.toFixed(2)) },
    ];
  }, [range, data, currentPct]);

  const width = 720;
  const height = 230;
  const padX = 28;
  const padY = 24;

  const values = points.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(rawMax - rawMin, 1);
  const mid = (rawMin + rawMax) / 2;
  const min = mid - span / 2;
  const max = mid + span / 2;

  const round = (n: number) => Number(n.toFixed(3));

  const x = (i: number) =>
    round(padX + (i / Math.max(points.length - 1, 1)) * (width - padX * 2));

  const y = (value: number) =>
    round(height - padY - ((value - min) / (max - min || 1)) * (height - padY * 2));

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`)
    .join(" ");

  const area = `${line} L ${x(points.length - 1)} ${height - padY} L ${x(0)} ${
    height - padY
  } Z`;

  const first = points[0]?.value ?? 0;
  const last = points[points.length - 1]?.value ?? 0;
  const change = last - first;

  return (
    <section className="rounded-[24px] bg-[#111214] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[#8f96a3]">PnL performance</p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {last.toFixed(2)}%
          </h2>
          <p className="mt-1 text-xs text-[#8f96a3]">
            {active ? "Copy engine live" : "Copy engine paused"}
          </p>
        </div>

        <div className="text-right">
          <p className={change >= 0 ? "text-sm font-medium text-[#b6ff00]" : "text-sm font-medium text-red-400"}>
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </p>
          <p className="text-xs text-[#8f96a3]">
            ${liveWallet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(["1H", "4H", "1D", "7D"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setRange(item)}
            className={
              range === item
                ? "rounded-full bg-white px-3 py-1 text-xs font-medium text-black"
                : "rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-[#8f96a3] hover:bg-white/[0.1]"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[230px] w-full">
        <defs>
          <linearGradient id="pnlFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#b6ff00" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#b6ff00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1="28"
            x2="692"
            y1={56 + i * 50}
            y2={56 + i * 50}
            stroke="rgba(255,255,255,0.05)"
          />
        ))}

        <path d={area} fill="url(#pnlFill)" />
        <path
          d={line}
          fill="none"
          stroke="#b6ff00"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <circle
            key={`${p.label}-${i}`}
            cx={x(i)}
            cy={y(p.value)}
            r={i === points.length - 1 ? 4.8 : 2}
            fill="#b6ff00"
            opacity={i === points.length - 1 ? 1 : 0.28}
          />
        ))}
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs text-[#8f96a3]">
        <span>
          {(data || []).length < 4
            ? "Collecting live engine data"
            : range === "7D"
            ? "Daily records"
            : "Live intraday PnL"}
        </span>
        <span>Profit + Deposited</span>
      </div>
    </section>
  );
}
