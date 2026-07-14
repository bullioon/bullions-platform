"use client";

import type { ManagerHeroProfile } from "./types";

type Props = {
  profile: ManagerHeroProfile;
};

export function HeroActions({ profile }: Props) {
  const links = profile.manager.social?.links;

  const externalLinks = [
    ["X", links?.x],
    ["Instagram", links?.instagram],
    ["LinkedIn", links?.linkedin],
    ["YouTube", links?.youtube],
    ["Discord", links?.discord],
    ["Website", profile.manager.brand.website],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  async function shareProfile() {
    const url = window.location.href;
    const title = `${profile.manager.identity.displayName} on Bullions`;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);
    } catch {
      // The user may cancel the native share dialog.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="h-12 rounded-full bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.015]"
        >
          Follow
        </button>

        <button
          type="button"
          className="h-12 rounded-full border border-white/10 bg-white/[0.04] px-7 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Message
        </button>

        <button
          type="button"
          onClick={shareProfile}
          className="h-12 rounded-full border border-white/10 bg-white/[0.04] px-7 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Share
        </button>
      </div>

      {externalLinks.length ? (
        <div className="flex flex-wrap gap-2">
          {externalLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/35 transition hover:border-[#b6ff00]/25 hover:text-[#b6ff00]"
            >
              {label}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/25">
          Social links have not been added yet.
        </p>
      )}
    </div>
  );
}
