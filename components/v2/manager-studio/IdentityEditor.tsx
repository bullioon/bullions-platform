"use client";

import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "@/lib/firebase";
import { useStudio } from "./StudioContext";

export function IdentityEditor() {
  const {
    state,
    setState,
    loading,
    saving,
    message,
    saveIdentity,
  } = useStudio();

  const [uploading, setUploading] = useState<
    "avatar" | "banner" | null
  >(null);
  const [uploadError, setUploadError] = useState("");

  function update(
    key: keyof typeof state,
    value: string
  ) {
    setState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function uploadImage(
    file: File,
    type: "avatar" | "banner"
  ) {
    if (!state.uid) {
      setUploadError("Login required.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Select a valid image.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Image must be smaller than 8 MB.");
      return;
    }

    setUploading(type);
    setUploadError("");

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const objectRef = ref(
        storage,
        `manager-media/${state.uid}/${type}-${Date.now()}.${extension}`
      );

      await uploadBytes(objectRef, file, {
        contentType: file.type,
      });

      const downloadUrl =
        await getDownloadURL(objectRef);

      setState((current) => ({
        ...current,
        [type === "avatar"
          ? "avatarUrl"
          : "bannerUrl"]: downloadUrl,
      }));
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );
    } finally {
      setUploading(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-10 text-sm text-white/40">
        Loading manager profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[30px] border border-white/10 bg-black/20">
        <div className="relative h-[260px] overflow-hidden bg-[#0c0e0d]">
          {state.bannerUrl ? (
            <img
              src={state.bannerUrl}
              alt="Manager cover preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(182,255,0,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.14),transparent_26%),linear-gradient(180deg,#0b0d0c,#050606)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10" />

          <div className="absolute bottom-6 left-6 flex items-end gap-5">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-[28px] border-4 border-[#080909] bg-[#111312] text-3xl font-black text-[#b6ff00]">
              {state.avatarUrl ? (
                <img
                  src={state.avatarUrl}
                  alt="Manager avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                state.displayName
                  .slice(0, 2)
                  .toUpperCase() || "6X"
              )}
            </div>

            <div className="pb-2">
              <p className="text-3xl font-black tracking-[-0.05em] text-white">
                {state.displayName ||
                  "Manager name"}
              </p>

              <p className="mt-1 text-sm text-white/45">
                @{state.username || "username"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6 max-w-2xl">
        <Field
          label="What should investors call you?"
          value={state.displayName}
          onChange={(value) =>
            update("displayName", value)
          }
        />

        <Field
          label="Choose your public handle"
          value={state.username}
          onChange={(value) =>
            update("username", value)
          }
          placeholder="ghost-alpha"
        />

        <ImageField
          label="Upload your profile photo"
          value={state.avatarUrl}
          uploading={uploading === "avatar"}
          onChange={(value) =>
            update("avatarUrl", value)
          }
          onUpload={(file) =>
            uploadImage(file, "avatar")
          }
        />


        <ImageField
          label="Upload your cover image"
          value={state.bannerUrl}
          uploading={uploading === "banner"}
          onChange={(value) =>
            update("bannerUrl", value)
          }
          onUpload={(file) =>
            uploadImage(file, "banner")
          }
        />
      </div>

      <div>
        <label className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-white/40">
          Describe how you invest
        </label>

        <textarea
          placeholder="I focus on disciplined execution, capital preservation and consistent long-term returns."
          rows={6}
          value={state.biography}
          onChange={(event) =>
            update(
              "biography",
              event.target.value
            )
          }
          className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-4 leading-7 text-white outline-none transition focus:border-[#b6ff00]/60"
        />
      </div>

      {(() => {
        const requirements = [
          {
            label: "Cover image",
            complete: Boolean(state.bannerUrl),
          },
          {
            label: "Profile photo",
            complete: Boolean(state.avatarUrl),
          },
          {
            label: "Public name",
            complete: Boolean(state.displayName.trim()),
          },
          {
            label: "Public handle",
            complete: Boolean(state.username.trim()),
          },
          {
            label: "Investment philosophy",
            complete: Boolean(state.biography.trim()),
          },
        ];

        const missing = requirements.filter(
          (item) => !item.complete
        );

        if (!missing.length) {
          return (
            <div className="rounded-[22px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.05] p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#b6ff00]">
                Identity complete
              </p>

              <p className="mt-2 text-sm text-white/55">
                Everything required is ready. You can continue when you are satisfied.
              </p>
            </div>
          );
        }

        return (
          <div className="rounded-[22px] border border-[#d6b35a]/20 bg-[#d6b35a]/[0.05] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d6b35a]">
              Complete these items to continue
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {requirements.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-black/20 px-4 py-3"
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[9px] font-black ${
                      item.complete
                        ? "border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00]"
                        : "border-[#d6b35a]/30 bg-[#d6b35a]/10 text-[#d6b35a]"
                    }`}
                  >
                    {item.complete ? "✓" : "!"}
                  </span>

                  <p
                    className={`text-sm ${
                      item.complete
                        ? "text-white/45 line-through"
                        : "font-semibold text-white"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs leading-5 text-white/35">
              Your work is saved automatically. Complete the remaining items and the Continue button will unlock.
            </p>
          </div>
        );
      })()}

      {uploadError ? (
        <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {uploadError}
        </p>
      ) : null}

      {message ? (
        <p
          className={`rounded-2xl border p-4 text-sm ${
            message === "Profile saved."
              ? "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]"
              : "border-amber-400/20 bg-amber-400/10 text-amber-200"
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={saveIdentity}
          disabled={saving || !state.uid}
          className="h-14 rounded-full bg-[#b6ff00] px-9 text-[11px] font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving
            ? "Saving..."
            : "Save Profile"}
        </button>

        {state.uid ? (
          <a
            href={`/m/${state.uid}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center rounded-full border border-white/10 bg-white/[0.035] px-8 text-[11px] font-black uppercase tracking-[0.16em] text-white/55"
          >
            View Public Profile ↗
          </a>
        ) : null}
      </div>
    </div>
  );
}

function ImageField({
  label,
  value,
  uploading,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <label className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-white/40">
        {label}
      </label>

      <div className="space-y-3">
        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="https://..."
          className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-[#b6ff00]/60"
        />

        <label className="inline-flex h-12 cursor-pointer items-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-[10px] font-black uppercase tracking-[0.16em] text-white/60 transition hover:border-[#b6ff00]/25 hover:text-[#b6ff00]">
          {uploading ? "Uploading..." : `Upload ${label}`}

          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              if (file) onUpload(file);

              event.currentTarget.value = "";
            }}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-white/40">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-[#b6ff00]/60"
      />
    </div>
  );
}
