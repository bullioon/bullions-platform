import { getCapitalRankings } from "./capital-rankings";

export type MissionRuntime = {
  timestamp: number;

  season: {
    id: string;
    endsAt: number;
    seats: {
      used: number;
      total: number;
    };
    managers: number;
  };

  rankings: Awaited<ReturnType<typeof getCapitalRankings>>;

  featured: {
    strategyId: string | null;
  };

  mt5: {
    connected: boolean;
    delayMinutes: number;
  };

  six: {
    status: "online";
  };
};

export async function buildMissionRuntime(): Promise<MissionRuntime> {
  const rankings = await getCapitalRankings();

  return {
    timestamp: Date.now(),

    season: {
      id: "03",
      endsAt: Date.now() + 20 * 24 * 60 * 60 * 1000,

      seats: {
        used: 8,
        total: 20,
      },

      managers: rankings.length,
    },

    rankings,

    featured: {
      strategyId: rankings[0]?.id ?? null,
    },

    mt5: {
      connected: true,
      delayMinutes: 30,
    },

    six: {
      status: "online",
    },
  };
}
