"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthModal } from "@/components/auth/AuthModal";

const links = [
  { label: "Home", href: "/" },
  { label: "BullPad", href: "/bullpad" },
  { label: "Leaderboard", href: "/bullpad#leaderboard" },
  { label: "Terminal", href: "/bullpad#copy-terminal" },
];

export function TopFloatingMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [openAuth, setOpenAuth] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <>
      <div className="sticky top-3 z-50 mx-auto mb-5 w-full max-w-[1480px] px-4">
        <div className="relative flex items-center justify-between rounded-full border border-white/[0.06] bg-white/[0.04] px-6 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm md:backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.06] to-transparent opacity-60" />

          <a href="/" className="relative text-lg font-semibold italic text-white">
            bullions
          </a>

          <nav className="relative hidden items-center gap-1 md:flex">
            {links.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-xs font-medium text-white/50 transition hover:bg-white/[0.08] hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {user ? (
            <button
              onClick={() => signOut(auth)}
              className="relative rounded-full bg-white/[0.08] px-5 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/[0.12]"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setOpenAuth(true)}
              className="relative rounded-full bg-white px-5 py-2 text-xs font-semibold text-black transition hover:opacity-90"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {openAuth && <AuthModal onClose={() => setOpenAuth(false)} />}
    </>
  );
}
