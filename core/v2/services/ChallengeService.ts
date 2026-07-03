import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";
import { createChallengeEntry } from "@/core/v2/challenge/ChallengeEngine";
import type { ChallengeTierId } from "@/types/v2/domain/challenge";
import type { Strategy } from "@/types/v2/domain/strategy";

export const ChallengeService = {
  async enter(strategy: Strategy, tierId: ChallengeTierId) {
    const season = await ChallengeRepository.getActiveSeason();

    if (!season) {
      throw new Error("No active challenge season.");
    }

    const entry = createChallengeEntry(strategy, season, tierId);

    await ChallengeRepository.saveEntry(entry);

    return entry;
  },
};
