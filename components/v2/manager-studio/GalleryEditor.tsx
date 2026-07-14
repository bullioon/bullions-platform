"use client";

import { useEffect, useState } from "react";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/lib/firebase";
import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";
import type { Manager } from "@/types/v2/domain/manager";
import { useStudio } from "./StudioContext";

type GalleryImage = NonNullable<
  NonNullable<Manager["social"]>["gallery"]
>[number];

type Category = NonNullable<GalleryImage["category"]>;

const categories: Array<{
  value: Category;
  label: string;
}> = [
  { value: "desk", label: "Trading Desk" },
  { value: "research", label: "Research" },
  { value: "process", label: "Process" },
  { value: "markets", label: "Markets" },
  { value: "event", label: "Events" },
  { value: "lifestyle", label: "Lifestyle" },
];

export function GalleryEditor() {
  const { state } = useStudio();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadGallery() {
      if (!state.uid) {
        setLoading(false);
        return;
      }

      try {
        const manager = await ManagerRepository.get(state.uid);

        if (!alive) return;

        setImages(manager?.social?.gallery ?? []);
      } catch (error) {
        if (!alive) return;

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load gallery."
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadGallery();

    return () => {
      alive = false;
    };
  }, [state.uid]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || !state.uid) return;

    const room = Math.max(0, 12 - images.length);
    const selectedFiles = Array.from(files).slice(0, room);

    if (!selectedFiles.length) {
      setMessage("Gallery allows up to 12 photos.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const uploaded: GalleryImage[] = [];

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not a valid image.`);
        }

        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 8 MB.`);
        }

        const extension =
          file.name.split(".").pop()?.toLowerCase() || "jpg";

        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`;

        const objectRef = ref(
          storage,
          `manager-media/${state.uid}/gallery/${id}.${extension}`
        );

        await uploadBytes(objectRef, file, {
          contentType: file.type,
        });

        const url = await getDownloadURL(objectRef);

        uploaded.push({
          id,
          url,
          title: "",
          category: "desk",
          createdAt: Date.now(),
        });
      }

      const nextImages = [...images, ...uploaded];

      setImages(nextImages);

      await ManagerRepository.updateSocial(state.uid, {
        gallery: nextImages,
      });

      setMessage(
        `${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Gallery upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  function updateImage(
    id: string,
    patch: Partial<GalleryImage>
  ) {
    setImages((current) =>
      current.map((image) =>
        image.id === id
          ? {
              ...image,
              ...patch,
            }
          : image
      )
    );
  }

  async function removeImage(image: GalleryImage) {
    if (!state.uid) return;

    const previousImages = images;
    const nextImages = images.filter(
      (item) => item.id !== image.id
    );

    setImages(nextImages);
    setMessage("");

    try {
      await ManagerRepository.updateSocial(state.uid, {
        gallery: nextImages,
      });

      try {
        await deleteObject(ref(storage, image.url));
      } catch {
        // Firestore remains the source of truth if Storage deletion fails.
      }

      setMessage("Photo removed.");
    } catch (error) {
      setImages(previousImages);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not remove photo."
      );
    }
  }

  async function saveGallery() {
    if (!state.uid) {
      setMessage("Login required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await ManagerRepository.updateSocial(state.uid, {
        gallery: images,
      });

      setMessage("Gallery saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save gallery."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-white/40">
        Loading gallery...
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-black/20 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xl font-black text-white">
            Visual proof
          </p>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
            Add your trading environment, research process, events and professional milestones.
          </p>
        </div>

        <label className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.16em] text-black">
          {uploading ? "Uploading..." : "Add Photos"}

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading || images.length >= 12}
            onChange={(event) => {
              uploadFiles(event.target.files);
              event.currentTarget.value = "";
            }}
            className="hidden"
          />
        </label>
      </div>

      {images.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0c0b]"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title || "Manager gallery"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                    Title
                  </label>

                  <input
                    value={image.title || ""}
                    onChange={(event) =>
                      updateImage(image.id, {
                        title: event.target.value,
                      })
                    }
                    placeholder="Trading desk"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#b6ff00]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                    Category
                  </label>

                  <select
                    value={image.category || "desk"}
                    onChange={(event) =>
                      updateImage(image.id, {
                        category: event.target.value as Category,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none"
                  >
                    {categories.map((category) => (
                      <option
                        key={category.value}
                        value={category.value}
                      >
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  className="w-full rounded-full border border-red-400/15 bg-red-400/[0.06] py-3 text-[9px] font-black uppercase tracking-[0.16em] text-red-300"
                >
                  Remove Photo
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[280px] place-items-center rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <div>
            <p className="text-2xl font-black text-white">
              No photos yet
            </p>

            <p className="mt-3 text-sm text-white/35">
              Upload your first trading or professional image.
            </p>
          </div>
        </div>
      )}

      {message ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
        <button
          type="button"
          disabled={saving || !state.uid}
          onClick={saveGallery}
          className="h-14 rounded-full bg-[#b6ff00] px-9 text-[10px] font-black uppercase tracking-[0.18em] text-black disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Gallery"}
        </button>

        {state.uid ? (
          <a
            href={`/m/${state.uid}?section=gallery#hq-gallery`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center rounded-full border border-white/10 px-8 text-[10px] font-black uppercase tracking-[0.16em] text-white/55"
          >
            View Public Gallery ↗
          </a>
        ) : null}
      </div>
    </div>
  );
}
