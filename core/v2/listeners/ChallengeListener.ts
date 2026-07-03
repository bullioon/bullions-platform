import { EventBus } from "@/core/v2/events/EventBus";
import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";
import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";
import { evaluatePerformance } from "@/core/v2/performance/PerformanceEngine";

let registered = false;

export function registerChallengeListener() {
  if (registered) return;
  registered = true;

  EventBus.on("performance.updated", async ({ strategyId }) => {
    const snapshot = await PerformanceRepository.latest(strategyId);
    if (!snapshot) return;

    const evaluation = evaluatePerformance(snapshot);
    const season = await ChallengeRepository.getActiveSeason();

    if (!season) return;

    await ChallengeRepository.updateEntryScore(
      season.id,
      strategyId,
      evaluation.challengeScore
    );

    await EventBus.emit("challenge.score.updated", {
      strategyId,
      score: evaluation.challengeScore,
    });
  });
}
