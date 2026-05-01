"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type Props = {
  events?: string[];
  userName?: string;
};

type Msg = {
  id: string;
  name: string;
  text: string;
  tag: "system" | "deposit" | "copy" | "profit" | "challenge";
  createdAt?: unknown;
};

const autoMessages = [
  { name: "System", text: "A new trader entered the weekly challenge.", tag: "challenge" },
  { name: "Mia", text: "started monitoring Ghost Alpha.", tag: "copy" },
  { name: "Leo", text: "locked in a clean green session.", tag: "profit" },
  { name: "Alex", text: "activated Copy Engine after deposit.", tag: "deposit" },
  { name: "System", text: "Top traders are being ranked by live performance.", tag: "system" },
  { name: "Ivan", text: "switched from aggressive to low-risk mode.", tag: "copy" },
  { name: "Nika", text: "joined before the weekly reset.", tag: "challenge" },
  { name: "System", text: "Funding spots update every cycle.", tag: "system" },
  { name: "Marco", text: "is comparing risk before copying.", tag: "copy" },
  { name: "System", text: "Copy Engine unlocks only after deposit.", tag: "system" },
] as const;

function styleByTag(tag: Msg["tag"]) {
  if (tag === "deposit") return "bg-[#b6ff00]/10 text-[#b6ff00] ring-[#b6ff00]/20";
  if (tag === "profit") return "bg-emerald-400/10 text-emerald-300 ring-emerald-300/15";
  if (tag === "challenge") return "bg-yellow-300/10 text-yellow-200 ring-yellow-300/15";
  if (tag === "copy") return "bg-white/[0.06] text-white/75 ring-white/10";
  return "bg-white/[0.04] text-white/45 ring-white/5";
}

export function TerminalChat({ events = [], userName = "You" }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
    const q = query(
      collection(db, "liveChat"),
      orderBy("createdAt", "desc"),
      limit(18)
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Msg, "id">),
        }))
        .reverse();

      setMessages(data as Msg[]);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const msg = autoMessages[Math.floor(Math.random() * autoMessages.length)];

      await addDoc(collection(db, "liveChat"), {
        name: msg.name,
        text: msg.text,
        tag: msg.tag,
        createdAt: serverTimestamp(),
      });
    }, 11000 + Math.floor(Math.random() * 7000));

    return () => clearInterval(interval);
  }, []);

  function isNearBottom() {
    const el = containerRef.current;
    if (!el) return false;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isNearBottom()) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, eventMessages]);

  async function sendMessage() {
    if (!input.trim()) return;

    await addDoc(collection(db, "liveChat"), {
      name: userName,
      text: input.trim(),
      tag: "copy",
      createdAt: serverTimestamp(),
    });

    setInput("");
  }

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

        <div className="mb-3 rounded-[18px] bg-[#b6ff00]/10 p-3 ring-1 ring-[#b6ff00]/20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b6ff00]/75">
            Action alert
          </p>
          <p className="mt-1 text-xs font-medium text-white/80">
            Live deposits, copy engine updates and weekly challenge activity.
          </p>
        </div>

        <div
          ref={containerRef}
          className="flex h-[180px] flex-col gap-2 overflow-y-auto pr-1"
        >
          {[...eventMessages, ...messages].slice(-12).map((msg) => (
            <div
              key={msg.id}
              className={`rounded-[14px] px-3 py-2 text-xs ring-1 ${styleByTag(msg.tag)} animate-fade-up`}
            >
              <div className="mb-0.5 flex items-center justify-between gap-3">
                <p className="font-semibold opacity-90">{msg.name}</p>
                <span className="text-[9px] opacity-40">now</span>
              </div>
              <p className="leading-5">{msg.text}</p>
            </div>
          ))}
          <div ref={bottomRef} />
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
            className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-black transition hover:opacity-90"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
