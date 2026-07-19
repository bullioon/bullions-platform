"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { ensureUser } from "@/lib/user";

type Props = {
  onClose: () => void;
};

type Workspace = "trader" | "investor";

export function AuthModal({ onClose }: Props) {
  const router = useRouter();

  const [mode, setMode] =
    useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const credential =
        mode === "register"
          ? await createUserWithEmailAndPassword(
              auth,
              email,
              password
            )
          : await signInWithEmailAndPassword(
              auth,
              email,
              password
            );

      await ensureUser(
        credential.user.uid,
        credential.user.email || email
      );

      const userSnap = await getDoc(
        doc(db, "users", credential.user.uid)
      );

      const data = userSnap.exists()
        ? userSnap.data()
        : {};

      const lastWorkspace =
        data.lastWorkspace as Workspace | undefined;

      onClose();

      if (lastWorkspace === "trader") {
        router.push("/");
        return;
      }

      if (lastWorkspace === "investor") {
        router.push("/bullpad");
        return;
      }

      router.push("/welcome");
    } catch (submitError: any) {
      console.error(
        "Authentication failed:",
        submitError
      );

      const code = submitError?.code;

      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Incorrect email or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("This email already has an account.");
      } else if (code === "auth/weak-password") {
        setError(
          "Your password must contain at least 6 characters."
        );
      } else {
        setError(
          "Unable to continue. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <section className="w-full max-w-[430px] rounded-[30px] bg-[#121417] p-6 ring-1 ring-white/5">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/40">
              Bullions account
            </p>

            <h2 className="mt-1 text-3xl font-semibold text-white">
              {mode === "login"
                ? "Login"
                : "Create account"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/50"
          >
            ×
          </button>
        </div>

        <label className="text-xs text-white/40">
          Email
        </label>

        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="mt-2 h-13 w-full rounded-[16px] bg-black/30 px-4 text-white outline-none ring-1 ring-white/10"
        />

        <label className="mt-4 block text-xs text-white/40">
          Password
        </label>

        <input
          type="password"
          autoComplete={
            mode === "login"
              ? "current-password"
              : "new-password"
          }
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit();
            }
          }}
          className="mt-2 h-13 w-full rounded-[16px] bg-black/30 px-4 text-white outline-none ring-1 ring-white/10"
        />

        {error ? (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="mt-7 h-[56px] w-full rounded-full bg-[#b6ff00] font-semibold text-black disabled:cursor-wait disabled:opacity-60"
        >
          {submitting
            ? "Opening Bullions..."
            : mode === "login"
              ? "Login"
              : "Create account"}
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            setMode(
              mode === "login"
                ? "register"
                : "login"
            );
            setError("");
          }}
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
