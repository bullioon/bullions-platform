"use client";

import { useEffect, useMemo, useState } from "react";
import { type DailyPerformance } from "@/lib/bullionsUser";

type Range = "1H" | "4H" | "1D" | "7D";

type ChartPoint = {
  label: string;
  value: number;
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
  const [intradayPoints, setIntradayPoints] = useState<ChartPoint[]>([]);

  const currentPct = depositedUsd > 0 ? (profitUsd / depositedUsd) * 100 : 0;

  useEffect(() => {
    if (!active) return;

    setIntradayPoints((current) => {
      const label = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const next = [...current, { label, value: currentPct }];

      return next.slice(-24);
    });
  }, [currentPct, active]);

  const points = useMemo(() => {
    if (range === "7D") {
      return data.length
        ? data.map((p) => ({
            label: p.date.slice(5),
            value: p.pnlPct,
          }))
        : Array.from({ length: 7 }).map((_, i) => ({
            label: `D${i + 1}`,
            value: 0,
          }));
    }

    if (intradayPoints.length >= 2) {
      const count = range === "1H" ? 12 : range === "4H" ? 18 : 24;
      return intradayPoints.slice(-count);
    }

    return [
      { label: "Start", value: currentPct },
      { label: "Now", value: currentPct },
    ];
  }, [range, data, intradayPoints, currentPct]);

  const width = 720;
  const height = 230;
  const padX = 28;
  const padY = 24;

  const values = points.map((p) => p.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = max - min || 1;

  const x = (i: number) =>
    padX + (i / Math.max(points.length - 1, 1)) * (width - padX * 2);

  const y = (value: number) =>
    height - padY - ((value - min) / span) * (height - padY * 2);

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`)
    .join(" ");

  const area = `${line} L ${x(points.length - 1)} ${height - padY} L ${x(0)} ${height - padY} Z`;

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
            <stop offset="0%" stopColor="#b6ff00" stopOpacity="0.09" />
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
            stroke="rgba(255,255,255,0.04)"
          />
        ))}

        <path d={area} fill="url(#pnlFill)" />
        <path
          d={line}
          fill="none"
          stroke="#b6ff00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {points.map((p, i) => (
          <circle
            key={`${p.label}-${i}`}
            cx={x(i)}
            cy={y(p.value)}
            r={i === points.length - 1 ? 4 : 2.5}
            fill="#b6ff00"
            opacity={i === points.length - 1 ? 1 : 0.35}
          />
        ))}
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs text-[#8f96a3]">
        <span>{range === "7D" ? "Daily records" : "Live intraday PnL"}</span>
        <span>Profit ÷ Deposited</span>
      </div>
    </section>
  );
}
