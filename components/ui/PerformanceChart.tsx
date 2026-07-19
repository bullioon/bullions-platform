"use client";

import { useMemo, useState } from "react";
import type { DailyPerformance } from "@/lib/bullionsUser";

type Range = "24H" | "7D" | "ALL";

type Props = {
  depositedUsd?: number;
  profitUsd?: number;
  dailyPerformance?: DailyPerformance[];
};

type HistoryPoint = {
  timestamp: number;
  value: number;
};

type ChartPoint = HistoryPoint & {
  x: number;
  y: number;
};

const ranges: Range[] = ["24H", "7D", "ALL"];

function normalizeHistory(
  history: DailyPerformance[]
): HistoryPoint[] {
  const byTimestamp = new Map<number, number>();

  for (const row of history) {
    const timestamp = Date.parse(row.date);

    const value = Number(
      row.liveWallet ??
        Number(row.depositedUsd || 0) +
          Number(row.profitUsd || 0)
    );

    if (
      !Number.isFinite(timestamp) ||
      !Number.isFinite(value)
    ) {
      continue;
    }

    byTimestamp.set(timestamp, value);
  }

  return Array.from(byTimestamp.entries())
    .map(([timestamp, value]) => ({
      timestamp,
      value,
    }))
    .sort(
      (a, b) => a.timestamp - b.timestamp
    );
}

function filterRange(
  history: HistoryPoint[],
  range: Range,
  now: number
): HistoryPoint[] {
  if (range === "ALL") {
    return history;
  }

  const duration =
    range === "24H"
      ? 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

  const cutoff = now - duration;

  return history.filter(
    (point) => point.timestamp >= cutoff
  );
}

function downsample(
  history: HistoryPoint[],
  maxPoints = 48
): HistoryPoint[] {
  if (history.length <= maxPoints) {
    return history;
  }

  const result: HistoryPoint[] = [];

  for (let index = 0; index < maxPoints; index++) {
    const sourceIndex = Math.round(
      (index / (maxPoints - 1)) *
        (history.length - 1)
    );

    const point = history[sourceIndex];

    if (
      !result.length ||
      result[result.length - 1].timestamp !==
        point.timestamp
    ) {
      result.push(point);
    }
  }

  return result;
}

function addCurrentValue(
  history: HistoryPoint[],
  currentValue: number,
  now: number
): HistoryPoint[] {
  if (!history.length) {
    return history;
  }

  const next = [...history];
  const last = next[next.length - 1];

  if (now - last.timestamp < 5_000) {
    next[next.length - 1] = {
      timestamp: now,
      value: currentValue,
    };

    return next;
  }

  next.push({
    timestamp: now,
    value: currentValue,
  });

  return next;
}

function buildChartPoints(
  history: HistoryPoint[]
): ChartPoint[] {
  if (!history.length) return [];

  const values = history.map(
    (point) => point.value
  );

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const spread = maximum - minimum;

  const leftPadding = 3;
  const rightPadding = 6;
  const usableWidth =
    100 - leftPadding - rightPadding;

  return history.map((point, index) => {
    const x =
      history.length === 1
        ? 100 - rightPadding
        : leftPadding +
          (index / (history.length - 1)) *
            usableWidth;

    const y =
      spread <= 0.0001
        ? 52
        : 76 -
          ((point.value - minimum) / spread) *
            48;

    return {
      ...point,
      x,
      y,
    };
  });
}

