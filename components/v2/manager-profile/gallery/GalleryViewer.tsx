"use client";

import { useEffect } from "react";
import type { GalleryImage } from "./GalleryItem";

type Props = {
  images: GalleryImage[];
  activeIndex: number | null;
  onChange: (index: number | null) => void;
};

export function GalleryViewer({
  images,
  activeIndex,
  onChange,
}: Props) {
  useEffect(() => {
    if (activeIndex === null) return;

    const currentIndex = activeIndex;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onChange(null);
      }

      if (event.key === "ArrowRight") {
        onChange((currentIndex + 1) % images.length);
      }

      if (event.key === "ArrowLeft") {
        onChange(
          (currentIndex - 1 + images.length) % images.length
        );
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex, images.length, onChange]);

  if (activeIndex === null) return null;

  const image = images[activeIndex];

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/95 p-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => onChange(null)}
        className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-xl text-white/65"
        aria-label="Close gallery"
      >
        ×
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() =>
              onChange(
                (activeIndex - 1 + images.length) %
                  images.length
              )
            }
            className="absolute left-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-xl text-white/65"
            aria-label="Previous image"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() =>
              onChange(
                (activeIndex + 1) % images.length
              )
            }
            className="absolute right-5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-xl text-white/65"
            aria-label="Next image"
          >
            →
          </button>
        </>
      ) : null}

      <div className="flex max-h-[92vh] max-w-[1200px] flex-col items-center">
        <img
          src={image.url}
          alt={image.title || "Manager gallery"}
          className="max-h-[80vh] max-w-full rounded-[24px] object-contain"
        />

        <div className="mt-5 text-center">
          {image.title ? (
            <p className="text-xl font-black text-white">
              {image.title}
            </p>
          ) : null}

          <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/30">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      </div>
    </div>
  );
}
