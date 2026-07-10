import { Stat } from "@/components/v2/ui/Stat";

type Props = {
  displayName: string;
  tagline: string;
  biography: string;
  strategyCount: number;
  verifiedCount: number;
  capitalFollowing: number;
  allocators: number;
};

function money(n: number) {
  return `$${Math.round(n || 0).toLocaleString()}`;
}

export function ManagerHero({
  displayName,
  tagline,
  biography,
  strategyCount,
  verifiedCount,
  capitalFollowing,
  allocators,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[#050606]">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(182,255,0,.08),transparent_28%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.02),transparent_45%)]" />

      <div className="relative px-12 py-16">

        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#b6ff00]">
          Investment Manager
        </p>

        <h1 className="mt-6 max-w-5xl text-7xl font-black tracking-[-0.08em]">
          {displayName}
        </h1>

        <p className="mt-6 max-w-3xl text-2xl text-white/70">
          {tagline}
        </p>

        <p className="mt-10 max-w-3xl text-lg leading-9 text-white/45">
          {biography}
        </p>

        <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-4">

          <Stat label="Investment Products" value={String(strategyCount)} />
          <Stat label="Verified" value={String(verifiedCount)} />
          <Stat label="Capital Following" value={money(capitalFollowing)} tone="green" />
          <Stat label="Allocators" value={allocators.toLocaleString()} />

        </div>

      </div>

    </section>
  );
}
