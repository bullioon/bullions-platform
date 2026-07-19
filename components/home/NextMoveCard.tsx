"use client";

type NextAction = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  action: string;
  status:
    | "required"
    | "attention"
    | "available"
    | "stable";
};

type StrategyState = {
  id: string;
  name: string;
  challengeStatus: string;
  runtimeActive: boolean;
  roi: number;
  rank: number | null;
} | null;

type NextMoveCardProps = {
  nextAction: NextAction;
  strategy: StrategyState;
  challengeJoined: boolean;
  strategyLoading: boolean;
  portfolioUsd: number;
  fundTraderCount: number;
  fundActive: boolean;
};

export function NextMoveCard({
  nextAction,
  strategy,
  challengeJoined,
  strategyLoading,
  portfolioUsd,
  fundTraderCount,
  fundActive,
}: NextMoveCardProps) {
  const state = (() => {
    if (portfolioUsd <= 0) {
      return {
        label: "Capital",
        value: "$0",
        secondLabel: "Status",
        secondValue: "Waiting",
        thirdLabel: "Next step",
        thirdValue: "Fund BullPad",
        mission: "Deploy capital",
      };
    }

    if (!fundActive || fundTraderCount === 0) {
      return {
        label: "Capital",
        value: money(portfolioUsd),
        secondLabel: "Strategies",
        secondValue: `${fundTraderCount}`,
        thirdLabel: "Status",
        thirdValue: "Ready",
        mission: "Build allocation",
      };
    }

    if (strategyLoading) {
      return {
        label: "Strategy",
        value: "Syncing",
        secondLabel: "Runtime",
        secondValue: "Reading",
        thirdLabel: "Status",
        thirdValue: "Please wait",
        mission: "Reading systems",
      };
    }

    if (!strategy) {
      return {
        label: "Account",
        value: "$200K",
        secondLabel: "Runtime",
        secondValue: "MT5 Ready",
        thirdLabel: "Target",
        thirdValue: "Top 6",
        mission: "Launch strategy",
      };
    }

    if (!challengeJoined) {
      return {
        label: "Strategy",
        value: strategy.name,
        secondLabel: "Runtime",
        secondValue: strategy.runtimeActive
          ? "Verified"
          : "Pending",
        thirdLabel: "Target",
        thirdValue: "Join Challenge",
        mission: "Enter competition",
      };
    }

    return {
      label: "Rank",
      value: strategy.rank
        ? `#${strategy.rank}`
        : "Pending",
      secondLabel: "ROI",
      secondValue: signedPercent(strategy.roi),
      thirdLabel: "Runtime",
      thirdValue: strategy.runtimeActive
        ? "Verified"
        : "Active",
      mission: "Climb the ranking",
    };
  })();

  return (
    <article className="group relative overflow-hidden rounded-[34px] border border-white/[0.09] bg-[#070808]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(182,255,0,0.11),transparent_28%),radial-gradient(circle_at_8%_100%,rgba(122,70,255,0.10),transparent_34%)]" />

      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border border-[#b6ff00]/10" />
      <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/[0.05]" />

      <div className="relative grid min-h-[430px] lg:grid-cols-[1.18fr_0.82fr]">
        <div className="flex flex-col p-7 sm:p-9 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
              Next Move
            </p>

            <StatusBadge status={nextAction.status} />
          </div>

          <div className="my-auto py-10">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
              {nextAction.eyebrow}
            </p>

            <h2 className="mt-4 max-w-[760px] text-balance text-4xl font-black leading-[0.95] tracking-[-0.065em] text-white sm:text-5xl lg:text-6xl">
              {nextAction.title}
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-6 text-white/40 sm:text-base">
              {nextAction.description}
            </p>
          </div>

          <div className="flex flex-col gap-5 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                Current mission
              </p>

              <p className="mt-2 text-sm font-black text-white/65">
                {state.mission}
              </p>
            </div>

            <a
              href={nextAction.href}
              className="inline-flex min-h-14 items-center justify-between gap-10 rounded-2xl bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01] hover:bg-[#c7ff42]"
            >
              <span>{nextAction.action}</span>
              <span>→</span>
            </a>
          </div>
        </div>

        <div className="relative border-t border-white/[0.07] bg-white/[0.018] p-7 sm:p-9 lg:border-l lg:border-t-0">
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
                  Mission briefing
                </p>

                <p className="mt-3 text-xl font-black tracking-[-0.04em] text-white">
                  Your next objective
                </p>
              </div>

              <div className="grid h-14 w-14 place-items-center rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 text-sm font-black text-[#b6ff00]">
                01
              </div>
            </div>

            <div className="my-auto divide-y divide-white/[0.07] py-8">
              <MissionRow
                label={state.label}
                value={state.value}
                accent
              />

              <MissionRow
                label={state.secondLabel}
                value={state.secondValue}
              />

              <MissionRow
                label={state.thirdLabel}
                value={state.thirdValue}
              />
            </div>

            <div className="rounded-[22px] border border-[#b6ff00]/15 bg-[#b6ff00]/[0.06] p-5">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#b6ff00]" />

                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
                  Bullions systems ready
                </p>
              </div>

              <p className="mt-3 text-xs leading-5 text-white/35">
                Complete this objective to unlock the next stage of your Bullions journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MissionRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p
        className={
          accent
            ? "max-w-[65%] truncate text-right text-xl font-black text-[#b6ff00]"
            : "max-w-[65%] truncate text-right text-sm font-black text-white/75"
        }
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: NextAction["status"];
}) {
  const config = {
    required: {
      label: "Required",
      className:
        "border-red-400/20 bg-red-400/10 text-red-300",
    },
    attention: {
      label: "Attention",
      className:
        "border-amber-300/20 bg-amber-300/10 text-amber-200",
    },
    available: {
      label: "Available",
      className:
        "border-[#7a46ff]/30 bg-[#7a46ff]/10 text-[#c7b3ff]",
    },
    stable: {
      label: "Operational",
      className:
        "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]",
    },
  }[status];

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-[0.16em] ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function signedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
