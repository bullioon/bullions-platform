import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Manager } from "@/types/v2/manager";

const COLLECTION = "managers";

function managerBase(uid: string): Manager {
  const now = Date.now();

  return {
    uid,
    status: "DRAFT",
    identity: {
      username: "",
      displayName: "",
      tagline: "",
      biography: "",
      avatarUrl: "",
      bannerUrl: "",
    },
    brand: {},
    reputation: {
      verified: false,
      allocatorScore: 0,
    },
    social: {
      gallery: [],
      research: [],
      journal: [],
      links: {},
    },
    createdAt: now,
    updatedAt: now,
  };
}

function removeUndefined<T extends Record<string, unknown>>(
  input: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

async function ensureManager(uid: string): Promise<void> {
  const managerRef = doc(db, COLLECTION, uid);
  const snapshot = await getDoc(managerRef);

  if (!snapshot.exists()) {
    await setDoc(managerRef, managerBase(uid));
  }
}

export const ManagerRepository = {
  async list(): Promise<Manager[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map(
      (document) => document.data() as Manager
    );
  },

  async get(uid: string): Promise<Manager | null> {
    const snapshot = await getDoc(doc(db, COLLECTION, uid));

    if (!snapshot.exists()) return null;

    return snapshot.data() as Manager;
  },

  async create(manager: Manager): Promise<void> {
    await setDoc(
      doc(db, COLLECTION, manager.uid),
      manager,
      { merge: true }
    );
  },

  async updateIdentity(
    uid: string,
    identity: Partial<Manager["identity"]>
  ): Promise<void> {
    await ensureManager(uid);

    await setDoc(
      doc(db, COLLECTION, uid),
      {
        identity: removeUndefined(identity),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  },

  async updateBrand(
    uid: string,
    brand: Partial<Manager["brand"]>
  ): Promise<void> {
    await ensureManager(uid);

    await setDoc(
      doc(db, COLLECTION, uid),
      {
        brand: removeUndefined(brand),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  },

  async updateSocial(
    uid: string,
    social: Partial<NonNullable<Manager["social"]>>
  ): Promise<void> {
    await ensureManager(uid);

    await setDoc(
      doc(db, COLLECTION, uid),
      {
        social: removeUndefined(social),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  },

  async updateReputation(
    uid: string,
    reputation: Partial<Manager["reputation"]>
  ): Promise<void> {
    await ensureManager(uid);

    await setDoc(
      doc(db, COLLECTION, uid),
      {
        reputation: removeUndefined(reputation),
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  },
};
