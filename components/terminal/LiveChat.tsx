"use client";

import { useEffect, useState } from "react";

type Message = {
  id: number;
  text: string;
  type: "system" | "user";
};

const seedMessages: Message[] = [
  { id: 1, text: "BullPad loaded in guest mode.", type: "system" },
  { id: 2, text: "Deposit to activate copy engine.", type: "system" },
  { id: 3, text: "Alex deposited $250", type: "user" },
  { id: 4, text: "Mia started copying Ghost Alpha", type: "user" },
];

export function LiveChat() {
  const [messages, setMessages] = useState(seedMessages);

  // FAKE LIVE FEED (luego lo conectas a Firestore)
  useEffect(() => {
    const interval = setInterval(() => {
      const random = [
        "Leo profit +$42",
        "New user joined challenge",
        "Trader up +12% today",
        "Deposit received $150",
      ];

      const msg = {
        id: Date.now(),
        text: random[Math.floor(Math.random() * random.length)],
        type: "user" as const,
      };

      setMessages((prev) => [...prev.slice(-6), msg]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl bg-[#0f1114] p-4 ring-1 ring-white/5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Live room</p>
        <span className="rounded-full bg-[#b6ff00]/10 px-3 py-1 text-[11px] text-[#b6ff00]">
          Live
        </span>
      </div>

      <div className="flex h-[320px] flex-col gap-2 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.type === "system"
                ? "bg-white/[0.05] text-white/50"
                : "bg-[#b6ff00]/10 text-[#b6ff00]"
            } animate-fade-up`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          placeholder="React..."
          className="flex-1 rounded-lg bg-white/[0.05] px-3 py-2 text-sm text-white outline-none"
        />
        <button className="rounded-lg bg-[#b6ff00] px-4 text-sm font-semibold text-black">
          Send
        </button>
      </div>
    </div>
  );
}
