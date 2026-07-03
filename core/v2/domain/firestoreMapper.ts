import type { Strategy } from "@/types/v2/domain/strategy";

export function strategyToFirestore(strategy: Strategy) {
  return {
    ...strategy,
    updatedAt: Date.now(),
  };
}

export function firestoreToStrategy(data: any): Strategy {
  return data as Strategy;
}
