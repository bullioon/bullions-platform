import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { StrategyRepository } from "@/core/v2/repositories/StrategyRepository";
import type { ChallengeEntry, ChallengeSeason } from "@/types/v2/domain/challenge";

const SEASONS = "challengeSeasons";
const ENTRIES = "challengeEntries";

export const ChallengeRepository = {
  async getActiveSeason(): Promise<ChallengeSeason | null> {
    const snapshot = await getDocs(
      query(collection(db, SEASONS), where("status", "in", ["registration", "active"]))
    );

    const first = snapshot.docs[0];
    if (!first) return null;

    return { id: first.id, ...first.data() } as ChallengeSeason;
  },

  async getEntry(seasonId: string, strategyId: string): Promise<ChallengeEntry | null> {
    const id = `${seasonId}_${strategyId}`;
    const snapshot = await getDoc(doc(db, ENTRIES, id));

    if (!snapshot.exists()) return null;

    return { id: snapshot.id, ...snapshot.data() } as ChallengeEntry;
  },

  async saveEntry(entry: ChallengeEntry): Promise<void> {
    await setDoc(doc(db, ENTRIES, entry.id), entry, { merge: true });
  },

  async createEntry(input: {
    seasonId: string;
    strategyId: string;
    tierId: "demo_50k" | "demo_200k";
  }): Promise<void> {
    const id = `${input.seasonId}_${input.strategyId}`;

    const entryFeeUsd = input.tierId === "demo_200k" ? 1080 : 350;

    await setDoc(
      doc(db, ENTRIES, id),
      {
        id,
        seasonId: input.seasonId,
        strategyId: input.strategyId,
        tierId: input.tierId,
        paid: false,
        disqualified: false,
        disqualificationReason: null,
        rank: null,
        score: 0,
        eligibleForTopFive: false,
        payoutSharePct: 0,
        createdAt: Date.now(),
      },
      { merge: true }
    );

    await StrategyRepository.updateChallenge(input.strategyId, {
      status: "enrolled",
      challengeId: input.seasonId,
      eligibleForLeaderboard: false,
      entryFeeUsd,
    });
  },

  async markPaid(seasonId: string, strategyId: string): Promise<void> {
    const id = `${seasonId}_${strategyId}`;

    await setDoc(
      doc(db, ENTRIES, id),
      {
        id,
        seasonId,
        strategyId,
        paid: true,
        eligibleForTopFive: true,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  },

  async updateEntryScore(
    seasonId: string,
    strategyId: string,
    score: number
  ): Promise<void> {
    const id = `${seasonId}_${strategyId}`;

    await setDoc(
      doc(db, ENTRIES, id),
      {
        id,
        seasonId,
        strategyId,
        score,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  },
};
