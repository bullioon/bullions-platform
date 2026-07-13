import type { ManagerHeroProfile } from "./types";

type Props = {
  profile: ManagerHeroProfile;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function HeroIdentity({ profile }: Props) {
  const { manager } = profile;

  const displayName =
    manager.identity.displayName || "Unknown Manager";

  const username =
    manager.identity.username || "manager";

  const avatarUrl =
    manager.identity.avatarUrl || "";

  const location =
    manager.brand.location || "";

  const foundedYear =
    manager.brand.foundedYear || null;

  return (
    <div className="relative z-10 -mt-20 px-6 sm:-mt-24 sm:px-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">
          <div className="relative shrink-0">
            <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-[34px] border-4 border-[#050606] bg-[#111312] text-4xl font-black text-[#b6ff00] shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:h-40 sm:w-40">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials(displayName)}</span>
              )}
            </div>

            <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-4 border-[#050606] bg-[#b6ff00] text-xs font-black text-black">
              6X
            </span>
          </div>

          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">
                {displayName}
              </h1>

              {manager.reputation.verified ? (
                <span className="rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#b6ff00]">
                  Verified
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm font-semibold text-white/35 sm:text-base">
              @{username}
            </p>

            <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/70 sm:text-xl">
              {manager.identity.tagline ||
                "Investment manager on Bullions."}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/35">
              {location ? (
                <span>{location}</span>
              ) : null}

              {foundedYear ? (
                <span>Since {foundedYear}</span>
              ) : null}

              {manager.brand.companyName ? (
                <span>{manager.brand.companyName}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="pb-1">
          <p className="max-w-xl text-sm leading-7 text-white/40">
            {manager.identity.biography ||
              "This manager has not added a biography yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
