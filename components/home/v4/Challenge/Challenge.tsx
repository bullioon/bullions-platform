import {
  Badge,
  Button,
  Glow,
  Heading,
  Section,
  Stat,
} from "@/components/ui";

export function Challenge() {
  return (
    <Section
      id="trader"
      className="border-[#b6ff00]/15 bg-[#070907]"
    >
      <Glow tone="green" className="-right-32 -top-28" />

      <div className="relative grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <Badge tone="green">Bullions Challenge</Badge>

          <Heading className="mt-6">
            Trade.
            <span className="block text-white/25">
              Perform.
            </span>
            <span className="block text-[#b6ff00]">
              Earn capital.
            </span>
          </Heading>

          <p className="mt-6 max-w-md text-sm leading-7 text-white/40">
            Enter a verified MT5 challenge. Reach the Top 6 and unlock the
            Bullions Strategy Universe.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
                Challenge
              </p>

              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">
                $50K
              </p>

              <p className="mt-2 text-xs text-white/30">
                Entry from $99
              </p>
            </div>

            <div className="rounded-[24px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.055] p-5">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#b6ff00]/60">
                Challenge
              </p>

              <p className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#b6ff00]">
                $200K
              </p>

              <p className="mt-2 text-xs text-white/30">
                Entry from $250
              </p>
            </div>
          </div>

          <Button
            href="/challenge"
            className="mt-8 min-w-[230px]"
          >
            Start Challenge →
          </Button>
        </div>

        <div className="relative min-h-[560px] overflow-hidden rounded-[34px] border border-white/10 bg-black">
          <img
            src="/mt5.jpeg"
            alt="Bullions challenge account"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.96))]" />

          <div className="relative flex min-h-[560px] flex-col justify-between p-6 sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
                  Season 01
                </p>

                <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  Capital Access
                </h3>
              </div>

              <Badge tone="green">
                <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#b6ff00]" />
                Live
              </Badge>
            </div>

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.17em] text-white/25">
                Challenge account
              </p>

              <p className="mt-3 text-6xl font-black tracking-[-0.075em] text-white sm:text-8xl">
                $200,000
              </p>

              <div className="mt-8 grid grid-cols-3 gap-2">
                <Stat
                  label="ROI"
                  value="+4.21%"
                  valueClassName="text-[#b6ff00]"
                />

                <Stat
                  label="Rank"
                  value="#04"
                />

                <Stat
                  label="Goal"
                  value="Top 6"
                />
              </div>

              <div className="mt-8 grid grid-cols-4 gap-2">
                {[
                  ["01", "Join"],
                  ["02", "Trade"],
                  ["03", "Rank"],
                  ["04", "Funded"],
                ].map(([number, label], index) => (
                  <div
                    key={label}
                    className="rounded-[18px] border border-white/[0.08] bg-black/35 p-4"
                  >
                    <p
                      className={`text-[8px] font-black ${
                        index < 3
                          ? "text-[#b6ff00]"
                          : "text-white/20"
                      }`}
                    >
                      {number}
                    </p>

                    <p className="mt-4 text-[8px] font-black uppercase tracking-[0.13em] text-white/40">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
