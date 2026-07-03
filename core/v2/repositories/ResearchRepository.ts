import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { ResearchArticle } from "@/types/v2/domain/research";

const COLLECTION = "researchArticles";

export const ResearchRepository = {

  async publishedCount(strategyId: string): Promise<number> {
    const list = await this.listByStrategy(strategyId);
    return list.filter(a => a.status === "published").length;
  },

  async listByStrategy(strategyId: string): Promise<ResearchArticle[]> {
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
      }) as ResearchArticle)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async createDraft(input: {
    strategyId: string;
    title: string;
    summary: string;
    content: string;
    authorName: string;
  }): Promise<string> {
    const now = Date.now();

    const ref = await addDoc(collection(db, COLLECTION), {
      strategyId: input.strategyId,
      title: input.title,
      summary: input.summary,
      content: input.content,
      tags: [],
      status: "draft",
      authorName: input.authorName,
      reads: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    });

    return ref.id;
  },

  async update(
    id: string,
    patch: Partial<ResearchArticle>
  ): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...patch,
      updatedAt: Date.now(),
    });
  },

  async publish(id: string): Promise<void> {
    const now = Date.now();

    await updateDoc(doc(db, COLLECTION, id), {
      status: "published",
      publishedAt: now,
      updatedAt: now,
    });
  },
};