function pathFromPoints(
  points: ChartPoint[]
): string {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(
          2
        )} ${point.y.toFixed(2)}`
    )
    .join(" ");
}

function labelForTimestamp(
  timestamp: number,
  range: Range
): string {
  const date = new Date(timestamp);

  if (range === "24H") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  if (range === "7D") {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function buildLabels(
  history: HistoryPoint[],
  range: Range
): string[] {
  if (!history.length) return [];

  const labelCount = Math.min(
    5,
    history.length
  );

  const indexes = new Set<number>();

  for (
    let index = 0;
    index < labelCount;
    index++
  ) {
    indexes.add(
      Math.round(
        (index / Math.max(1, labelCount - 1)) *
          (history.length - 1)
      )
    );
  }

  return Array.from(indexes).map((index) =>
    labelForTimestamp(
      history[index].timestamp,
      range
    )
  );
}

function signedMoney(value: number): string {
  const safeValue =
    Math.abs(value) < 0.005 ? 0 : value;

  const sign =
    safeValue > 0
      ? "+"
      : safeValue < 0
        ? "-"
        : "";

  return `${sign}$${Math.abs(
    safeValue
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function signedPercent(value: number): string {
  const safeValue =
    Math.abs(value) < 0.005 ? 0 : value;

  const sign = safeValue > 0 ? "+" : "";

  return `${sign}${safeValue.toFixed(2)}%`;
}

export function PerformanceChart({
  depositedUsd = 0,
  profitUsd = 0,
  dailyPerformance = [],
}: Props) {
  const [range, setRange] =
    useState<Range>("24H");

  const currentEquity =
    depositedUsd + profitUsd;

  const chart = useMemo(() => {
    const now = Date.now();

    const normalized =
      normalizeHistory(dailyPerformance);

    const filtered = filterRange(
      normalized,
      range,
      now
    );

    /*
     * Require at least two stored snapshots.
     * The chart never invents a performance curve.
     */
    const hasEnoughData =
      filtered.length >= 2;

    const sampled = downsample(filtered);

    const series = hasEnoughData
      ? addCurrentValue(
          sampled,
          currentEquity,
          now
        )
      : sampled;

    const points = hasEnoughData
      ? buildChartPoints(series)
      : [];

    const firstValue =
      series[0]?.value ?? currentEquity;

    const lastValue =
      series[series.length - 1]?.value ??
      currentEquity;

    const pnlUsd =
      hasEnoughData
        ? lastValue - firstValue
        : 0;

    const movePct =
      hasEnoughData && firstValue !== 0
        ? (pnlUsd / firstValue) * 100
        : 0;

    return {
      hasEnoughData,
      storedSnapshotCount: filtered.length,
      series,
      points,
      path: pathFromPoints(points),
      labels: buildLabels(series, range),
      pnlUsd,
      movePct,
    };
  }, [
    dailyPerformance,
    currentEquity,
    range,
  ]);

  const positive = chart.pnlUsd >= 0;

  return (
    <section className="rounded-[24px] bg-[#111214] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/45">
            Active Fund PnL
          </p>

          <h3 className="mt-1 text-2xl font-semibold text-white">
            {chart.hasEnoughData
              ? signedMoney(chart.pnlUsd)
              : "Collecting data"}
          </h3>

          <p className="mt-1 text-sm text-white/45">
            {chart.hasEnoughData
              ? `${range} performance`
              : "Waiting for another real snapshot"}
          </p>
        </div>

        <div className="text-right">
          <p
            className={
              positive
                ? "text-sm font-semibold text-[#b6ff00]"
                : "text-sm font-semibold text-red-400"
            }
          >
            {chart.hasEnoughData
              ? signedPercent(chart.movePct)
              : "—"}
          </p>

          <p className="text-sm text-white/55">
            $
            {currentEquity.toLocaleString(
              "en-US",
              {
                maximumFractionDigits: 2,
              }
            )}{" "}
            equity
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {ranges.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={
              range === item
                ? "rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                : "rounded-full bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.12]"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="relative mt-6 h-[230px] overflow-hidden rounded-[22px] bg-[#08090b] ring-1 ring-white/[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.07),transparent_38%)]" />

        {chart.hasEnoughData ? (
          <>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="relative z-10 h-full w-full"
            >
              {[28, 46, 64, 82].map(
                (y) => (
                  <line
                    key={y}
                    x1="3"
                    x2="94"
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="0.35"
                  />
                )
              )}

              {[25, 50, 75].map(
                (x) => (
                  <line
                    key={x}
                    x1={x}
                    x2={x}
                    y1="14"
                    y2="84"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="0.25"
                  />
                )
              )}

              <path
                d={chart.path}
                fill="none"
                stroke="#b6ff00"
                strokeWidth="1.15"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {chart.points.length ? (
                <circle
                  cx={
                    chart.points[
                      chart.points.length - 1
                    ].x
                  }
                  cy={
                    chart.points[
                      chart.points.length - 1
                    ].y
                  }
                  r="1.15"
                  fill="#b6ff00"
                />
              ) : null}
            </svg>

            <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between text-[10px] font-medium text-white/35">
              {chart.labels.map(
                (label, index) => (
                  <span
                    key={`${label}-${index}`}
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </>
        ) : (
          <div className="relative z-10 grid h-full place-items-center px-8 text-center">
            <div>
              <div className="mx-auto h-2 w-2 animate-pulse rounded-full bg-[#b6ff00]" />

              <p className="mt-4 text-sm font-semibold text-white/65">
                Collecting performance data
              </p>

              <p className="mt-2 text-xs leading-5 text-white/30">
                Bullions needs at least two real
                snapshots inside this range.
              </p>
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4 z-20 rounded-full bg-white/[0.04] px-3 py-1 text-[10px] font-semibold text-white/45 ring-1 ring-white/[0.06]">
          {chart.storedSnapshotCount} real{" "}
          {chart.storedSnapshotCount === 1
            ? "snapshot"
            : "snapshots"}
        </div>
      </div>
    </section>
  );
}
