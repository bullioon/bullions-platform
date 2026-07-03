"use client";

import { useEffect, useMemo, useState } from "react";

import { AllocateModal } from "@/components/v2/allocate/AllocateModal";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import { useAuth } from "@/hooks/useAuth";
import type { Strategy } from "@/types/v2/domain/strategy";

function money(n: number) {
  return `$${Math.round(n || 0).toLocaleString()}`;
}

function pct(n: number | null | undefined) {
  return `${Number(n || 0).toFixed(2)}%`;
}

export function StrategyProfilePage({ strategyId }: { strategyId: string }) {
  const { user } = useAuth();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [challengeRow, setChallengeRow] = useState<any | null>(null);
  const [challengeSeason, setChallengeSeason] = useState<any | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);

  useEffect(() => {
    StrategyRepository.get(strategyId).then(setStrategy);

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

    const score =
      Number(strategy.performance.roi || 0) * 4 +
      Number(strategy.performance.winRate || 0) * 0.2 -
      Number(strategy.performance.maxDrawdown || 0) * 2 +
      Number(strategy.performance.profitFactor || 0) * 8;

    return [
      ["ROI", pct(strategy.performance.roi)],
      ["Win Rate", pct(strategy.performance.winRate)],
      ["Bullions Score", Math.max(0, Math.min(100, score)).toFixed(1)],
      ["Capital Following", money(strategy.performance.capitalFollowing)],
      ["Followers", strategy.performance.allocators.toLocaleString()],
      ["Challenge", strategy.challenge.status === "enrolled" ? "Enrolled" : "Open"],
    ];
  }, [strategy]);

  if (!strategy) {
    return (
      <main className="min-h-screen bg-[#050606] flex items-center justify-center text-white">
        Loading profile...
      </main>
    );
  }

  const roi = Number(strategy.performance.roi || 0);
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
      <section className="relative min-h-[68vh] overflow-hidden lg:min-h-[72vh]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage:
              strategy.identity.bannerUrl
                ? `url(${strategy.identity.bannerUrl})`
                : "url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2400&auto=format&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(182,255,0,0.16),transparent_24%),linear-gradient(to_bottom,rgba(5,6,6,0.35),#050606_92%)]" />

        <nav className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6">
          <div className="text-xl font-black italic">bullions</div>
          <div className="hidden gap-8 text-sm font-semibold text-white/60 md:flex">
            <span className="text-[#b6ff00]">Overview</span>
            <span>Performance</span>
            <span>Research</span>
            <span>Gallery</span>
            <span>Products</span>
          </div>
          <button className="rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-white/75">
            Share
          </button>
        </nav>

        <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col justify-end px-6 pb-8 pt-20">
          <div className="max-w-5xl">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-white/70">
              Verified Manager {strategy.status.verified ? "✓" : ""}
            </p>

            <h1 className="mt-4 text-6xl font-black tracking-[-0.08em] md:text-7xl">
              {strategy.identity.name}
            </h1>

            <p className="mt-4 max-w-2xl text-xl text-white/75">
              {strategy.identity.subtitle || strategy.identity.description}
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                  ROI All Time
                </p>
                <p className="mt-2 text-5xl font-black tracking-[-0.08em] text-[#b6ff00]">
                  {roi >= 0 ? "+" : ""}
                  {roi.toFixed(1)}%
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/35 p-6 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
                  Top 5 Challenge
                </p>
                <p className="mt-3 text-5xl font-black text-[#b6ff00]">
                  #{challengeRank}
                </p>
                <p className="mt-2 text-sm text-white/50">
                  Current Score {challengeScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[34px] border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
            <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-[#b6ff00] bg-white/10">
                {strategy.identity.avatarUrl ? (
                  <img src={strategy.identity.avatarUrl} className="h-full w-full object-cover" alt="" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">👻</div>
                )}
              </div>

              <div>
                <h2 className="text-3xl font-black">
                  {strategy.manager.displayName || strategy.manager.username || strategy.identity.name}
                </h2>
                <p className="mt-2 text-white/55">{strategy.identity.description || "Institutional macro strategy manager."}</p>
                <p className="mt-3 text-sm text-white/35">
                  Markets: {[strategy.markets.primary, ...(strategy.markets.secondary || [])].filter(Boolean).join(" · ")}
                </p>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => setAllocateOpen(true)}
                  className="h-14 rounded-2xl bg-[#b6ff00] px-14 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01]"
                >
                  Copy Strategy →
                </button>
                <div className="grid grid-cols-3 gap-3">
                  {["Follow", "Message", "Share"].map((x) => (
                    <button key={x} className="rounded-2xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white/55">
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] space-y-6 px-6 pb-12">
        <section className="grid gap-3 rounded-[30px] border border-white/10 bg-[#080909] p-5 md:grid-cols-6">
          {metrics.map(([label, value]) => (
            <div key={label} className="border-white/10 p-4 md:border-r md:last:border-r-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{label}</p>
              <p className="mt-3 text-2xl font-black">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[30px] border border-white/10 bg-[#080909] p-7">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/40">
              Monthly Challenge
            </p>
            <p className="mt-5 text-7xl font-black text-[#b6ff00]">#{challengeRank}</p>
            <p className="mt-2 text-2xl font-black">Top Five</p>
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

        <section className="rounded-[30px] border border-white/10 bg-[#080909] p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/40">Gallery</p>
            <p className="text-sm text-white/35">View All</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-6">
            {[
              "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
            ].map((src) => (
              <div key={src} className="h-32 overflow-hidden rounded-2xl bg-white/5">
                <img src={src} className="h-full w-full object-cover opacity-80" alt="" />
              </div>
            ))}
          </div>
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
