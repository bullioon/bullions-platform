import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
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
    return addDoc(collection(db, COLLECTION), {
      ...input,
      status: "ACTIVE",
      createdAt: serverTimestamp(),
    });
  },

  async listByUser(userId: string) {
    const snap = await getDocs(
      query(
        collection(db, COLLECTION),
        where("userId", "==", userId)
      )
    );

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};
