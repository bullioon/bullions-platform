"use client";

import { useStudio } from "./StudioContext";

export function IdentityEditor() {
  const { state, setState } = useStudio();

  return (
    <div className="space-y-8">

      <div>

        <label className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-white/40">
          Display Name
        </label>

        <input
          value={state.displayName}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              displayName: e.target.value,
            }))
          }
          className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-4 text-xl font-bold outline-none focus:border-[#b6ff00]"
        />

      </div>

      <div>

        <label className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-white/40">
          Tagline
        </label>

        <input
          value={state.tagline}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              tagline: e.target.value,
            }))
          }
          className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-4 text-lg outline-none focus:border-[#b6ff00]"
        />

      </div>

      <div>

        <label className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-white/40">
          Biography
        </label>

        <textarea
          rows={6}
          value={state.biography}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              biography: e.target.value,
            }))
          }
          className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-4 outline-none focus:border-[#b6ff00]"
        />

      </div>

    </div>
  );
}
