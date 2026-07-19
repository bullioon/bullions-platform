export type ProductType =
  | "Research"
  | "AI"
  | "Signals"
  | "Trading Bot"
  | "Indicator"
  | "Strategy"
  | "Course"
  | "Community"
  | "Mentorship"
  | "Software"
  | "API"
  | "Tool";

export type ProductBilling =
  | "free"
  | "one_time"
  | "monthly"
  | "yearly";

export type StrategyProduct = {
  id: string;
  title: string;
  description: string;

  type: ProductType;
  billing: ProductBilling;

  priceUsd: number;
  subscribers: number;

  active: boolean;
  accessUrl?: string;
  createdAt: number;
};
