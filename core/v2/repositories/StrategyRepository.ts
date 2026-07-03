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
import type { Strategy } from "@/types/v2/domain/strategy";

const COLLECTION = "managerStrategies";

export const StrategyRepository = {
  async list(): Promise<Strategy[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map((docSnap) => docSnap.data() as Strategy);
  },

  async get(id: string): Promise<Strategy | null> {
    const snapshot = await getDoc(doc(db, COLLECTION, id));

    if (!snapshot.exists()) return null;

    return snapshot.data() as Strategy;
  },

  async create(strategy: Strategy): Promise<void> {
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
  },

  async updateIdentity(
    id: string,
    identity: Partial<Strategy["identity"]>
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      updatedAt: Date.now(),
      updatedAtMs: Date.now(),
    };

    if (identity.name !== undefined) {
      payload["identity.name"] = identity.name;
      payload.name = identity.name;
    }

    if (identity.subtitle !== undefined) {
      payload["identity.subtitle"] = identity.subtitle;
    }

    if (identity.description !== undefined) {
      payload["identity.description"] = identity.description;
    }

    if (identity.avatarUrl !== undefined) {
      payload["identity.avatarUrl"] = identity.avatarUrl;
    }

    if (identity.bannerUrl !== undefined) {
      payload["identity.bannerUrl"] = identity.bannerUrl;
    }

    await updateDoc(doc(db, COLLECTION, id), payload);
  },

  async updatePerformance(
    id: string,
    performance: Partial<Strategy["performance"]>
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      updatedAt: Date.now(),
      updatedAtMs: Date.now(),
    };

    Object.entries(performance).forEach(([key, value]) => {
      payload[`performance.${key}`] = value;
      payload[key] = value;
    });

    await updateDoc(doc(db, COLLECTION, id), payload);
  },

  async updateChallenge(
    id: string,
    challenge: Partial<Strategy["challenge"]>
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      updatedAt: Date.now(),
      updatedAtMs: Date.now(),
    };

    Object.entries(challenge).forEach(([key, value]) => {
      payload[`challenge.${key}`] = value;
    });

    await updateDoc(doc(db, COLLECTION, id), payload);
  },
};
