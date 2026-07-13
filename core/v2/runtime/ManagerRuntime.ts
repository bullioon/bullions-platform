import type {
  MT5HealthStatus,
  RuntimeGrade,
} from "./types";

export type ManagerRuntimeStrategy = {
  strategyId: string;
  name: string;
  allocatorScore: number;
  roi: number;
  grade: RuntimeGrade;
  mt5Status: MT5HealthStatus;
  capitalFollowing: number;
  allocators: number;
};

export type ManagerRuntime = {
  managerUid: string;

  identity: {
    username: string;
    displayName: string;
    tagline: string;
    avatarUrl: string;
    bannerUrl: string;
  };

  stats: {
    strategies: number;
    verifiedStrategies: number;
    liveStrategies: number;
    totalCapital: number;
    totalAllocators: number;
    averageRoi: number;
  };

  scores: {
    allocatorScore: number;
    consistencyScore: number;
    riskScore: number;
  };

  universe: {
    grade: RuntimeGrade;
    eligible: boolean;
    visible: boolean;
  };

  bestStrategy: ManagerRuntimeStrategy | null;
  strategies: ManagerRuntimeStrategy[];

  updatedAt: number;
};
