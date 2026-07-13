import type { ManagerHeroProfile } from "./types";

import { HeroActions } from "./HeroActions";
import { HeroCover } from "./HeroCover";
import { HeroIdentity } from "./HeroIdentity";
import { HeroRuntime } from "./HeroRuntime";
import { HeroStats } from "./HeroStats";

type Props = {
  profile: ManagerHeroProfile;
};

export function ManagerHero({
  profile,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[#050606] shadow-[0_40px_120px_rgba(0,0,0,0.28)]">
      <HeroCover profile={profile} />

      <div className="relative pb-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(182,255,0,0.06),transparent_28%)]" />

        <HeroIdentity profile={profile} />
        <HeroActions profile={profile} />
        <HeroRuntime profile={profile} />
        <HeroStats profile={profile} />
      </div>
    </section>
  );
}
