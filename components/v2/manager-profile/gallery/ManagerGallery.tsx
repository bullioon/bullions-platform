"use client";

import { useState } from "react";

import type { Manager } from "@/types/v2/domain/manager";
import { GalleryGrid } from "./GalleryGrid";
import { GalleryViewer } from "./GalleryViewer";

type Props = {
  manager: Manager;
};

export function ManagerGallery({
  manager,
}: Props) {
  const images = manager.social?.gallery ?? [];
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[34px] border border-white/10 bg-[#080909] p-6 sm:p-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
            Manager Gallery
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
            Inside {manager.identity.displayName}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
            Trading environment, research process and professional
            moments behind the manager.
          </p>
        </div>

        {images.length ? (
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">
            {images.length} photo
            {images.length === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      <GalleryGrid
        images={images}
        onOpen={setActiveIndex}
      />

      <GalleryViewer
        images={images}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
    </section>
  );
}
