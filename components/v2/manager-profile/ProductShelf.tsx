import Link from "next/link";

import type { Strategy } from "@/types/v2/domain/strategy";
import type { ManagerRuntimeStrategy } from "@/core/v2/runtime/ManagerRuntime";

type Props = {
  strategies: Strategy[];
  runtimeStrategies?: ManagerRuntimeStrategy[];
};

function pct(value: number | null | undefined, decimals = 1) {
  const number = Number(value || 0);

  return `${number >= 0 ? "+" : ""}${number.toFixed(decimals)}%`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function gradeLabel(value?: string) {
  return value
    ? value.replaceAll("_", " ").toUpperCase()
    : "PENDING";
}

function statusTone(status?: string) {
  if (status === "live") {
    return "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]";
  }

  if (status === "stale") {
    return "border-amber-400/25 bg-amber-400/10 text-amber-300";
  }

  if (status === "offline") {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }

  return "border-white/10 bg-white/[0.04] text-white/35";
}

export function ProductShelf({
  strategies,
  runtimeStrategies = [],
}: Props) {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
            Investment Products
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-white sm:text-4xl">
            Strategies managed by this firm.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
            Each strategy has its own execution history, allocation capacity and risk profile.
          </p>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/25">
          {strategies.length} product{strategies.length === 1 ? "" : "s"}
        </p>
      </div>

      {strategies.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {strategies.map((strategy) => {
            const runtime = runtimeStrategies.find(
              (item) => item.strategyId === strategy.id
            );

            const roi =
              runtime?.roi ??
              Number(strategy.performance.roi || 0);

            const capital =
              runtime?.capitalFollowing ??
              Number(strategy.performance.capitalFollowing || 0);

            const allocators =
              runtime?.allocators ??
              Number(strategy.performance.allocators || 0);

            const grade = gradeLabel(runtime?.grade);

            const mt5Status =
              runtime?.mt5Status || "pending";

            const allocatorScore =
              runtime?.allocatorScore ?? 0;

            return (
              <article
                key={strategy.id}
                className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-[#080909] transition duration-300 hover:-translate-y-1 hover:border-[#b6ff00]/20"
              >
                <div className="relative h-[220px] overflow-hidden border-b border-white/10 bg-[#0b0d0c]">
                  {strategy.identity.bannerUrl ? (
                    <img
                      src={strategy.identity.bannerUrl}
                      alt={`${strategy.identity.name} cover`}
                      className="h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-80"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(182,255,0,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.15),transparent_26%),linear-gradient(180deg,#0d100e,#070807)]" />

                      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:34px_34px]" />
                    </>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#080909] via-transparent to-black/15" />

                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] ${statusTone(mt5Status)}`}
                    >
                      MT5 {mt5Status}
                    </span>

                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/55 backdrop-blur-xl">
                      {grade}
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-black/40 text-lg font-black text-[#b6ff00] backdrop-blur-xl">
                        {strategy.identity.avatarUrl ? (
                          <img
                            src={strategy.identity.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          strategy.identity.name.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-2xl font-black tracking-[-0.045em] text-white">
                          {strategy.identity.name}
                        </h3>

                        <p className="mt-1 truncate text-sm text-white/45">
                          {strategy.identity.subtitle ||
                            strategy.markets.primary ||
                            "Investment strategy"}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-4xl font-black tracking-[-0.07em] text-[#b6ff00]">
                      {pct(roi)}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
                    <Metric
                      label="Allocator Score"
                      value={allocatorScore.toFixed(0)}
                    />

                    <Metric
                      label="Max Drawdown"
                      value={pct(
                        Number(strategy.performance.maxDrawdown || 0)
                      )}
                    />

                    <Metric
                      label="Capital"
                      value={money(capital)}
                    />

                    <Metric
                      label="Allocators"
                      value={allocators.toLocaleString()}
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                      <span>
                        {strategy.investment.riskProfile}
                      </span>

                      <span>·</span>

                      <span>
                        {strategy.investment.holdingTime}
                      </span>

                      <span>·</span>

                      <span>
                        {strategy.markets.primary}
                      </span>
                    </div>

                    <Link
                      href={`/s/${strategy.id}`}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.015]"
                    >
                      View Strategy →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-[260px] place-items-center rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <div>
            <p className="text-xl font-black text-white">
              No strategies published
            </p>

            <p className="mt-2 text-sm text-white/35">
              Investment products managed by this firm will appear here.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.17em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}
