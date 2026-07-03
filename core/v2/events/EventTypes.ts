export type EventPayloads = {
  "performance.updated": {
    strategyId: string;
    snapshotId?: string;
  };

  "challenge.registered": {
    strategyId: string;
    seasonId: string;
  };

  "challenge.score.updated": {
    strategyId: string;
    score: number;
  };

  "challenge.disqualified": {
    strategyId: string;
    reason: string;
  };

  "withdrawal.completed": {
    strategyId: string;
    amountUsd: number;
  };
};
