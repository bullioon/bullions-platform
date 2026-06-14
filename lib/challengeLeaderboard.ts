import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Trader } from "@/lib/mockTraders";

const names = [
  ["axbullions", "Founder Signal"],
  ["Diego Ramirez", "XAU/USD Beast"],
  ["Nova Trades", "Momentum Hunter"],
  ["Maria Santos", "Risk Controller"],
  ["Alex Rivera", "Gold Intraday"],
  ["Ghost Alpha", "Low Risk Grid"],
  ["Ivan Cross", "London Session"],
  ["Mia Capital", "Smart Scalper"],
  ["Leo Prime", "Breakout Hunter"],
  ["Phantom Bull", "SOL Momentum"],
  ["Torion Desk", "AI Scalper"],
  ["Hellion Capital", "High Risk Hunter"],
  ["Bullion Whale", "Liquidity Sniper"],
  ["Sixx Signals", "Breakout Engine"],
];


function pairForTrader(name: string, tag: string) {
  const value = `${name} ${tag}`.toUpperCase();

  if (value.includes("BULLIONS BOT")) return "BTC/USD";
  if (value.includes("PHANTOM") || value.includes("SOL")) return "SOL/USD";
  if (value.includes("NOVA") || value.includes("ETH")) return "ETH/USD";
  if (value.includes("GHOST")) return "BTC/USD";
  if (value.includes("MARIA") || value.includes("EUR")) return "EUR/USD";
  if (value.includes("MIA") || value.includes("US30")) return "US30";
  if (value.includes("ALEX") || value.includes("NAS")) return "NAS100";
  if (value.includes("IVAN") || value.includes("DIEGO") || value.includes("XAU") || value.includes("GOLD")) return "XAU/USD";

  return "XAU/USD";
}

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

function seededNames(weekId: string) {
  const offset =
    weekId.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % names.length;

  return [...names.slice(offset), ...names.slice(0, offset)];
}

export async function ensureWeeklyLeaderboard() {
  const weekId = getWeekId();
  const challengeRef = doc(db, "weeklyChallenges", weekId);
  const lbRef = collection(db, "weeklyChallenges", weekId, "leaderboard");

  const challengeSnap = await getDoc(challengeRef);
  const existing = await getDocs(lbRef);

  const needsReset =
    existing.docs.length !== 8 ||
    existing.docs.some((d) => {
      const data = d.data() as any;
      return data.weekId !== weekId;
    });

  if (challengeSnap.exists() && !needsReset) {
    return weekId;
  }

  if (existing.docs.length > 0) {
    await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));
  }

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

  await setDoc(doc(lbRef, "bullions-bot"), {
    id: "bullions-bot",
    name: "Bullions Bot",
    pair: "BTC/USD",
    tag: "TORION Adaptive AI",
    roi: 0,
    balance: 10000,
    topTrade: 0,
    maxLoss: 0,
    isBot: true,
    weekId,
  });

  for (let i = 0; i < 7; i++) {
    const trader = {
      id: `${weekId}-trader-${i + 1}`,
      name: rotated[i][0],
      tag: rotated[i][1],
      pair: pairForTrader(rotated[i][0], rotated[i][1]),
      roi: 0,
      balance: 10000,
      topTrade: 0,
      maxLoss: 0,
      isBot: false,
      weekId,
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
  const weekId = await ensureWeeklyLeaderboard();
  const lbRef = collection(db, "weeklyChallenges", weekId, "leaderboard");
  const snap = await getDocs(lbRef);

  await Promise.all(
    snap.docs.map(async (d) => {
      const trader = d.data() as Trader & { isBot?: boolean };
      const currentRoi = Number(trader.roi || 0);

      const botMove = trader.isBot ? 0.01 + Math.random() * 0.04 : 0;
      const humanMove = trader.isBot ? 0 : Math.random() * 0.08 - 0.02;
      const founderMove =
        trader.name === "axbullions" ? 0.25 + Math.random() * 0.75 : 0;

      const roi = Number(
        Math.max(0, currentRoi + botMove + humanMove + founderMove).toFixed(1)
      );

      await updateDoc(d.ref, {
        pair: trader.pair || pairForTrader(trader.name, trader.tag),
        roi,
        balance: Math.round(10000 * (1 + roi / 100)),
        topTrade: Number(
          Math.max(Number(trader.topTrade || 0), roi * 0.22).toFixed(1)
        ),
        maxLoss: Number(
          Math.max(Number(trader.maxLoss || 0), Math.random() * 2.8).toFixed(1)
        ),
        updatedAt: Date.now(),
      });
    })
  );
}
