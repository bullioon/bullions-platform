"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function TradingProgramHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  const toggleMute = async () => {
    const video = videoRef.current;

    if (!video) return;

    const nextMuted = !video.muted;

    video.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted && video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        // Browsers may block playback until the user interacts again.
      }
    }
  };

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }

      return;
    }

    video.pause();
    setPlaying(false);
  };

  const enterFullscreen = async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.requestFullscreen) {
        await video.requestFullscreen();
      } else if (
        "webkitEnterFullscreen" in video &&
        typeof video.webkitEnterFullscreen === "function"
      ) {
        video.webkitEnterFullscreen();
      }
    } catch {
      // Fullscreen support varies between browsers.
    }
  };

  return (
    <section className="relative mx-auto max-w-[1180px] px-4 pb-10 pt-12">
      <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#b6ff00]" />

            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
              Season 03 · Live
            </p>
          </div>

          <Image
            src="/logo.png"
            alt="Bullions logo"
            width={180}
            height={180}
            className="mt-7 h-[92px] w-[92px] object-contain drop-shadow-[0_0_36px_rgba(182,255,0,0.20)]"
            priority
          />

          <p className="mt-7 text-[11px] font-black uppercase tracking-[0.34em] text-white/35">
            Bullions Trading Program
          </p>

          <h1 className="mt-5 max-w-[690px] text-5xl font-black tracking-[-0.07em] text-white sm:text-6xl lg:text-7xl">
            Build your
            <span className="block text-[#b6ff00]">
              investment firm.
            </span>
          </h1>

          <p className="mt-6 max-w-[590px] text-base leading-7 text-white/55 sm:text-lg">
            Start with verified performance. Grow with capital. Scale with
            investors and recurring revenue.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/challenge?join=season-03"
              className="rounded-full bg-[#b6ff00] px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.02] hover:bg-white"
            >
              Join Season 03
            </a>

            <a
              href="#program-overview"
              className="rounded-full border border-white/10 bg-white/[0.035] px-7 py-4 text-xs font-black uppercase tracking-[0.18em] text-white/65 transition hover:border-white/20 hover:text-white"
            >
              Explore Program
            </a>
          </div>
        </div>

        <div>
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.55),0_0_80px_rgba(182,255,0,0.06)]">
            <video
              ref={videoRef}
              src="/videos/trader02.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="aspect-video w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />

            <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-xl">
              <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/65">
                Bullions Program Film
              </p>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-black/55 px-4 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-xl transition hover:border-white/30 hover:bg-black/75"
                >
                  {playing ? "Pause" : "Play"}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className={[
                    "inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-[9px] font-black uppercase tracking-[0.16em] backdrop-blur-xl transition",
                    muted
                      ? "border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00] hover:bg-[#b6ff00]/20"
                      : "border-white/15 bg-white text-black hover:bg-[#b6ff00]",
                  ].join(" ")}
                >
                  {muted ? "Turn Sound On" : "Mute"}
                </button>
              </div>

              <button
                type="button"
                onClick={enterFullscreen}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-black/55 px-4 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-xl transition hover:border-white/30 hover:bg-black/75"
              >
                Fullscreen
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 px-1">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
              Watch the Bullions experience
            </p>

            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-violet-300">
              Verified performance → Capital
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1180px] grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Available Seats" value="20" />
        <Stat label="Season Length" value="30 Days" />
        <Stat label="Top Traders" value="6" />
        <Stat label="Capital Access" value="$200K" />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 text-left">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black tracking-[-0.045em] text-white">
        {value}
      </p>
    </div>
  );
}
