import type { Research } from "@/types/v2/research";

export const mockResearch: Research[] = [
  {
    id: "gold-weekly",
    strategyId: "ghost-alpha",
    slug: "gold-weekly-outlook",
    title: "Weekly Gold Outlook",
    summary:
      "Institutional positioning remains constructive while liquidity continues building below resistance.",
    content:
      "Full article placeholder.",
    market: "XAUUSD",
    timeframe: "Swing",
    tags: ["Gold", "Macro"],
    publishedAt: Date.now(),
    readTime: "6 min",
    authorId: "manager-1",
    authorName: "Alex Smith",
    status: "published",
  },
];
