"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type StudioState = {
  displayName: string;
  tagline: string;
  biography: string;
};

type StudioContextType = {
  state: StudioState;
  setState: React.Dispatch<React.SetStateAction<StudioState>>;
};

const StudioContext = createContext<StudioContextType | null>(null);

export function StudioProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<StudioState>({
    displayName: "Ghost Alpha",
    tagline: "Institutional Macro Manager",
    biography:
      "Institutional macro manager focused on metals, currencies and index futures.",
  });

  return (
    <StudioContext.Provider value={{ state, setState }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);

  if (!ctx) {
    throw new Error("useStudio must be used inside StudioProvider");
  }

  return ctx;
}
