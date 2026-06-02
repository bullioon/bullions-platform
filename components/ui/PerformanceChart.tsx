"use client";
import { useMemo, useState } from "react";
import { type DailyPerformance } from "@/lib/bullionsUser";
type Range = "1H" | "4H" | "1D" | "7D";
type Props = {
  depositedUsd?: number;
  profitUsd?: number;
  dailyPerformance?: DailyPerformance[];
};
type Point = {
  x: number;
  y: number;
  value: number;
};
const ranges: Range[] = ["1H", "4H", "1D", "7D"];
function takeCount(range: Range) {
  if (range === "1H") return 24;
  if (range === "4H") return 36;
  if (range === "1D") return 48;
  return 80;
}
function rangeLabels(range: Range) {
  if (range === "1H") return ["60m", "45m", "30m", "15m", "Now"];
  if (range === "4H") return ["4h", "3h", "2h", "1h", "Now"];
  if (range === "1D") return ["24h", "18h", "12h", "6h", "Now"];
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}
function smooth(values: number[]) {
  if (values.length < 4) return values;
  return values.map((value, index) => {
    if (index === 0 || index === values.length - 1) return value;
    const prev = values[index - 1];
    const next = values[index + 1];
    return value * 0.55 + prev * 0.225 + next * 0.225;
  });
}
function buildPoints(
  history: DailyPerformance[],
  depositedUsd: number,
  profitUsd: number,
  range: Range
) {
  const rows = history.slice(-takeCount(range));
  const values =
    rows.length > 2
      ? rows.map((row) => Number(row.liveWallet ?? row.depositedUsd + row.profitUsd))
      : [depositedUsd, depositedUsd + profitUsd];
  const smoothed = smooth(values);
  const min = Math.min(...smoothed);
  const max = Math.max(...smoothed);
  const spread = Math.max(1, max - min);
  return smoothed.map((value, index) => {
    const leftPad = 3;
    const rightPad = 6;
    const usable = 100 - leftPad - rightPad;
    const x =
      smoothed.length === 1
        ? 100 - rightPad
        : leftPad + (index / (smoothed.length - 1)) * usable;
    const y = 76 - ((value - min) / spread) * 48;
    return { x, y, value };
  });
}
function pathFromPoints(points: Point[]) {
  if (!points.length) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}
export function PerformanceChart({
  depositedUsd = 0,
  profitUsd = 0,
  dailyPerformance = [],
}: Props) {
  const [range, setRange] = useState<Range>("1H");
  const currentPct = depositedUsd > 0 ? (profitUsd / depositedUsd) * 100 : 0;
  const liveWallet = depositedUsd + profitUsd;
  const points = useMemo(
    () => buildPoints(dailyPerformance, depositedUsd, profitUsd, range),
    [dailyPerformance, depositedUsd, profitUsd, range]
  );
  const firstValue = points[0]?.value ?? liveWallet;
  const lastValue = points[points.length - 1]?.value ?? liveWallet;
  const rangeMovePct = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const path = pathFromPoints(points);
  const labels = rangeLabels(range);
  return (
    <section className="rounded-[24px] bg-[#111214] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/45">PnL performance</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {currentPct.toFixed(2)}%
          </h3>
          <p className="mt-1 text-sm text-white/45">Copy engine live</p>
        </div>
        <div className="text-right">
          <p className={rangeMovePct >= 0 ? "text-sm font-semibold text-[#b6ff00]" : "text-sm font-semibold text-red-400"}>
            {rangeMovePct >= 0 ? "+" : ""}
            {rangeMovePct.toFixed(2)}%
          </p>
          <p className="text-sm text-white/55">${liveWallet.toFixed(0)}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {ranges.map((item) => (
          <button
            key={item}
            onClick={() => setRange(item)}
            className={
              range === item
                ? "rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                : "rounded-full bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white/60"
            }
          >
            {item}
          </button>
        ))}
      </div>
      <div className="relative mt-6 h-[230px] overflow-hidden rounded-[22px] bg-[#08090b] ring-1 ring-white/[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.07),transparent_38%)]" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="relative z-10 h-full w-full">
          {[28, 46, 64, 82].map((y) => (
            <line
              key={y}
              x1="3"
              x2="94"
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.35"
            />
          ))}
          {[25, 50, 75].map((x) => (
            <line
              key={x}
              x1={x}
              x2={x}
              y1="14"
              y2="84"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="0.25"
            />
          ))}
          <path
            d={path}
            fill="none"
            stroke="#b6ff00"
            strokeWidth="1.15"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </svg>
        <div className="absolute left-4 top-4 z-20 rounded-full bg-white/[0.04] px-3 py-1 text-[10px] font-semibold text-white/45 ring-1 ring-white/[0.06]">
          Engine PnL
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between text-[10px] font-medium text-white/35">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
