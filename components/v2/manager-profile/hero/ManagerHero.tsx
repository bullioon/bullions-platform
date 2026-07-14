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
    <section className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[#050606] shadow-[0_36px_100px_rgba(0,0,0,0.24)]">
      <HeroCover profile={profile} />

      <div className="relative pb-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(182,255,0,0.055),transparent_26%)]" />

        <HeroIdentity profile={profile} />

        <div className="relative mt-7 grid gap-6 px-6 sm:px-10 xl:grid-cols-[1fr_auto] xl:items-start">
          <HeroActions profile={profile} />

          <div className="xl:pt-7">
            <HeroRuntime profile={profile} />
          </div>
        </div>

        <div className="relative mx-6 mt-8 sm:mx-10">
          <HeroStats profile={profile} />
        </div>
      </div>
    </section>
  );
}
