import Image from "next/image";
import Link from "next/link";

const tiers = [
  {
    name: "BULLION",
    image: "/assets/bullion-chip.png",
    color: "#b6ff00",
    min: "$250",
    allocation: "Max 40% engine allocation",
    withdrawal: "30% weekly withdrawals",
    title: "Retail survival mode",
    desc: "Built for users who want controlled exposure, AI protection and a slower entry into the Bullions engine.",
  },
  {
    name: "HELLION",
    image: "/assets/hellion-chip.png",
    color: "#ff4d4d",
    min: "$500",
    allocation: "Max 65% engine allocation",
    withdrawal: "30% weekly withdrawals",
    title: "Aggressive recovery protocol",
    desc: "Designed for users who want stronger engine exposure, faster recovery logic and higher volatility tolerance.",
  },
  {
    name: "TORION",
    image: "/assets/torion-chip.png",
    color: "#a855f7",
    min: "$1,000",
    allocation: "Max 80% engine allocation",
    withdrawal: "Priority withdrawal access",
    title: "Institutional predator mode",
    desc: "Full protocol access for users who want maximum allocation flexibility and advanced engine behavior.",
  },
];

export function TierAccessSection() {
  return (
    <section className="mx-auto mt-14 w-full max-w-[1480px] rounded-[42px] bg-[#050607] p-6 ring-1 ring-white/5 sm:p-10">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b6ff00]">
          Choose your survival tier
        </p>

        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Enter Bullions at the level that matches your risk.
        </h2>

        <p className="mt-5 text-sm leading-7 text-white/45">
          Bullions uses survival tiers to control allocation, withdrawals and engine exposure.
          Start protected, unlock more power, or enter directly into a higher protocol level.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="relative overflow-hidden rounded-[34px] bg-[#111214] p-6 ring-1 transition hover:-translate-y-1 sm:p-7"
            style={{
              borderColor: `${tier.color}35`,
              boxShadow: `0 0 55px ${tier.color}10`,
            }}
          >
            <div
              className="absolute inset-0 opacity-25"
              style={{
                background: `radial-gradient(circle at top right, ${tier.color}40, transparent 38%)`,
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: tier.color }}>
                    From {tier.min}
                  </p>

                  <h3 className="mt-3 text-3xl font-semibold text-white">
                    {tier.name}
                  </h3>

                  <p className="mt-1 text-sm font-semibold" style={{ color: tier.color }}>
                    {tier.title}
                  </p>
                </div>

                <div
                  className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-white/10 bg-black/30"
                  style={{ boxShadow: `0 0 35px ${tier.color}35` }}
                >
                  <Image
                    src={tier.image}
                    alt={tier.name}
                    width={68}
                    height={68}
                    className="h-[68px] w-[68px] object-contain"
                  />
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-white/50">
                {tier.desc}
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="rounded-2xl bg-black/25 p-4 text-white/60 ring-1 ring-white/5">
                  {tier.allocation}
                </div>

                <div className="rounded-2xl bg-black/25 p-4 text-white/60 ring-1 ring-white/5">
                  {tier.withdrawal}
                </div>
              </div>

              <Link
                href="/bullpad"
                className="mt-7 flex h-[56px] items-center justify-center rounded-full text-sm font-semibold text-black transition hover:scale-[1.01]"
                style={{
                  backgroundColor: tier.color,
                  boxShadow: `0 0 35px ${tier.color}30`,
                }}
              >
                Enter as {tier.name}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
