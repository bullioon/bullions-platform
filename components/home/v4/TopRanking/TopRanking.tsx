"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RankedFirm = {
  id: string;
  strategyId: string;
  name: string;

  avatarUrl: string;
  bannerUrl: string;

  roi: number;
  equity: number;
  balance: number;

  market: string;
  openTrades: number;
  totalTrades: number;
  maxDrawdown: number;

  mt5Status: string;
  href: string;
};

const fallbackImages: Record<string, string> = {
  "ax prime": "/mt5.jpeg",
  "mia capital": "/mt5.jpeg",
  "bullions ai": "/bullpad.jpg",
  "torion desk": "/bullpad.jpg",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function money(value: number) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function TopRanking() {
  const [firms, setFirms] =
    useState<RankedFirm[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch(
          "/api/mission-control",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load Strategy Universe"
          );
        }

        const payload =
          await response.json();

        const source = Array.isArray(
          payload?.leaderboards?.investment
        )
          ? payload.leaderboards.investment
          : Array.isArray(
                payload?.data?.leaderboards
                  ?.investment
              )
            ? payload.data.leaderboards
                .investment
            : [];

        const rows = source
          .map((row: any) => {
            const id = String(
              row.id ||
                row.strategyId ||
                ""
            );

            return {
              id,
              strategyId: id,

              name: String(
                row.name ||
                  "Unknown Strategy"
              ),

              avatarUrl: String(
                row.avatarUrl ||
                  row.avatar ||
                  row.imageUrl ||
                  ""
              ),

              bannerUrl: String(
                row.bannerUrl ||
                  row.banner ||
                  ""
              ),

              roi: Number(
                row.roi || 0
              ),

              equity: Number(
                row.equity ||
                  row.balance ||
                  0
              ),

              balance: Number(
                row.balance || 0
              ),

              market: String(
                row.market ||
                  row.pair ||
                  "Multi-asset"
              ),

              openTrades: Number(
                row.openTrades || 0
              ),

              totalTrades: Number(
                row.totalTrades || 0
              ),

              maxDrawdown: Number(
                row.maxDrawdown ??
                  row.drawdown ??
                  0
              ),

              mt5Status: String(
                row.mt5Status ||
                  row.mt5?.status ||
                  "offline"
              ).toLowerCase(),

              href: String(
                row.href ||
                  `/s/${encodeURIComponent(
                    id
                  )}`
              ),
            } satisfies RankedFirm;
          })
          .filter(
            (firm: RankedFirm) =>
              firm.id &&
              firm.name &&
              firm.mt5Status === "live" &&
              (
                firm.openTrades > 0 ||
                firm.totalTrades > 0
              )
          )
          .sort(
            (
              a: RankedFirm,
              b: RankedFirm
            ) => {
              if (b.roi !== a.roi) {
                return b.roi - a.roi;
              }

              return (
                b.equity - a.equity
              );
            }
          )
          .slice(0, 3);

        if (alive) {
          setFirms(rows);
        }
      } catch {
        if (alive) {
          setFirms([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    load();

    const interval =
      window.setInterval(
        load,
        15000
      );

    return () => {
      alive = false;
      window.clearInterval(
        interval
      );
    };
  }, []);

  const leader = firms[0] || null;
  const secondary = firms.slice(1);

  return (
    <section className="relative overflow-hidden rounded-[38px] border border-white/[0.09] bg-[#060707]">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[460px] w-[460px] rounded-full bg-[#b6ff00]/[0.07] blur-[150px]" />

      <div className="relative flex flex-col gap-5 border-b border-white/[0.07] px-6 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-9">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
            Strategy Universe
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-[-0.065em] text-white sm:text-6xl">
            Where performance becomes capital.
          </h2>
        </div>

        <Link
          href="/discover"
          className="shrink-0 text-[9px] font-black uppercase tracking-[0.18em] text-white/35 transition hover:text-[#b6ff00]"
        >
          Explore Universe →
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse p-6 sm:p-9">
          <div className="h-[350px] rounded-[30px] bg-white/[0.035]" />
        </div>
      ) : null}

      {!loading && !leader ? (
        <div className="px-6 py-16 text-center sm:px-9">
          <p className="text-xl font-black text-white">
            Live strategies are syncing.
          </p>

          <p className="mt-2 text-sm text-white/35">
            Verified MT5 managers will appear here automatically.
          </p>

          <Link
            href="/discover"
            className="mt-7 inline-flex h-14 items-center justify-center rounded-2xl bg-[#b6ff00] px-7 text-[9px] font-black uppercase tracking-[0.18em] text-black"
          >
            Open Strategy Universe →
          </Link>
        </div>
      ) : null}

      {!loading && leader ? (
        <div className="relative p-5 sm:p-8">
          <article className="group relative overflow-hidden rounded-[32px] border border-[#b6ff00]/15 bg-[#090a09]">
            <div className="pointer-events-none absolute -right-28 -top-36 h-96 w-96 rounded-full bg-[#b6ff00]/[0.09] blur-[120px]" />

            <div className="relative grid lg:grid-cols-[1.22fr_0.78fr]">
              <div className="p-6 sm:p-9">
                <div className="flex items-center justify-between gap-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#b6ff00] text-[10px] font-black text-black">
                      01
                    </span>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.23em] text-[#b6ff00]">
                        Universe Leader
                      </p>

                      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
                        Verified ranking
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-2 text-[8px] font-black uppercase tracking-[0.15em] text-[#b6ff00]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b6ff00]" />
                    MT5 Live
                  </span>
                </div>

                <div className="mt-10 flex min-w-0 items-center gap-5">
                  <FirmAvatar
                    firm={leader}
                    size="large"
                  />

                  <div className="min-w-0">
                    <h3 className="truncate text-4xl font-black tracking-[-0.065em] text-white transition group-hover:text-[#b6ff00] sm:text-6xl">
                      {leader.name}
                    </h3>

                    <p className="mt-3 text-sm font-bold text-white/35">
                      {leader.market} · Verified MT5 performance
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/[0.07] pt-7 sm:grid-cols-3">
                  <LeaderMetric
                    label="Live Equity"
                    value={money(
                      leader.equity
                    )}
                  />

                  <LeaderMetric
                    label="Open Positions"
                    value={`${leader.openTrades}`}
                  />

                  <LeaderMetric
                    label="Max Drawdown"
                    value={
                      leader.maxDrawdown > 0
                        ? `${leader.maxDrawdown.toFixed(
                            1
                          )}%`
                        : "Collecting"
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between border-t border-white/[0.07] bg-white/[0.018] p-6 sm:p-9 lg:border-l lg:border-t-0">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.23em] text-white/25">
                    Live ROI
                  </p>

                  <p
                    className={
                      leader.roi >= 0
                        ? "mt-3 text-6xl font-black tracking-[-0.08em] text-[#b6ff00] sm:text-7xl"
                        : "mt-3 text-6xl font-black tracking-[-0.08em] text-[#ff7373] sm:text-7xl"
                    }
                  >
                    {signedPercent(
                      leader.roi
                    )}
                  </p>

                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/35">
                    Live performance verified directly from the strategy&apos;s MT5 account.
                  </p>
                </div>

                <Link
                  href={leader.href}
                  className="mt-10 flex h-16 items-center justify-between rounded-2xl bg-[#b6ff00] px-6 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01] hover:bg-[#c7ff42]"
                >
                  <span>
                    Discover & Copy
                  </span>

                  <span>→</span>
                </Link>
              </div>
            </div>
          </article>

          {secondary.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {secondary.map(
                (firm, index) => (
                  <Link
                    key={firm.id}
                    href={firm.href}
                    className="group flex items-center gap-4 rounded-[26px] border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-[#b6ff00]/20 hover:bg-white/[0.035]"
                  >
                    <span className="text-[9px] font-black tracking-[0.16em] text-white/20">
                      {String(
                        index + 2
                      ).padStart(2, "0")}
                    </span>

                    <FirmAvatar
                      firm={firm}
                      size="small"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-lg font-black tracking-[-0.035em] text-white transition group-hover:text-[#b6ff00]">
                        {firm.name}
                      </h4>

                      <p className="mt-1 text-xs text-white/30">
                        {firm.market} · {money(
                          firm.equity
                        )} equity
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[7px] font-black uppercase tracking-[0.15em] text-white/20">
                        ROI
                      </p>

                      <p
                        className={
                          firm.roi >= 0
                            ? "mt-1 text-xl font-black text-[#b6ff00]"
                            : "mt-1 text-xl font-black text-[#ff7373]"
                        }
                      >
                        {signedPercent(
                          firm.roi
                        )}
                      </p>
                    </div>

                    <span className="text-xl text-white/20 transition group-hover:translate-x-1 group-hover:text-[#b6ff00]">
                      →
                    </span>
                  </Link>
                )
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function FirmAvatar({
  firm,
  size,
}: {
  firm: RankedFirm;
  size: "large" | "small";
}) {
  const normalizedName =
    firm.name.toLowerCase();

  const image =
    firm.avatarUrl ||
    firm.bannerUrl ||
    fallbackImages[
      normalizedName
    ] ||
    "";

  const sizeClasses =
    size === "large"
      ? "h-20 w-20 rounded-[24px] sm:h-24 sm:w-24"
      : "h-14 w-14 rounded-[18px]";

  return (
    <div className="relative shrink-0">
      {image ? (
        <img
          src={image}
          alt={firm.name}
          className={`${sizeClasses} border border-white/10 object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses} grid place-items-center border border-[#b6ff00]/20 bg-[#b6ff00]/10 text-sm font-black text-[#b6ff00]`}
        >
          {initials(firm.name)}
        </div>
      )}

      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-[#090a09] bg-[#b6ff00] shadow-[0_0_14px_rgba(182,255,0,.75)]" />
    </div>
  );
}

function LeaderMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-white/75">
        {value}
      </p>
    </div>
  );
}
