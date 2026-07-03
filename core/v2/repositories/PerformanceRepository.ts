import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { PerformanceSnapshot } from "@/types/v2/domain/performance";

const COLLECTION = "performanceSnapshots";

export const PerformanceRepository = {
  async saveSnapshot(snapshot: PerformanceSnapshot): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTION), snapshot);
    return ref.id;
  },

  async latest(strategyId: string): Promise<PerformanceSnapshot | null> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("strategyId", "==", strategyId)
      )
    );

    const list = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }) as PerformanceSnapshot)
      .sort((a, b) => b.timestamp - a.timestamp);

    return list[0] || null;
  },

  async history(strategyId: string): Promise<PerformanceSnapshot[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("strategyId", "==", strategyId)
      )
    );

    return snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }) as PerformanceSnapshot)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
};
