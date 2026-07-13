import type { ManagerHeroProfile } from "./types";

type Props = {
  profile: ManagerHeroProfile;
};

export function HeroCover({ profile }: Props) {
  const bannerUrl =
    profile.manager.identity.bannerUrl || "";

  return (
    <div className="relative h-[360px] overflow-hidden rounded-t-[42px] border-b border-white/10 sm:h-[430px]">
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt={`${profile.manager.identity.displayName} cover`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(182,255,0,0.18),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(109,61,242,0.16),transparent_26%),linear-gradient(180deg,#0a0d0b_0%,#050606_100%)]" />

          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:48px_48px]" />

          <div className="absolute left-[12%] top-[18%] h-44 w-44 rounded-full border border-[#b6ff00]/10 shadow-[0_0_100px_rgba(182,255,0,0.16)]" />

          <div className="absolute right-[10%] top-[12%] h-64 w-64 rounded-full border border-white/[0.04]" />
        </>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(5,6,6,0.18)_45%,rgba(5,6,6,0.92)_100%)]" />

      <div className="absolute left-6 top-6 flex flex-wrap items-center gap-2 sm:left-8 sm:top-8">
        <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/55 backdrop-blur-xl">
          Manager Headquarters
        </span>

        {profile.runtime?.universe.visible ? (
          <span className="rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#b6ff00] backdrop-blur-xl">
            Public
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/35 backdrop-blur-xl">
            Private
          </span>
        )}
      </div>

      {!bannerUrl ? (
        <div className="absolute bottom-8 right-8 hidden rounded-[24px] border border-white/10 bg-black/30 px-5 py-4 text-right backdrop-blur-xl sm:block">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
            Cover image
          </p>

          <p className="mt-2 text-sm font-black text-white/55">
            Add your trading environment
          </p>
        </div>
      ) : null}
    </div>
  );
}
