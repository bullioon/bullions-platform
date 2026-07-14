"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { ManagerRepository } from "@/core/v2/repositories/ManagerRepository";

type StudioState = {
  uid: string;
  username: string;
  displayName: string;
  tagline: string;
  biography: string;
  avatarUrl: string;
  bannerUrl: string;
  companyName: string;
  location: string;
  website: string;
};

type StudioContextType = {
  state: StudioState;
  setState: React.Dispatch<React.SetStateAction<StudioState>>;
  loading: boolean;
  saving: boolean;
  message: string;
  saveIdentity: () => Promise<void>;
};

const emptyState: StudioState = {
  uid: "",
  username: "",
  displayName: "",
  tagline: "",
  biography: "",
  avatarUrl: "",
  bannerUrl: "",
  companyName: "",
  location: "",
  website: "",
};

const StudioContext =
  createContext<StudioContextType | null>(null);

export function StudioProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] =
    useState<StudioState>(emptyState);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let alive = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!alive) return;

        if (!user) {
          setState(emptyState);
          setMessage("Login required.");
          setLoading(false);
          return;
        }

        try {
          const manager =
            await ManagerRepository.get(user.uid);

          if (!alive) return;

          if (!manager) {
            setState({
              ...emptyState,
              uid: user.uid,
              username:
                user.email?.split("@")[0] || "",
              displayName:
                user.displayName || "",
            });

            setMessage(
              "Manager profile has not been created yet."
            );
            setLoading(false);
            return;
          }

          setState({
            uid: manager.uid,
            username:
              manager.identity.username || "",
            displayName:
              manager.identity.displayName || "",
            tagline:
              manager.identity.tagline || "",
            biography:
              manager.identity.biography || "",
            avatarUrl:
              manager.identity.avatarUrl || "",
            bannerUrl:
              manager.identity.bannerUrl || "",
            companyName:
              manager.brand.companyName || "",
            location:
              manager.brand.location || "",
            website:
              manager.brand.website || "",
          });

          setMessage("");
        } catch (error) {
          if (!alive) return;

          setMessage(
            error instanceof Error
              ? error.message
              : "Could not load manager profile."
          );
        } finally {
          if (alive) setLoading(false);
        }
      }
    );

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  async function saveIdentity() {
    if (!state.uid) {
      setMessage("Login required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await ManagerRepository.updateIdentity(
        state.uid,
        {
          username: state.username.trim(),
          displayName: state.displayName.trim(),
          tagline: state.tagline.trim(),
          biography: state.biography.trim(),
          avatarUrl: state.avatarUrl.trim(),
          bannerUrl: state.bannerUrl.trim(),
        }
      );

      await ManagerRepository.updateBrand(
        state.uid,
        {
          companyName:
            state.companyName.trim() || undefined,
          location:
            state.location.trim() || undefined,
          website:
            state.website.trim() || undefined,
        }
      );

      setMessage("Profile saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudioContext.Provider
      value={{
        state,
        setState,
        loading,
        saving,
        message,
        saveIdentity,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);

  if (!context) {
    throw new Error(
      "useStudio must be used inside StudioProvider"
    );
  }

  return context;
}
