"use client";

import { useEffect, useMemo, useState } from "react";

import { AllocateModal } from "@/components/v2/allocate/AllocateModal";
import { SixAssessmentCard } from "@/components/v2/six/SixAssessmentCard";
import { StrategyHero } from "@/components/v2/strategy-profile/StrategyHero";
import { StrategyGallery } from "@/components/v2/strategy-profile/StrategyGallery";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";
import { useAuth } from "@/hooks/useAuth";
import type { Strategy } from "@/types/v2/domain/strategy";
import type { Manager } from "@/types/v2/domain/manager";
import type { StrategyRuntime } from "@/core/v2/runtime";


function timeAgo(ms: number | null | undefined) {
  if (!ms) return "Pending";

  const diff = Math.max(0, Date.now() - Number(ms));
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;

  return new Date(Number(ms)).toLocaleDateString();
}

function gradeLabel(value: string | undefined) {
  if (!value) return "Pending";
  return value.replace("_", " ").toUpperCase();
}

function money(n: number) {
  return `$${Math.round(n || 0).toLocaleString()}`;
}

function pct(n: number | null | undefined) {
  return `${Number(n || 0).toFixed(2)}%`;
}

export function StrategyProfilePage({
  strategyId,
  initialAllocateOpen = false,
}: {
  strategyId: string;
  initialAllocateOpen?: boolean;
}) {
  const { user } = useAuth();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [manager, setManager] = useState<Manager | null>(null);
  const [runtime, setRuntime] = useState<StrategyRuntime | null>(null);
  const [allocateOpen, setAllocateOpen] = useState(
    initialAllocateOpen
  );
  const [challengeRow, setChallengeRow] = useState<any | null>(null);
  const [challengeSeason, setChallengeSeason] = useState<any | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);

  useEffect(() => {
    StrategyRepository.get(strategyId).then(async (nextStrategy) => {
      setStrategy(nextStrategy);

      const managerUid = nextStrategy?.manager?.uid;

      if (!managerUid) {
        setManager(null);
        return;
      }

      try {
        const nextManager = await ManagerRepository.get(managerUid);
        setManager(nextManager);
      } catch {
        setManager(null);
      }
    });

    fetch(`/api/runtime/strategy/${encodeURIComponent(strategyId)}`)
      .then((res) => res.json())
      .then((data) => {
        setRuntime(data.runtime || null);
      })
      .catch(() => {
        setRuntime(null);
      });

    fetch("/api/leaderboard/challenge")
      .then((res) => res.json())
      .then((data) => {
        setChallengeSeason(data.season || null);
        setChallengeRow(
          (data.rows || []).find((row: any) => row.strategyId === strategyId) || null
        );
      })
      .catch(() => {
        setChallengeSeason(null);
        setChallengeRow(null);
      });

    fetch(`/api/performance/history?strategyId=${encodeURIComponent(strategyId)}`)
      .then((res) => res.json())
      .then((data) => {
        setPerformanceHistory(Array.isArray(data.rows) ? data.rows : []);
      })
      .catch(() => {
        setPerformanceHistory([]);
      });
  }, [strategyId]);

  const metrics = useMemo(() => {
    if (!strategy) return [];

    const performance = runtime?.performance ?? strategy.performance;
    const livePerformance = performance as typeof performance & {
      equity?: number;
      balance?: number;
      totalTrades?: number;
    };
    const scores = runtime?.scores;

    const score =
      scores?.allocatorScore ??
      (Number(performance.roi || 0) * 4 +
        Number(performance.winRate || 0) * 0.2 -
        Number(performance.maxDrawdown || 0) * 2 +
        Number(performance.profitFactor || 0) * 8);

    return [
      ["ROI", pct(performance.roi)],
      ["Equity", money(Number(livePerformance.equity || 0))],
      ["Balance", money(Number(livePerformance.balance || 0))],
      ["Max DD", pct(performance.maxDrawdown)],
      ["Win Rate", pct(performance.winRate)],
      ["Profit Factor", Number(performance.profitFactor || 0).toFixed(2)],
      ["Trades", Number(livePerformance.totalTrades || 0).toLocaleString()],
      ["Score", Math.max(0, Math.min(100, score)).toFixed(1)],
      ["Capital", money(strategy.performance.capitalFollowing)],
      ["Allocators", Math.max(0, Number(strategy.performance.allocators || 0)).toLocaleString()],
      ["Grade", runtime?.universe.grade ? runtime.universe.grade.toUpperCase() : "PENDING"],
      ["Challenge", runtime?.challenge.status === "enrolled" || strategy.challenge.status === "enrolled" ? "Enrolled" : "Open"],
    ];
  }, [strategy, runtime]);

  if (!strategy) {
    return (
      <main className="min-h-screen bg-[#050606] flex items-center justify-center text-white">
        Loading profile...
      </main>
    );
  }

  const performance = runtime?.performance ?? strategy.performance;
  const roi = Number(performance.roi || 0);
  const runtimeGrade = gradeLabel(runtime?.universe.grade);
  const allocatorScore = Number(runtime?.scores.allocatorScore || 0);
  const lastSyncLabel = timeAgo(runtime?.performance.lastSyncedAt);
  const mt5Status =
    runtime?.mt5.status || "pending";

  const mt5Connected =
    runtime?.mt5.connected === true;
  const challengeRank = challengeRow?.position || strategy.challenge.rank || "-";
  const challengeScore = Number(challengeRow?.score || 0);
  const challengePrize = Number(challengeSeason?.prizePoolUsd || strategy.challenge.prizeUsd || 50000);
  const challengeEligible = Boolean(challengeRow?.eligibleForTopFive);
  const challengeEntryFee =
    challengeRow?.tierId === "demo_200k"
      ? 1080
      : challengeRow?.tierId === "demo_50k"
        ? 350
        : Number(strategy.challenge.entryFeeUsd || 350);
  const challengeTier =
    challengeRow?.tierId === "demo_200k"
      ? "200K Demo"
      : challengeRow?.tierId === "demo_50k"
        ? "50K Demo"
        : "Not enrolled";

  const normalizedPerformanceHistory = performanceHistory.map((row, index, list) => {
    const currentDeposits = Number(row.deposits || 0);
    const previousDeposits = Number(list[index - 1]?.deposits || currentDeposits);

    const depositChanged =
      index > 0 &&
      previousDeposits > 0 &&
      Math.abs(currentDeposits - previousDeposits) / previousDeposits > 0.25;

    return {
      ...row,
      depositChanged,
    };
  });

  const lastRebaseIndex = normalizedPerformanceHistory.reduce(
    (lastIndex, row, index) => (row.depositChanged ? index : lastIndex),
    0
  );

  const visiblePerformanceHistory = normalizedPerformanceHistory.slice(lastRebaseIndex);

  const performanceValues = visiblePerformanceHistory.map(
    (row) => Number(row.roi || 0)
  );

  const performanceMin = performanceValues.length
    ? Math.min(...performanceValues)
    : 0;

  const performanceMax = performanceValues.length
    ? Math.max(...performanceValues)
    : 0;

  const performanceRange = Math.max(
    0.01,
    performanceMax - performanceMin
  );

  const chartSegments = visiblePerformanceHistory.reduce<string[][]>(
    (segments, row, index) => {
      const value = Number(row.roi || 0);

      const x =
        visiblePerformanceHistory.length === 1
          ? 50
          : (index / (visiblePerformanceHistory.length - 1)) * 100;

      const y =
        36 - ((value - performanceMin) / performanceRange) * 30;

      const point = `${x.toFixed(2)},${y.toFixed(2)}`;

      if (row.depositChanged || segments.length === 0) {
        segments.push([point]);
      } else {
        segments[segments.length - 1].push(point);
      }

      return segments;
    },
    []
  );

  const latestHistoryRoi =
    performanceHistory.length > 0
      ? Number(performanceHistory[performanceHistory.length - 1]?.roi || 0)
      : Number(strategy.performance.roi || 0);

  return (
    <main className="min-h-screen bg-[#050606] text-white">
      <StrategyHero
        strategy={strategy}
        runtime={runtime}
        challengeRank={challengeRank}
        challengeScore={challengeScore}
        onAllocate={() => setAllocateOpen(true)}
      />

      <div className="mx-auto max-w-[1600px] space-y-6 px-6 pb-12">

        <StrategyGallery
          strategy={strategy}
          manager={manager}
        />


        <section className="grid gap-3 rounded-[30px] border border-white/10 bg-[#080909] p-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {metrics.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{label}</p>
              <p className="mt-3 break-words text-2xl font-black leading-tight">{value}</p>
            </div>
          ))}
        </section>

        {runtime?.six ? (
          <SixAssessmentCard
            score={Math.max(1, Math.min(10, Math.round((runtime.scores.allocatorScore || 0) / 10)))}
            execution={runtime.universe.grade}
            risk={runtime.performance.maxDrawdown >= 10 ? "Elevated" : "Controlled"}
            consistency={runtime.scores.consistencyScore >= 70 ? "Strong" : "Developing"}
            summary={runtime.six.assessment}
            updated={runtime.performance.lastSyncedAt ? new Date(runtime.performance.lastSyncedAt).toLocaleDateString() : "Live"}
          />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[30px] border border-white/10 bg-[#080909] p-7">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/40">
              Monthly Challenge
            </p>
            <p className="mt-5 text-7xl font-black text-[#b6ff00]">
              {challengeRank === "-" ? "OPEN" : `#${challengeRank}`}
            </p>
            <p className="mt-2 text-2xl font-black">
              {challengeRank === "-" ? "Not enrolled" : "Top Five"}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Mini label="Prize Pool" value={money(challengePrize)} />
              <Mini label="Entry Fee" value={money(challengeEntryFee)} />
              <Mini label="Tier" value={challengeTier} />
              <Mini label="Eligible" value={challengeEligible ? "Yes" : "Pending"} />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-[#080909] p-7">
            <div className="flex justify-between">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/40">
                Performance ROI
              </p>
              <div className="text-right">
                <p className="text-sm font-black text-[#b6ff00]">{pct(latestHistoryRoi)}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
                  {performanceHistory.length} snapshots{normalizedPerformanceHistory.some((row) => row.depositChanged) ? " · rebased" : ""}
                </p>
              </div>
            </div>

            <div className="mt-8 h-[320px] rounded-[24px] border border-white/10 bg-[linear-gradient(to_top,rgba(182,255,0,0.12),transparent),radial-gradient(circle_at_70%_30%,rgba(182,255,0,0.12),transparent_25%)] p-6">
              {chartSegments.length ? (
                <svg viewBox="0 0 100 40" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                  <line x1="0" y1="36" x2="100" y2="36" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
                  <line x1="0" y1="21" x2="100" y2="21" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
                  <line x1="0" y1="6" x2="100" y2="6" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />

                  {chartSegments.map((segment, index) => (
                    <polyline
                      key={index}
                      fill="none"
                      stroke="#b6ff00"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      points={segment.join(" ")}
                    />
                  ))}
                </svg>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/30">
                  No performance history yet
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Panel title="Strategy">
            <Mini label="Primary Market" value={strategy.markets.primary || "Gold"} />
            <Mini label="Risk Profile" value={strategy.investment.riskProfile} />
            <Mini label="Holding Time" value={strategy.investment.holdingTime} />
            <Mini label="Capacity" value={money(strategy.investment.capacity)} />
          </Panel>

          <Panel title="Capital Allocation">
            <div className="flex h-52 items-center justify-center rounded-[24px] border border-white/10 bg-black/20">
              <div className="text-center">
                <p className="text-4xl font-black">{money(strategy.performance.capitalFollowing)}</p>
                <p className="mt-2 text-sm text-white/40">Capital Following</p>
              </div>
            </div>
          </Panel>

          <Panel title="Bullions AI">
            <Mini label="Risk" value={Number(strategy.performance.maxDrawdown || 0) <= 4 ? "LOW" : "MEDIUM"} />
            <Mini label="Consistency" value={`${Math.max(60, Math.round(Number(strategy.performance.winRate || 0)))}%`} />
            <Mini label="Confidence" value="HIGH" />
            <Mini label="Signal" value="Copy Eligible" />
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <Panel title="Latest Research">
            {["Gold Macro Outlook", "Indices Breakdown", "Bitcoin Cycle Update"].map((x, i) => (
              <div key={x} className="border-b border-white/10 py-4 last:border-0">
                <p className="font-bold">{x}</p>
                <p className="mt-1 text-sm text-white/35">{i + 5} min read · Published recently</p>
              </div>
            ))}
          </Panel>

          <Panel title="Products & Access">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Premium Copy Access", "$99 / month"],
                ["Macro Course", "$299"],
                ["Signals Channel", "$149 / month"],
              ].map(([name, price]) => (
                <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-3xl text-[#b6ff00]">♛</p>
                  <p className="mt-5 font-bold">{name}</p>
                  <p className="mt-6 text-lg font-black">{price}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="rounded-[30px] border border-[#b6ff00]/40 bg-[#080909] p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/40">Ready to grow with {strategy.identity.name}?</p>
              <h2 className="mt-2 text-4xl font-black">Copy {strategy.identity.name}</h2>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Capital Following</p>
              <p className="mt-1 text-2xl font-black">{money(strategy.performance.capitalFollowing)}</p>
            </div>

            <button
              onClick={() => setAllocateOpen(true)}
              className="h-16 rounded-2xl bg-[#b6ff00] px-12 font-black uppercase tracking-[0.18em] text-black"
            >
              Copy Strategy →
            </button>
          </div>
        </section>
      </div>

      <AllocateModal
        open={allocateOpen}
        onClose={() => setAllocateOpen(false)}
        userId={user?.uid || "guest"}
        traderId={strategy.manager.uid}
        strategyId={strategy.id}
      />
    </main>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 py-3 last:border-0">
      <p className="text-xs text-white/35">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[#080909] p-6">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-white/40">{title}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
