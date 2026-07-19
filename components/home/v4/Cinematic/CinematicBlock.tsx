"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui";

type CinematicBlockProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  video: string;
  cta: string;
  href: string;
  align?: "left" | "right";
};

export function CinematicBlock({
  eyebrow,
  title,
  subtitle,
  video,
  cta,
  href,
  align = "left",
}: CinematicBlockProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const rightAligned = align === "right";

  async function toggleSound() {
    const element = videoRef.current;

    if (!element) return;

    const nextSoundOn = !soundOn;

    element.muted = !nextSoundOn;
    setSoundOn(nextSoundOn);

    if (element.paused) {
      try {
        await element.play();
      } catch {
        element.muted = true;
        setSoundOn(false);
      }
    }
  }

  return (
    <section className="group relative min-h-[460px] overflow-hidden rounded-[40px] border border-white/10 bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted={!soundOn}
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-[1400ms] group-hover:scale-[1.015]"
      >
        <source src={video} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/20" />

      <div
        className={
          rightAligned
            ? "absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,.94),rgba(0,0,0,.52)_50%,rgba(0,0,0,.06))]"
            : "absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.94),rgba(0,0,0,.52)_50%,rgba(0,0,0,.06))]"
        }
      />

      <div className="relative flex min-h-[460px] w-full flex-col justify-between p-8 sm:p-12">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b6ff00] shadow-[0_0_14px_rgba(182,255,0,.8)]" />

            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
              {eyebrow}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute video" : "Turn video sound on"}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-3 text-[8px] font-black uppercase tracking-[0.16em] text-white/60 backdrop-blur transition hover:border-[#b6ff00]/35 hover:text-white"
          >
            <span className="text-sm">{soundOn ? "🔊" : "🔇"}</span>
            {soundOn ? "Sound on" : "Sound off"}
          </button>
        </div>

        <div
          className={
            rightAligned
              ? "ml-auto flex max-w-3xl flex-col items-end text-right"
              : "max-w-3xl text-left"
          }
        >
          <h2 className="max-w-2xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-white sm:text-7xl">
            {title}
          </h2>

          {subtitle ? (
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/50">
              {subtitle}
            </p>
          ) : null}

          <Button href={href} className="mt-8 min-w-[210px]">
            {cta} →
          </Button>
        </div>
      </div>
    </section>
  );
}
