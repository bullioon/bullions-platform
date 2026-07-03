import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import { managerStrategies as seedStrategies } from "@/mock/v2/managerStrategies";
import type { ManagerStrategy } from "@/types/v2/managerStrategy";
import type { StrategyDraft } from "@/types/v2/strategyDraft";
import type { Strategy } from "@/types/v2/domain/strategy";

const COLLECTION = "managerStrategies";
const STORAGE_KEY = "bullions_manager_strategies";

function draftToManagerStrategy(draft: StrategyDraft): ManagerStrategy {
  return {
    id: draft.id,
    name: draft.identity.name,
    status: draft.status === "published" ? "ACTIVE" : "DRAFT",
    verified: false,
    capitalFollowing: 0,
    allocators: 0,
    roi: 0,
    maxDrawdown: 0,
    profitFactor: 0,
    createdAt: "Today",
  };
}

function dataToManagerStrategy(id: string, data: any): ManagerStrategy {
  const state = data.status?.state || data.status;

  return {
    id,
    name: String(data.identity?.name || data.name || "Untitled Strategy"),
    status: state === "published" || state === "ACTIVE" ? "ACTIVE" : state === "PAUSED" ? "PAUSED" : "DRAFT",
    verified: Boolean(data.status?.verified ?? data.verified),
    capitalFollowing: Number(data.performance?.capitalFollowing ?? data.capitalFollowing ?? 0),
    allocators: Number(data.performance?.allocators ?? data.allocators ?? 0),
    roi: Number(data.performance?.roi ?? data.roi ?? 0),
    maxDrawdown: Number(data.performance?.maxDrawdown ?? data.maxDrawdown ?? 0),
    profitFactor: Number(data.performance?.profitFactor ?? data.profitFactor ?? 0),
    createdAt: String(data.createdAt ? new Date(Number(data.createdAt)).toLocaleDateString() : "Today"),
  };
}

function getLocalStrategies(): ManagerStrategy[] {
  if (typeof window === "undefined") return seedStrategies;

  const raw = localStorage.getItem(STORAGE_KEY);
  const drafts: StrategyDraft[] = raw ? JSON.parse(raw) : [];
  const localStrategies = drafts.map(draftToManagerStrategy);

  return [...localStrategies, ...seedStrategies].filter(
    (strategy, index, self) =>
      index === self.findIndex((item) => item.id === strategy.id)
  );
}

export async function getManagerStrategies(): Promise<ManagerStrategy[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy("createdAtMs", "desc"))
    );

    const firestoreStrategies = snapshot.docs.map((docSnap) =>
      dataToManagerStrategy(docSnap.id, docSnap.data())
    );

    return [...firestoreStrategies, ...seedStrategies].filter(
      (strategy, index, self) =>
        index === self.findIndex((item) => item.id === strategy.id)
    );
  } catch (error) {
    console.error("Firestore strategy read failed. Falling back local.", error);
    return getLocalStrategies();
  }
}

export async function getManagerStrategyById(id: string): Promise<ManagerStrategy | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));

    if (!snap.exists()) {
      return getLocalStrategies().find((item) => item.id === id) || null;
    }

    return dataToManagerStrategy(snap.id, snap.data());
  } catch (error) {
    console.error("Firestore strategy read by id failed.", error);
    return getLocalStrategies().find((item) => item.id === id) || null;
  }
}

export async function savePublishedDraft(draft: StrategyDraft): Promise<void> {
  const strategy = draftToManagerStrategy(draft);

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: StrategyDraft[] = raw ? JSON.parse(raw) : [];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([draft, ...existing.filter((item) => item.id !== draft.id)])
    );
  }

  await setDoc(
    doc(db, COLLECTION, draft.id),
    {
      ...strategy,
      identity: draft.identity,
      markets: draft.markets,
      investment: draft.investment,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    },
    { merge: true }
  );
}

export async function updateManagerStrategy(
  id: string,
  data: Partial<ManagerStrategy>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    identity: data.name ? { name: data.name } : undefined,
    updatedAtMs: Date.now(),
  });
}

export function getLocalManagerStrategies(): ManagerStrategy[] {
  return getLocalStrategies();
}


export async function saveStrategy(strategy: Strategy): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, strategy.id),
    {
      ...strategy,
      name: strategy.identity.name,
      verified: strategy.status.verified,
      capitalFollowing: strategy.performance.capitalFollowing,
      allocators: strategy.performance.allocators,
      roi: strategy.performance.roi,
      maxDrawdown: strategy.performance.maxDrawdown,
      profitFactor: strategy.performance.profitFactor,
      createdAtMs: strategy.createdAt,
      updatedAtMs: Date.now(),
    },
    { merge: true }
  );
}

import type { Strategy as DomainStrategy } from "@/types/v2/domain/strategy";

export async function getStrategyById(id: string): Promise<DomainStrategy | null> {
  try {
    return await StrategyRepository.get(id);
  } catch (error) {
    console.error("StrategyRepository read failed.", error);
    return null;
  }
}

export async function updateStrategyIdentity(
  id: string,
  identity: Partial<DomainStrategy["identity"]>
): Promise<void> {
  await StrategyRepository.updateIdentity(id, identity);
}
