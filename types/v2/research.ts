export type Research = {
  id: string;

  strategyId: string;

  slug: string;

  title: string;

  summary: string;

  content: string;

  market: string;

  timeframe: string;

  tags: string[];

  publishedAt: number;

  readTime: string;

  coverImage?: string;

  authorId: string;

  authorName: string;

  status: "draft" | "published";
};
