"use client";

import { type Trader } from "@/lib/mockTraders";

type TraderPassportProps = {
  trader: Trader | null;
  open: boolean;
  onClose: () => void;
  onCopy: (traderId: string) => void;
};

export function TraderPassport({
  trader,
  open,
  onClose,
  onCopy,
}: TraderPassportProps) {
  if (!open || !trader) return null;

  const anyTrader = trader as any;

  const score = Number(trader.topTrade || 0);
  const roi = Number(trader.roi || 0);
  const drawdown = Number(trader.maxLoss || 0);
  const capitalFollowing = Number(anyTrader.capitalFollowing || 0);
  const followers = Number(anyTrader.followers || 0);
  const winRate = Number(anyTrader.winRate || 0);
  const profitFactor = Number(anyTrader.profitFactor || 0);
  const challengeTier = String(anyTrader.challengeTier || "HELLION");
  const seasonId = String(anyTrader.seasonId || "Season 01");
  const style = String(anyTrader.style || trader.tag || "Verified challenger");
  const specialty = String(anyTrader.specialty || "Balanced Trader");
  const riskProfile = String(anyTrader.riskProfile || "MEDIUM");

  const skills = anyTrader.skills || {
    entries: 75,
    exits: 65,
    riskControl: 70,
    consistency: 70,
    recovery: 70,
    discipline: 70,
  };

  const skillRows = [
    ["⚡", "Entries", Number(skills.entries || 0)],
    ["🎯", "Exits", Number(skills.exits || 0)],
    ["🛡", "Risk Control", Number(skills.riskControl || 0)],
    ["📈", "Consistency", Number(skills.consistency || 0)],
    ["🔄", "Recovery", Number(skills.recovery || 0)],
    ["🧠", "Discipline", Number(skills.discipline || 0)],
  ] as const;

  const bestSkill = [...skillRows].sort((a, b) => b[2] - a[2])[0];
  const weakSkill = [...skillRows].sort((a, b) => a[2] - b[2])[0];

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-xl md:items-center">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[34px] border border-[#b6ff00]/15 bg-[#080908] shadow-[0_0_80px_rgba(182,255,0,0.10)]">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#b6ff00]/80 to-transparent" />

        <button
          onClick={onClose}
          className="sticky right-5 top-5 z-10 ml-auto flex w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50 transition hover:text-white"
        >
          ESC
        </button>

        <div className="px-7 pb-7">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b6ff00]/10 text-2xl ring-1 ring-[#b6ff00]/20">
              {trader.avatar || "⚔️"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                  {trader.name}
                </h2>

                <span className="rounded-full bg-[#b6ff00]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00] ring-1 ring-[#b6ff00]/20">
                  Verified
                </span>
              </div>

              <p className="mt-1 text-sm font-medium uppercase tracking-[0.22em] text-white/35">
                {challengeTier} • {seasonId.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[28px] border border-[#b6ff00]/15 bg-[#b6ff00]/[0.06] p-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b6ff00]/80">
                Bullions Score
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-6xl font-black tracking-tighter text-white">
                  {score.toFixed(1)}
                </p>
                <p className="pb-2 text-sm font-semibold text-white/35">/ 100</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Mini label="Best at" value={`${bestSkill[1]} ${bestSkill[2]}/100`} />
                <Mini label="Weakness" value={`${weakSkill[1]} ${weakSkill[2]}/100`} />
                <Mini label="Specialty" value={specialty} />
                <Mini label="Risk" value={riskProfile} />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/35">
                Trader DNA
              </p>

              <div className="mt-5 space-y-3">
                {skillRows.map(([icon, label, value]) => (
                  <SkillBar key={label} icon={icon} label={label} value={value} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="ROI" value={`+${roi.toFixed(1)}%`} positive />
            <Metric label="Drawdown" value={`${drawdown.toFixed(1)}%`} />
            <Metric label="Win Rate" value={`${winRate.toFixed(0)}%`} />
            <Metric label="Profit Factor" value={profitFactor.toFixed(2)} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric
              label="Capital Following"
              value={`$${Math.round(capitalFollowing).toLocaleString()}`}
              large
            />
            <Metric label="Followers" value={followers.toLocaleString()} large />
          </div>

          <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.035] p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/35">
              Trading Style
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{style}</p>
            <p className="mt-1 text-sm text-white/35">
              Pair: <span className="text-[#b6ff00]/80">{trader.pair || "MULTI"}</span>
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onCopy(trader.id)}
              className="flex-1 rounded-2xl bg-[#b6ff00] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01]"
            >
              Copy Trader
            </button>

            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-bold text-white/60 transition hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillBar({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  const safe = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-white/70">
          <span className="mr-2">{icon}</span>
          {label}
        </p>
        <p className="text-xs font-black text-[#b6ff00]">{safe}/100</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#b6ff00] shadow-[0_0_18px_rgba(182,255,0,0.45)]"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/5">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  positive,
  large,
}: {
  label: string;
  value: string;
  positive?: boolean;
  large?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p
        className={
          large
            ? "mt-2 text-2xl font-black text-white"
            : positive
            ? "mt-2 text-xl font-black text-[#b6ff00]"
            : "mt-2 text-xl font-black text-white"
        }
      >
        {value}
      </p>
    </div>
  );
}
