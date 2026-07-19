"use client";

import { useAuth } from "@/hooks/useAuth";

import { PublicHome } from "@/components/home/PublicHome";
import { PrivateHome } from "@/components/home/PrivateHome";

export function HomeExperience() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />
      </div>
    );
  }

  return user ? (
    <PrivateHome userId={user.uid} />
  ) : (
    <PublicHome />
  );
}
