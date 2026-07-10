import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const COLLECTION = "funds";

export const FundRepository = {
  async create(input: {
    userId: string;
    traderId: string;
    strategyId: string;
    amount: number;
  }) {
    const existingSnap = await getDocs(
      query(
        collection(db, COLLECTION),
        where("userId", "==", input.userId),
        where("strategyId", "==", input.strategyId),
        where("status", "==", "ACTIVE")
      )
    );

    const existing = existingSnap.docs[0];

    if (existing) {
      await updateDoc(doc(db, COLLECTION, existing.id), {
        traderId: input.traderId,
        amount: Number((Number((existing.data() as any).amount || 0) + input.amount).toFixed(2)),
        updatedAt: serverTimestamp(),
      });

      await runTransaction(db, async (tx) => {
        const strategyRef = doc(db, "managerStrategies", input.strategyId);
        const strategySnap = await tx.get(strategyRef);
        const data = strategySnap.data() as any;

        const currentCapital = Number(data?.performance?.capitalFollowing ?? data?.capitalFollowing ?? 0);
        const nextCapital = Math.max(0, currentCapital + input.amount);

        tx.update(strategyRef, {
          "performance.capitalFollowing": nextCapital,
          capitalFollowing: nextCapital,
          updatedAt: Date.now(),
          updatedAtMs: Date.now(),
        });
      });

      return existing.ref;
    }

    const ref = await addDoc(collection(db, COLLECTION), {
      ...input,
      status: "ACTIVE",
      createdAt: serverTimestamp(),
    });

    await runTransaction(db, async (tx) => {
      const strategyRef = doc(db, "managerStrategies", input.strategyId);
      const strategySnap = await tx.get(strategyRef);
      const data = strategySnap.data() as any;

      const currentCapital = Number(data?.performance?.capitalFollowing ?? data?.capitalFollowing ?? 0);
      const currentAllocators = Number(data?.performance?.allocators ?? data?.allocators ?? 0);

      tx.update(strategyRef, {
        "performance.capitalFollowing": Math.max(0, currentCapital + input.amount),
        "performance.allocators": Math.max(0, currentAllocators + 1),
        capitalFollowing: Math.max(0, currentCapital + input.amount),
        allocators: Math.max(0, currentAllocators + 1),
        updatedAt: Date.now(),
        updatedAtMs: Date.now(),
      });
    });

    return ref;
  },

  async closeStrategyAllocation(input: {
    strategyId: string;
    amount: number;
    decrementAllocator?: boolean;
  }) {
    await runTransaction(db, async (tx) => {
      const strategyRef = doc(db, "managerStrategies", input.strategyId);
      const strategySnap = await tx.get(strategyRef);
      const data = strategySnap.data() as any;

      const currentCapital = Number(data?.performance?.capitalFollowing ?? data?.capitalFollowing ?? 0);
      const currentAllocators = Number(data?.performance?.allocators ?? data?.allocators ?? 0);

      const nextCapital = Math.max(0, currentCapital - Math.abs(input.amount));
      const nextAllocators =
        input.decrementAllocator === false
          ? currentAllocators
          : Math.max(0, currentAllocators - 1);

      tx.update(strategyRef, {
        "performance.capitalFollowing": nextCapital,
        "performance.allocators": nextAllocators,
        capitalFollowing: nextCapital,
        allocators: nextAllocators,
        updatedAt: Date.now(),
        updatedAtMs: Date.now(),
      });
    });
  },

  async close(input: {
    fundId: string;
    strategyId: string;
    amount: number;
    decrementAllocator?: boolean;
  }) {
    await updateDoc(doc(db, COLLECTION, input.fundId), {
      status: "CLOSED",
      closedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await runTransaction(db, async (tx) => {
      const strategyRef = doc(db, "managerStrategies", input.strategyId);
      const strategySnap = await tx.get(strategyRef);
      const data = strategySnap.data() as any;

      const currentCapital = Number(data?.performance?.capitalFollowing ?? data?.capitalFollowing ?? 0);
      const currentAllocators = Number(data?.performance?.allocators ?? data?.allocators ?? 0);

      const nextCapital = Math.max(0, currentCapital - Math.abs(input.amount));
      const nextAllocators =
        input.decrementAllocator === false
          ? currentAllocators
          : Math.max(0, currentAllocators - 1);

      tx.update(strategyRef, {
        "performance.capitalFollowing": nextCapital,
        "performance.allocators": nextAllocators,
        capitalFollowing: nextCapital,
        allocators: nextAllocators,
        updatedAt: Date.now(),
        updatedAtMs: Date.now(),
      });
    });
  },

  async listByUser(userId: string) {
    const snap = await getDocs(
      query(
        collection(db, COLLECTION),
        where("userId", "==", userId)
      )
    );

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};
