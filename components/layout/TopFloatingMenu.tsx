"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { usePathname } from "next/navigation";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon />,
  },
  {
    label: "BullPad",
    href: "/bullpad",
    icon: <BullPadIcon />,
  },
  {
    label: "Firm",
    href: "/firm",
    icon: <FirmIcon />,
  },
  {
    label: "Discover",
    href: "/discover",
    icon: <DiscoverIcon />,
  },
];

function isItemActive(
  pathname: string,
  href: string
) {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function TopFloatingMenu() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const [openAuth, setOpenAuth] =
    useState(false);

  return (
    <>
      {/* Desktop navigation */}
      <div className="sticky top-3 z-50 mx-auto mb-5 hidden w-full max-w-[1480px] px-4 md:block">
        <div className="relative flex items-center justify-between rounded-full border border-white/[0.07] bg-[#0b0c0d]/80 px-6 py-3 shadow-[0_12px_50px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.05] to-transparent" />

          <a
            href="/"
            className="relative text-lg font-semibold italic text-white"
          >
            bullions
          </a>

          <nav className="relative flex items-center gap-1">
            {navigation.map((item) => {
              const active = isItemActive(
                pathname,
                item.href
              );

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "bg-white/[0.09] text-white"
                      : "text-white/40 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="relative">
            {!loading && user ? (
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="rounded-full border border-white/10 bg-white/[0.035] px-5 py-2 text-xs font-semibold text-white/55 transition hover:text-white"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpenAuth(true)}
                className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black transition hover:opacity-90"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-3 z-50 mx-auto mb-4 flex w-full items-center justify-between rounded-full border border-white/[0.07] bg-[#0b0c0d]/85 px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:hidden">
        <a
          href="/"
          className="text-lg font-semibold italic text-white"
        >
          bullions
        </a>

        {!loading && user ? (
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/45"
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpenAuth(true)}
            className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-3 left-1/2 z-[60] grid w-[calc(100%-24px)] max-w-[430px] -translate-x-1/2 grid-cols-4 rounded-[26px] border border-white/[0.08] bg-[#0a0b0c]/90 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl md:hidden">
        {navigation.map((item) => {
          const active = isItemActive(
            pathname,
            item.href
          );

          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-[19px] px-2 py-2.5 transition ${
                active
                  ? "bg-[#b6ff00] text-black"
                  : "text-white/35 active:bg-white/[0.06]"
              }`}
            >
              <span className="h-5 w-5">
                {item.icon}
              </span>

              <span className="truncate text-[9px] font-black uppercase tracking-[0.08em]">
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {openAuth ? (
        <AuthModal
          onClose={() => setOpenAuth(false)}
        />
      ) : null}
    </>
  );
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-full w-full"
    >
      <path d="M3.5 10.5 12 3l8.5 7.5" />
      <path d="M5.5 9.5V21h13V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function BullPadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-full w-full"
    >
      <path d="M9 3v5l-4.5 8a3.3 3.3 0 0 0 2.9 5h9.2a3.3 3.3 0 0 0 2.9-5L15 8V3" />
      <path d="M8 12h8" />
      <path d="M9 3h6" />
    </svg>
  );
}

function FirmIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-full w-full"
    >
      <path d="M3 21h18" />
      <path d="M5 21V9h14v12" />
      <path d="M3 9 12 3l9 6" />
      <path d="M9 13v4M15 13v4" />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-full w-full"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  );
}
