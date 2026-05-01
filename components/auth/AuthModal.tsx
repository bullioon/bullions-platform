"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureUser } from "@/lib/user";

type Props = {
  onClose: () => void;
};

export function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const credential =
      mode === "register"
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

    await ensureUser(credential.user.uid, credential.user.email || email);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <section className="w-full max-w-[430px] rounded-[30px] bg-[#121417] p-6 ring-1 ring-white/5">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/40">Bullions account</p>
            <h2 className="mt-1 text-3xl font-semibold text-white">
              {mode === "login" ? "Login" : "Create account"}
            </h2>
          </div>

          <button onClick={onClose} className="text-white/50">
            ×
          </button>
        </div>

        <label className="text-xs text-white/40">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 h-13 w-full rounded-[16px] bg-black/30 px-4 text-white outline-none ring-1 ring-white/10"
        />

        <label className="mt-4 block text-xs text-white/40">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 h-13 w-full rounded-[16px] bg-black/30 px-4 text-white outline-none ring-1 ring-white/10"
        />

        <button
          onClick={submit}
          className="mt-7 h-[56px] w-full rounded-full bg-[#b6ff00] font-semibold text-black"
        >
          {mode === "login" ? "Login" : "Create account"}
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4 w-full text-sm text-white/45"
        >
          {mode === "login"
            ? "Need an account? Create one"
            : "Already have an account? Login"}
        </button>
      </section>
    </div>
  );
}
