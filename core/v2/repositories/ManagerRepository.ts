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
import type { Manager } from "@/types/v2/manager";

const COLLECTION = "managers";

export const ManagerRepository = {
  async list(): Promise<Manager[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map((docSnap) => docSnap.data() as Manager);
  },

  async get(uid: string): Promise<Manager | null> {
    const snapshot = await getDoc(doc(db, COLLECTION, uid));

    if (!snapshot.exists()) return null;

    return snapshot.data() as Manager;
  },

  async create(manager: Manager): Promise<void> {
    await setDoc(doc(db, COLLECTION, manager.uid), manager, {
      merge: true,
    });
  },

  async updateIdentity(
    uid: string,
    identity: Partial<Manager["identity"]>
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    Object.entries(identity).forEach(([key, value]) => {
      payload[`identity.${key}`] = value;
    });

    await updateDoc(doc(db, COLLECTION, uid), payload);
  },

  async updateBrand(
    uid: string,
    brand: Partial<Manager["brand"]>
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    Object.entries(brand).forEach(([key, value]) => {
      payload[`brand.${key}`] = value;
    });

    await updateDoc(doc(db, COLLECTION, uid), payload);
  },

  async updateReputation(
    uid: string,
    reputation: Partial<Manager["reputation"]>
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    Object.entries(reputation).forEach(([key, value]) => {
      payload[`reputation.${key}`] = value;
    });

    await updateDoc(doc(db, COLLECTION, uid), payload);
  },
};
