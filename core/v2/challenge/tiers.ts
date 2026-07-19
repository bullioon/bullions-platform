export type ChallengeTierId = "demo_50k" | "demo_200k";

export const ChallengeTiers = {
  demo_50k: {
    id: "demo_50k",
    capitalUsd: 50000,
    label: "50K Challenge",
    feeUsd: 99,
    displayCapital: "$50,000",
  },

  demo_200k: {
    id: "demo_200k",
    capitalUsd: 200000,
    label: "200K Challenge",
    feeUsd: 280,
    displayCapital: "$200,000",
  },
} as const;

export function getChallengeTier(id: ChallengeTierId) {
  return ChallengeTiers[id];
}
