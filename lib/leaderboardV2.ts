import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Trader } from "@/lib/mockTraders";

export function subscribeLeaderboardV2(cb: (traders: Trader[]) => void) {
  return onSnapshot(collection(db, "leaderboardV2"), (snap) => {
    const traders = snap.docs.map((d) => {
      const data = d.data() as any;

      const id = data.id || d.id;

      const strategyAliases: Record<string, string> = {
        ghost_alpha: "aa07ccd7-bae1-471c-84ab-185d881e9f97",
        "local-manager": "aa07ccd7-bae1-471c-84ab-185d881e9f97",
        managerdos: "aa07ccd7-bae1-471c-84ab-185d881e9f97",
        mia_capital: "strategy_mia_capital",
        ax_prime_KMF63S: "strategy_ax_prime_KMF63S",
        bullions_ai: "strategy_bullions_ai",
        "bullions-bot": "strategy_bullions_ai",
        torion_desk: "strategy_torion_desk",
      };

      return {
        id,
        strategyId: data.strategyId || strategyAliases[id] || `strategy_${id}`,
        name: data.name || "Unknown Trader",
        tag: data.tag || data.style || "Verified trader",
        avatar: data.avatar || "⚔️",
        roi: Number(data.roi || 0),
        profitUsd: Number(data.equity || 0) - Number(data.initialBalance || 0),
        balance: Number(data.equity || data.balance || 0),
        topTrade: Number(data.bullionsScore || 0),
        maxLoss: Number(data.maxDrawdown || 0),
        pair: data.pair || "MULTI",
        capitalFollowing: Number(data.capitalFollowing || 0),
        followers: Number(data.followers || 0),
        winRate: Number(data.winRate || 0),
        profitFactor: Number(data.profitFactor || 0),
        challengeTier: data.challengeTier || "HELLION",
        seasonId: data.seasonId || "season_01",
        style: data.style || data.tag || "Verified trader",
        specialty: data.specialty || "Balanced Trader",
        riskProfile: data.riskProfile || "MEDIUM",
        skills: data.skills || {
          entries: 75,
          exits: 65,
          riskControl: 70,
          consistency: 70,
          recovery: 70,
          discipline: 70,
        },
      };
    });

    cb(
      traders.sort(
        (a, b) => Number(b.topTrade || 0) - Number(a.topTrade || 0)
      )
    );
  });
}
