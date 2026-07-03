import type { ChallengeEntry } from "@/types/v2/domain/challenge";

export type ChallengeRow = ChallengeEntry & {
  position: number;
};

export function buildChallengeLeaderboard(
  entries: ChallengeEntry[]
): ChallengeRow[] {
  return entries
    .filter(
      (entry) =>
        entry.paid === true &&
        entry.disqualified === false
    )
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));
}

export function topFive(entries: ChallengeEntry[]) {
  return buildChallengeLeaderboard(entries).slice(0, 5);
}
