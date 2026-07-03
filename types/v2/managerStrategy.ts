export type ManagerStrategy = {

  id: string;

  name: string;

  status: "ACTIVE" | "PAUSED" | "DRAFT";

  verified: boolean;

  capitalFollowing: number;

  allocators: number;

  roi: number;

  maxDrawdown: number;

  profitFactor: number;

  createdAt: string;

};
