"use client";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
type Tag = "system" | "deposit" | "copy" | "profit" | "challenge";
type Msg = {
  id: string;
  name: string;
  text: string;
  tag: Tag;
};
type Props = {
  events?: string[];
  userName?: string;
};
const localActivity: Msg[] = [
  { id: "local-1", name: "System", text: "Leaderboard updated live.", tag: "system" },
  { id: "local-2", name: "TORION", text: "Risk layer recalibrated allocation.", tag: "system" },
  { id: "local-3", name: "Ghost Alpha", text: "Recovery momentum detected.", tag: "profit" },
  { id: "local-4", name: "Mia Capital", text: "Copy Engine activated.", tag: "copy" },
];
function styleByTag(tag: Tag) {
  if (tag === "deposit") return "bg-[#b6ff00]/10 text-[#b6ff00] ring-[#b6ff00]/20";
  if (tag === "profit") return "bg-emerald-400/10 text-emerald-300 ring-emerald-300/15";
  if (tag === "challenge") return "bg-yellow-300/10 text-yellow-200 ring-yellow-300/15";
  if (tag === "copy") return "bg-white/[0.06] text-white/75 ring-white/10";
  return "bg-white/[0.04] text-white/45 ring-white/5";
}
export function TerminalChat({ events = [], userName = "User" }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const eventMessages = useMemo(
    () =>
      events.slice(0, 2).map((e, i) => ({
        id: `event-${i}-${e}`,
        name: "System",
        text: e,
        tag: "system" as const,
      })),
    [events]
  );
  useEffect(() => {
    const q = query(collection(db, "liveChat"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Msg, "id">),
          }))
          .reverse();
        setMessages(data as Msg[]);
      },
      (error) => {
        console.warn("Live chat unavailable:", error.message);
        setMessages([]);
      }
    );
    return () => unsubscribe();
  }, []);
  async function sendMessage() {
    const text = input.trim();
    if (!text || sending || cooldown) return;
    setSending(true);
    setCooldown(true);
    try {
      await addDoc(collection(db, "liveChat"), {
        name: userName,
        text,
        tag: "copy",
        createdAt: serverTimestamp(),
      });
      setInput("");
    } catch (error) {
      console.warn("Chat send failed:", error);
    } finally {
      setSending(false);
      setTimeout(() => setCooldown(false), 5000);
    }
  }
  const merged = [...localActivity, ...eventMessages, ...messages].slice(-12);
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-[#101114] p-4 ring-1 ring-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.10),transparent_42%)]" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40">Live room</p>
            <h3 className="text-2xl font-semibold text-white">Live activity</h3>
          </div>
          <span className="rounded-full bg-[#b6ff00]/12 px-3 py-1 text-[11px] font-semibold text-[#b6ff00] ring-1 ring-[#b6ff00]/20">
            Live
          </span>
        </div>
        <div className="flex h-[180px] flex-col gap-2 overflow-y-auto pr-1">
          {merged.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-[14px] px-3 py-2 text-xs ring-1 ${styleByTag(msg.tag)}`}
            >
              <div className="mb-0.5 flex items-center justify-between gap-3">
                <p className="font-semibold opacity-90">{msg.name}</p>
                <span className="text-[9px] opacity-40">now</span>
              </div>
              <p className="leading-5">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-black/30 p-2 ring-1 ring-white/5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="React to activity..."
            className="min-w-0 flex-1 bg-transparent px-3 text-xs text-white outline-none placeholder:text-white/30"
          />
          <button
            onClick={sendMessage}
            disabled={sending || cooldown || !input.trim()}
            className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? "..." : cooldown ? "Wait" : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}
