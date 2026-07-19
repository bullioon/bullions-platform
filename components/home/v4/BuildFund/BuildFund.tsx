"use client";

import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Glow,
  Heading,
  Section,
  Stat,
} from "@/components/ui";

const firms = [
  {
    name: "Ax Prime",
    status: "Stable",
    roi: 4.8,
  },
  {
    name: "Bullions AI",
    status: "Monitored",
    roi: 3.9,
  },
  {
    name: "Mia Capital",
    status: "Active",
    roi: 3.2,
  },
];

export function BuildFund() {
  const [allocations, setAllocations] = useState([45, 35, 20]);

  const projectedReturn = useMemo(() => {
    return firms.reduce((total, firm, index) => {
      return total + firm.roi * (allocations[index] / 100);
    }, 0);
  }, [allocations]);

  function updateAllocation(index: number, value: number) {
    const next = [...allocations];
    next[index] = value;

    const otherIndexes = [0, 1, 2].filter((item) => item !== index);
    const remaining = Math.max(100 - value, 0);
    const currentOthers = otherIndexes.reduce(
      (sum, item) => sum + next[item],
      0
    );

    otherIndexes.forEach((item, position) => {
      if (position === otherIndexes.length - 1) {
        const used = otherIndexes
          .slice(0, -1)
          .reduce((sum, other) => sum + next[other], 0);

        next[item] = Math.max(remaining - used, 0);
        return;
      }

      const ratio =
        currentOthers > 0
          ? next[item] / currentOthers
          : 1 / otherIndexes.length;

      next[item] = Math.round(remaining * ratio);
    });

    const total = next.reduce((sum, item) => sum + item, 0);

    if (total !== 100) {
      next[otherIndexes[otherIndexes.length - 1]] += 100 - total;
    }

    setAllocations(next);
  }

  return (
    <Section
      id="investor"
      className="border-[#b6ff00]/15 bg-[#060807]"
    >
      <Glow tone="green" className="-left-28 top-10" />

      <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <Badge tone="green">Build Your Fund</Badge>

          <Heading className="mt-6">
            Choose.
            <span className="block text-white/25">
              Allocate.
            </span>
            <span className="block text-[#b6ff00]">
              Invest.
            </span>
          </Heading>

          <p className="mt-6 max-w-md text-sm leading-7 text-white/40">
            Select up to three firms and control every allocation.
          </p>

          <Button
            href="/discover"
            className="mt-8 min-w-[220px]"
          >
            Build My Fund →
          </Button>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[#0a0b0b] p-5 shadow-[0_30px_110px_rgba(0,0,0,.48)] sm:p-7">
          <div className="flex items-start justify-between gap-5 border-b border-white/[0.07] pb-6">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                My Bullions Fund
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] sm:text-3xl">
                Capital Team 01
              </h3>
            </div>

            <Badge tone="green">
              Live allocation
            </Badge>
          </div>

          <div className="py-7">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
                  Projected return
                </p>

                <p className="mt-2 text-5xl font-black tracking-[-0.065em] text-[#b6ff00]">
                  +{projectedReturn.toFixed(2)}%
                </p>
              </div>

              <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/20">
                100% allocated
              </p>
            </div>

            <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="bg-[#b6ff00] transition-all duration-500"
                style={{ width: `${allocations[0]}%` }}
              />

              <div
                className="bg-[#78aa00] transition-all duration-500"
                style={{ width: `${allocations[1]}%` }}
              />

              <div
                className="bg-[#3d5600] transition-all duration-500"
                style={{ width: `${allocations[2]}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {firms.map((firm, index) => (
              <div
                key={firm.name}
                className="rounded-[22px] border border-white/[0.08] bg-black/25 p-4"
              >
                <div className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[9px] font-black text-white/45">
                    0{index + 1}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      {firm.name}
                    </p>

                    <p className="mt-1 text-[7px] font-black uppercase tracking-[0.14em] text-white/25">
                      {firm.status}
                    </p>
                  </div>

                  <p className="text-xl font-black tracking-[-0.04em] text-[#b6ff00]">
                    {allocations[index]}%
                  </p>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocations[index]}
                  onChange={(event) =>
                    updateAllocation(
                      index,
                      Number(event.target.value)
                    )
                  }
                  className="mt-4 h-1.5 w-full cursor-pointer accent-[#b6ff00]"
                  aria-label={`${firm.name} allocation`}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat
              label="Firms"
              value="3"
            />

            <Stat
              label="Control"
              value="Active"
              valueClassName="text-[#b6ff00]"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
