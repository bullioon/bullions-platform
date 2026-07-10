"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/v2/ui/Button";

const traders = [
  { id: "axbull", initials: "AX", name: "AxBull", handle: "@axbullions", type: "MT5 VERIFIED", perf: 680, copying: "2,841" },
  { id: "ghost-alpha", initials: "GA", name: "Ghost Alpha", handle: "@ghostalpha", type: "MT5 VERIFIED", perf: 512, copying: "2,481" },
  { id: "six-quant", initials: "6X", name: "SIX Quant", handle: "@sixai", type: "AI SYSTEM", perf: 421, copying: "1,904" },
  { id: "mia-capital", initials: "MI", name: "MIA Capital", handle: "@miacapital", type: "HYBRID", perf: 318, copying: "1,248" },
  { id: "uranio", initials: "UR", name: "Uranio Desk", handle: "@uranio", type: "AI SIGNALS", perf: 244, copying: "940" },
  { id: "quant-edge", initials: "QE", name: "Quant Edge", handle: "@quantedge", type: "MT5 VERIFIED", perf: 191, copying: "811" },
];

export function TopSixChallenge() {
  const [selected, setSelected] = useState(traders[0]);
  const [size, setSize] = useState<"50K" | "200K">("200K");

  const challenge =
    size === "50K"
      ? { prize: "$50,000", entry: "$90", cash: "$5,000", difficulty: "Start" }
      : { prize: "$200,000", entry: "$150", cash: "$10,000", difficulty: "Pro" };

  return (
    <section id="top-six" className="mx-auto grid max-w-[980px] gap-5 px-4 lg:grid-cols-[1fr_0.78fr]">
      <section className="rounded-[30px] border border-white/10 bg-[#080909] p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-white/30">
              Copy
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              Top Six
            </h2>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b6ff00]">
            Live
          </p>
        </div>

        <div className="mt-5 divide-y divide-white/10">
          {traders.map((trader) => {
            const active = selected.id === trader.id;

            return (
              <button
                key={trader.id}
                onMouseEnter={() => setSelected(trader)}
                onClick={() => setSelected(trader)}
                className={`grid w-full grid-cols-[42px_1fr_auto] items-center gap-4 py-4 text-left transition duration-200 ${
                  active ? "opacity-100" : "opacity-45 hover:opacity-100"
                }`}
              >
                <div
                  className={`grid h-10 w-10 place-items-center rounded-full text-xs font-black ${
                    active
                      ? "bg-[#b6ff00] text-black"
                      : "bg-white/[0.08] text-white/55"
                  }`}
                >
                  {trader.initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-black tracking-[-0.03em]">
                    {trader.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-white/35">
                    {trader.handle} · {trader.type} · {trader.copying} copying
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black tracking-[-0.04em] text-[#b6ff00]">
                    +{trader.perf}%
                  </p>

                  <Link
                    href={`/s/${trader.id}`}
                    className="mt-1 block text-[9px] font-black uppercase tracking-[0.18em] text-white/35 hover:text-[#b6ff00]"
                  >
                    Profile →
                  </Link>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
                Selected
              </p>
              <p className="mt-1 text-xl font-black tracking-[-0.04em]">
                {selected.name}
              </p>
            </div>

            <Link href={`/s/${selected.id}`}>
              <Button variant="secondary">View Profile</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-[#d6b35a]/20 bg-[#080909] p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#d6b35a]">
              Compete
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              Challenge
            </h2>
          </div>

          <p className="rounded-full border border-[#d6b35a]/25 bg-[#d6b35a]/10 px-3 py-1 text-[10px] font-black text-[#d6b35a]">
            {challenge.difficulty}
          </p>
        </div>

        <div className="mt-5 rounded-[24px] bg-white/[0.035] p-4">
          <div className="grid grid-cols-2 rounded-[18px] bg-black/25 p-1">
            <button
              onClick={() => setSize("50K")}
              className={`rounded-[15px] py-2.5 text-sm font-black transition ${
                size === "50K" ? "bg-white/10 text-white" : "text-white/30"
              }`}
            >
              50K
            </button>

            <button
              onClick={() => setSize("200K")}
              className={`rounded-[15px] py-2.5 text-sm font-black transition ${
                size === "200K" ? "bg-[#b6ff00] text-black" : "text-[#b6ff00]"
              }`}
            >
              200K
            </button>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
              Win up to
            </p>

            <p className="mt-2 text-5xl font-black tracking-[-0.07em] text-white">
              {challenge.prize}
            </p>

            <p className="mt-3 text-sm font-semibold text-white/45">
              + {challenge.cash} cash and 30% weekly copy revenue.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <Mini label="Entry" value={challenge.entry} />
            <Mini label="Copy revenue" value="30% weekly" purple />
            <Mini label="Top benchmark" value={`+${selected.perf}% ${selected.name}`} green />
          </div>

          <Link href="/manager/strategies/new">
            <Button className="mt-5 w-full">Enroll Now</Button>
          </Link>
        </div>
      </section>
    </section>
  );
}

function Mini({
  label,
  value,
  green = false,
  purple = false,
}: {
  label: string;
  value: string;
  green?: boolean;
  purple?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-black ${
          green ? "text-[#b6ff00]" : purple ? "text-[#d8b4ff]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
