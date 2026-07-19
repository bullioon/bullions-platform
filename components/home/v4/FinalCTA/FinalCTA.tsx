import {
  Button,
  Glow,
  Heading,
  Section,
} from "@/components/ui";

export function FinalCTA() {
  return (
    <Section className="min-h-[620px] bg-[#030404] text-center sm:grid sm:place-items-center">
      <Glow
        tone="green"
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center py-20">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
          Choose Your Side
        </p>

        <Heading
          size="hero"
          className="mt-7"
        >
          Performance
          <span className="block text-[#b6ff00]">
            earns capital.
          </span>
        </Heading>

        <p className="mt-8 max-w-xl text-sm leading-7 text-white/40 sm:text-base">
          Build your fund with verified firms or prove your performance in the
          Bullions Challenge.
        </p>

        <div className="mt-11 grid w-full max-w-[720px] gap-3 sm:grid-cols-2">
          <Button
            href="/discover"
            className="h-16"
          >
            Build My Fund
          </Button>

          <Button
            href="/challenge"
            variant="secondary"
            className="h-16"
          >
            Become a Trader
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.16em] text-white/20">
          <span>Verified performance</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Disciplined capital</span>
        </div>
      </div>
    </Section>
  );
}
