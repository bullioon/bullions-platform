import {
  collection,
  doc,
  getDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Trader } from "@/lib/mockTraders";

const names = [
  ["Diego Ramirez", "XAU/USD Beast"],
  ["Nova Trades", "Momentum Hunter"],
  ["Maria Santos", "Risk Controller"],
  ["Alex Rivera", "Gold Intraday"],
  ["Ghost Alpha", "Low Risk Grid"],
  ["Ivan Cross", "London Session"],
  ["Mia Capital", "Smart Scalper"],
  ["Leo Prime", "Breakout Hunter"],
];

function getSundayStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function getWeekId() {
  return getSundayStart().toISOString().slice(0, 10);
}

function progressToSundayEnd() {
  const start = getSundayStart();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return Math.min(1, Math.max(0, (Date.now() - start.getTime()) / (end.getTime() - start.getTime())));
}

function seededNames(weekId: string) {
  const offset = weekId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % names.length;
  return [...names.slice(offset), ...names.slice(0, offset)];
}

export async function ensureWeeklyLeaderboard() {
  const weekId = getWeekId();
  const challengeRef = doc(db, "weeklyChallenges", weekId);
  const lbRef = collection(db, "weeklyChallenges", weekId, "leaderboard");

  const challengeSnap = await getDoc(challengeRef);
  const existing = await getDocs(lbRef);

  if (challengeSnap.exists() && !existing.empty) return weekId;

  const start = getSundayStart();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  await setDoc(challengeRef, {
    weekId,
    startsAt: start.getTime(),
    endsAt: end.getTime(),
    status: "active",
    prizeCash: 10000,
    fundingPrize: 10000,
    createdAt: serverTimestamp(),
  });

  const rotated = seededNames(weekId);

  const bot: any = {
    id: "bullions-bot",
    name: "Bullions Bot",
    tag: "TORION Adaptive AI",
    roi: 28.5,
    balance: 28500,
    topTrade: 9.8,
    maxLoss: 1.4,
    isBot: true,
  };

  await setDoc(doc(lbRef, bot.id), bot);

  for (let i = 0; i < 5; i++) {
    const base = 18 + Math.random() * 32;
    const trader: any = {
      id: `trader-${i + 1}`,
      name: rotated[i][0],
      tag: rotated[i][1],
      roi: Number(base.toFixed(1)),
      balance: Math.round(18000 + base * 850),
      topTrade: Number((4 + Math.random() * 8).toFixed(1)),
      maxLoss: Number((1.8 + Math.random() * 4).toFixed(1)),
      isBot: false,
    };

    await setDoc(doc(lbRef, trader.id), trader);
  }

  return weekId;
}

export function subscribeWeeklyLeaderboard(callback: (traders: Trader[]) => void) {
  const weekId = getWeekId();
  const lbRef = collection(db, "weeklyChallenges", weekId, "leaderboard");
  const q = query(lbRef, orderBy("roi", "desc"));

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as Trader));
  });
}

export async function pulseWeeklyLeaderboard() {
  const weekId = getWeekId();
  const lbRef = collection(db, "weeklyChallenges", weekId, "leaderboard");
  const snap = await getDocs(lbRef);

  const progress = progressToSundayEnd();

  await Promise.all(
    snap.docs.map(async (d) => {
      const trader = d.data() as Trader & { isBot?: boolean };

      const botBoost = trader.isBot ? 0.65 + progress * 1.25 : 0;
      const humanMove = trader.isBot ? 0 : Math.random() * 0.9 - 0.15;
      const roi = Number(Math.max(1, trader.roi + botBoost + humanMove).toFixed(1));

      await updateDoc(d.ref, {
        roi,
        balance: Math.round(12000 + roi * 920),
        updatedAt: Date.now(),
      });
    })
  );
}
