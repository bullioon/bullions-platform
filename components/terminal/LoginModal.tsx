"use client";

import { useState } from "react";

type Props = {
  onLogin: (email: string) => void;
  onClose?: () => void;
};

export function LoginModal({ onLogin, onClose }: Props) {
  const [email, setEmail] = useState("");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <section className="w-full max-w-[440px] rounded-[30px] bg-[#18191d] p-6 shadow-[0_24px_80px_rgba(0,0,0,.65)]">
        <div className="flex items-start justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#b6ff00]/10 text-2xl">
            🔒
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white/70 hover:bg-white/[0.1]"
            >
              ×
            </button>
          )}
        </div>

        <h1 className="mt-7 text-3xl font-semibold tracking-tight text-white">
          You’re disconnected
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#8f96a3]">
          Login to load your Bullions wallet, deposits, profit history, copied trader,
          and Copy Engine settings.
        </p>

        <label className="mt-7 block text-xs text-[#8f96a3]">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="mt-2 h-14 w-full rounded-[18px] bg-black/30 px-4 text-white outline-none ring-1 ring-white/5 placeholder:text-white/25 focus:ring-[#b6ff00]/40"
        />

        <button
          onClick={() => email && onLogin(email)}
          className="mt-5 h-[56px] w-full rounded-full bg-[#b6ff00] text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.98]"
        >
          Login and load my wallet
        </button>

        <p className="mt-4 text-center text-xs text-[#8f96a3]">
          Demo login. No password required.
        </p>
      </section>
    </div>
  );
}
