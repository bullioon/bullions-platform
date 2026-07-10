import Link from "next/link";

import { Badge } from "@/components/v2/ui/Badge";
import { Button } from "@/components/v2/ui/Button";
import { Card } from "@/components/v2/ui/Card";

type Row = {
  id: string;
  strategyId?: string;
  strategyName?: string;
  managerName?: string;
  position?: number;
  roi?: number;
  score?: number;
};

type Props = {
  rows: Row[];
};

function roi(value: unknown) {
  const n = Number(value || 0);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function ChallengeLiveHero({ rows }: Props) {
  const top = rows.slice(0, 5);
  const leader = top[0];
  const challenger = top[1];

  return (
    <section className="space-y-6">
      <div className="rounded-[36px] border border-white/10 bg-[#080909] p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Badge tone="green">● Live</Badge>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.24em] text-white/30">
              Bullions Challenge
            </p>
          </div>

          <Mini label="Season" value="Season 1" />
          <Mini label="Trading Day" value="Day 18 / 30" />
          <Mini label="Next Challenge" value="Registration Open" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#b6ff00]">
            Top 5 Live Leaderboard
          </p>

          <h1 className="mt-4 max-w-5xl text-6xl font-black tracking-[-0.08em]">
            The fight for the crown is live.
          </h1>

          <p className="mt-5 max-w-3xl text-xl leading-8 text-white/55">
            Watch the best managers battle for Top 5 status. Open their profile,
            study their strategy, and copy the trader you believe can win the season.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bullpad">
              <Button>Open BullPad</Button>
            </Link>

            <Link href="/manager/strategies/new">
              <Button variant="secondary">Register Next Challenge</Button>
            </Link>
          </div>
        </Card>

        <Card className="bg-black/25">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
            🎙 SIX Live
          </p>

          <p className="mt-5 text-2xl font-black leading-9">
            {leader
              ? `${leader.strategyName || "The leader"} is holding #1.`
              : "Loading the live battle..."}
          </p>

          <p className="mt-4 leading-7 text-white/45">
            {leader && challenger
              ? `${challenger.strategyName || "The challenger"} is chasing the crown. The Top 5 is where prestige turns into capital.`
              : "SIX will surface live battle context as rankings update."}
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b6ff00]">
              Current Top 5
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.06em]">
              Copy the manager you believe in.
            </h2>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {top.map((row, index) => (
            <div key={row.id} className="grid gap-5 py-6 md:grid-cols-[90px_1fr_auto] md:items-center">
              <div className="text-5xl font-black text-[#b6ff00]">
                #{row.position || index + 1}
              </div>

              <div>
                <h3 className="text-3xl font-black tracking-[-0.05em]">
                  {row.strategyName || "Unknown Manager"}
                </h3>
                <p className="mt-2 text-white/40">
                  {row.managerName || "Investment Manager"} · Score {Number(row.score || 0).toFixed(1)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <div className="min-w-[120px] text-right">
                  <p className="text-3xl font-black text-[#b6ff00]">
                    {roi(row.roi)}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                    ROI
                  </p>
                </div>

                <Link href={`/s/${row.strategyId || row.id}`}>
                  <Button variant="secondary">Profile</Button>
                </Link>

                <Link href="/bullpad">
                  <Button>Copy</Button>
                </Link>
              </div>
            </div>
          ))}

          {!top.length ? (
            <p className="py-8 text-white/45">Loading Top 5...</p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
