export type ResearchStatus = "draft" | "published";

export type ResearchArticle = {
  id: string;
  strategyId: string;

  title: string;
  summary: string;
  content: string;

  tags: string[];
  status: ResearchStatus;

  authorName: string;

  reads: number;

  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
};
