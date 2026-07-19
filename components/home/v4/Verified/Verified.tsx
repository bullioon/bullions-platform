import { Badge, Button, Glow, Heading, Section, Stat } from "@/components/ui";

export function Verified() {
  return (
    <Section className="border-[#60a5fa]/20 bg-[#06080b]">
      <Glow tone="blue" className="-right-28 -top-28" />

      <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Badge tone="blue">Everything Verified</Badge>

          <Heading className="mt-6">
            No screenshots.
            <span className="block text-white/25">No fake returns.</span>
            <span className="block text-[#60a5fa]">Real proof.</span>
          </Heading>

          <p className="mt-7 max-w-lg text-sm leading-7 text-white/40">
            Bullions reads connected trading data directly. Balance, equity,
            ROI, drawdown and trades come from the system.
          </p>

          <Button
            href="/discover"
            variant="secondary"
            className="mt-8 border-[#60a5fa]/25 text-[#93c5fd] hover:border-[#60a5fa]/45 hover:bg-[#60a5fa]/10"
          >
            View Performance →
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-[34px] border border-[#60a5fa]/20 bg-black">
          <img
            src="/mt5.jpeg"
            alt="Verified MT5 performance"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,.96))]" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between border-b border-white/[0.07] pb-6">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                  Connected account
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  MetaTrader 5
                </p>
              </div>

              <Badge tone="blue">Verified</Badge>
            </div>

            <div className="py-8">
              <p className="text-[8px] font-black uppercase tracking-[0.17em] text-white/25">
                Equity
              </p>
              <p className="mt-2 text-6xl font-black tracking-[-0.07em] text-white">
                $104,281
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="ROI" value="+4.28%" valueClassName="text-[#60a5fa]" />
              <Stat label="Drawdown" value="3.20%" />
              <Stat label="Trades" value="148" />
              <Stat label="Win Rate" value="63.7%" />
              <Stat label="Profit Factor" value="2.23" />
              <Stat label="Status" value="Synced" valueClassName="text-[#b6ff00]" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
