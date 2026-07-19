"use client";

import { useEffect, useState } from "react";

import { TopFloatingMenu } from "@/components/layout/TopFloatingMenu";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import { useAuth } from "@/hooks/useAuth";

type FirmState =
  | {
      status: "loading";
    }
  | {
      status: "logged_out";
    }
  | {
      status: "no_strategy";
    }
  | {
      status: "ready";
      strategyId: string;
      strategyName: string;
      challengeStatus: string;
      runtimeActive: boolean;
    };

type FirmAction = {
  label: string;
  href: string;
  tone?: "primary" | "secondary";
};

export function FirmGateway() {
  const { user, loading } = useAuth();

  const [firmState, setFirmState] =
    useState<FirmState>({
      status: "loading",
    });

  useEffect(() => {
    let alive = true;

    async function loadFirm() {
      if (loading) return;

      if (!user) {
        setFirmState({
          status: "logged_out",
        });
        return;
      }

      try {
        const strategies =
          await StrategyRepository.listByManager(
            user.uid
          );

        if (!alive) return;

        const strategy = strategies[0];

        if (!strategy) {
          setFirmState({
            status: "no_strategy",
          });
          return;
        }

        let runtime: any = null;

        try {
          const response = await fetch(
            `/api/runtime/strategy/${encodeURIComponent(
              strategy.id
            )}`,
            {
              cache: "no-store",
            }
          );

          const data = await response.json();
          runtime = data.runtime || null;
        } catch {
          runtime = null;
        }

        if (!alive) return;

        const extended =
          strategy as typeof strategy & {
            challenge?: {
              status?: string;
            };
          };

        const runtimeActive =
          runtime?.mt5?.status === "live" &&
          Boolean(runtime?.universe?.grade);

        setFirmState({
          status: "ready",
          strategyId: strategy.id,
          strategyName:
            strategy.identity?.name ||
            "Your Strategy",
          challengeStatus:
            extended.challenge?.status ||
            "not_enrolled",
          runtimeActive,
        });
      } catch {
        if (!alive) return;

        setFirmState({
          status: "no_strategy",
        });
      }
    }

    loadFirm();

    return () => {
      alive = false;
    };
  }, [user, loading]);

  if (firmState.status === "loading") {
    return (
      <Shell>
        <div className="grid min-h-[65vh] place-items-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />

            <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
              Opening Firm
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (
    firmState.status === "logged_out" ||
    !user
  ) {
    return (
      <Shell>
        <GatewayCard
          eyebrow="Your Firm"
          title="Log in to continue."
          description="Manage your public profile, strategies and Trading Desk from one place."
          href="/"
          action="Return Home"
        />
      </Shell>
    );
  }

  const managerActions: FirmAction[] = [
    {
      label: "View My Profile",
      href: `/m/${encodeURIComponent(
        user.uid
      )}`,
      tone: "primary",
    },
    {
      label: "Edit Profile",
      href: "/manager/profile",
    },
    {
      label: "My Strategies",
      href: "/manager/strategies",
    },
    {
      label: "New Strategy",
      href: "/manager/strategies/new",
    },
  ];

  if (firmState.status === "no_strategy") {
    return (
      <Shell>
        <FirmHQ
          managerActions={managerActions}
          eyebrow="Firm HQ"
          title="Build your first firm."
          description="Create your public identity and launch your first strategy."
          primaryHref="/manager/strategies/new"
          primaryAction="Create Strategy"
          statusLabel="No strategy yet"
          statusTone="neutral"
        />
      </Shell>
    );
  }

  const challengeActive =
    firmState.challengeStatus !==
      "not_enrolled" &&
    firmState.challengeStatus !==
      "draft";

  if (!challengeActive) {
    return (
      <Shell>
        <FirmHQ
          managerActions={managerActions}
          eyebrow={firmState.strategyName}
          title="Activate your strategy."
          description="Join a Challenge to receive your verified MT5 account."
          primaryHref={`/challenge?strategyId=${encodeURIComponent(
            firmState.strategyId
          )}`}
          primaryAction="Join Challenge"
          statusLabel="Challenge required"
          statusTone="warning"
        />
      </Shell>
    );
  }

  if (!firmState.runtimeActive) {
    return (
      <Shell>
        <FirmHQ
          managerActions={managerActions}
          eyebrow={firmState.strategyName}
          title="Your Trading Desk is ready."
          description="Connect to MT5 and place your first trade. Bullions will detect it automatically."
          primaryHref={`/trading-desk?strategyId=${encodeURIComponent(
            firmState.strategyId
          )}`}
          primaryAction="Open Trading Desk"
          statusLabel="Waiting for MT5"
          statusTone="warning"
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <FirmHQ
        managerActions={managerActions}
        eyebrow={firmState.strategyName}
        title="Your firm is live."
        description="Manage your public identity, strategies and verified performance."
        primaryHref={`/m/${encodeURIComponent(
          user.uid
        )}`}
        primaryAction="View Public Profile"
        statusLabel="Runtime active"
        statusTone="live"
      />
    </Shell>
  );
}

function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#050607] px-4 pb-28 pt-8 text-white md:pb-14">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(182,255,0,0.07),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1380px]">
        <TopFloatingMenu />
        {children}
      </div>
    </main>
  );
}

function FirmHQ({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryAction,
  managerActions,
  statusLabel,
  statusTone,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryAction: string;
  managerActions: FirmAction[];
  statusLabel: string;
  statusTone: "live" | "warning" | "neutral";
}) {
  const statusClasses = {
    live:
      "border-[#b6ff00]/20 bg-[#b6ff00]/[0.07] text-[#b6ff00]",
    warning:
      "border-amber-300/20 bg-amber-300/[0.07] text-amber-200",
    neutral:
      "border-white/10 bg-white/[0.04] text-white/40",
  };

  return (
    <section className="space-y-5 py-6">
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#080909] p-7 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#b6ff00]/[0.06] blur-[120px]" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
                {eyebrow}
              </p>

              <span
                className={`rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] ${statusClasses[statusTone]}`}
              >
                {statusLabel}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.065em] sm:text-6xl">
              {title}
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/40">
              {description}
            </p>
          </div>

          <a
            href={primaryHref}
            className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-[#b6ff00] px-9 text-[10px] font-black uppercase tracking-[0.17em] text-black transition hover:scale-[1.02]"
          >
            {primaryAction} →
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {managerActions.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`group flex min-h-[150px] flex-col justify-between rounded-[28px] border p-6 transition hover:-translate-y-0.5 ${
              item.tone === "primary"
                ? "border-[#b6ff00]/20 bg-[#b6ff00]/[0.055] hover:border-[#b6ff00]/40"
                : "border-white/10 bg-[#080909] hover:border-white/20"
            }`}
          >
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
              Firm Control
            </span>

            <div className="flex items-end justify-between gap-4">
              <span
                className={`text-xl font-black tracking-[-0.035em] ${
                  item.tone === "primary"
                    ? "text-[#b6ff00]"
                    : "text-white"
                }`}
              >
                {item.label}
              </span>

              <span className="text-xl text-white/20 transition group-hover:translate-x-1 group-hover:text-[#b6ff00]">
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function GatewayCard({
  eyebrow,
  title,
  description,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <section className="grid min-h-[65vh] place-items-center">
      <div className="w-full max-w-[760px] rounded-[36px] border border-white/10 bg-[#080909] p-7 text-center shadow-[0_35px_100px_rgba(0,0,0,0.35)] sm:p-12">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
          {eyebrow}
        </p>

        <h1 className="mt-5 text-4xl font-black tracking-[-0.065em] sm:text-6xl">
          {title}
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/40">
          {description}
        </p>

        <a
          href={href}
          className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[#b6ff00] px-9 text-[10px] font-black uppercase tracking-[0.17em] text-black"
        >
          {action}
        </a>
      </div>
    </section>
  );
}
