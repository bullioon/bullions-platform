import type { ChallengeRules } from "@/types/v2/domain/challenge";
import type { PerformanceSnapshot } from "@/types/v2/domain/performance";

export type RuleEvaluation = {
  passed: boolean;
  violations: string[];
};

export function evaluateRules(
  snapshot: PerformanceSnapshot,
  rules: ChallengeRules
): RuleEvaluation {

  const violations: string[] = [];

  if (snapshot.maxDrawdown > rules.maxTotalDrawdownPct) {
    violations.push("MAX_DRAWDOWN");
  }

  // TODO:
  // Daily loss
  // Trading days
  // Max lot size

  return {
    passed: violations.length === 0,
    violations,
  };
}
