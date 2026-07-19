import { Badge, Button, Glow, Heading, Section } from "@/components/ui";

const tools = ["Markets", "Research", "Journal", "Ideas", "SIX"];

export function BullPad() {
  return (
    <Section className="min-h-[620px] bg-black">
      <Glow tone="green" className="-bottom-32 -right-28" />

      <img
        src="/bullpad.jpg"
        alt="BullPad workspace"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,5,5,.98),rgba(4,5,5,.78)_52%,rgba(4,5,5,.25))]" />

      <div className="relative flex min-h-[500px] max-w-2xl flex-col justify-center">
        <Badge tone="green" className="w-fit">
          BullPad
        </Badge>

        <Heading className="mt-6">
          Your second
          <span className="block text-[#b6ff00]">brain.</span>
        </Heading>

        <p className="mt-7 max-w-xl text-sm leading-7 text-white/42">
          Research firms, study markets, organize conviction and work with SIX
          inside one private capital workspace.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span
              key={tool}
              className="rounded-full border border-white/10 bg-black/35 px-4 py-3 text-[8px] font-black uppercase tracking-[0.15em] text-white/45 backdrop-blur"
            >
              {tool}
            </span>
          ))}
        </div>

        <Button href="/bullpad" className="mt-9 w-fit min-w-[210px]">
          Open BullPad →
        </Button>
      </div>
    </Section>
  );
}
