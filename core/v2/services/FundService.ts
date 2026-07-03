import { FundRepository } from "@/core/v2/repositories/FundRepository";

function normalizeTraderId(id: unknown): string | null {
  if (!id) return null;

  const value = String(id);

  const map: Record<string, string> = {
    "local-manager": "ghost_alpha",
    "managerdos": "ghost_alpha",
    "ghost": "ghost_alpha",
    "bullions_ai": "bullions-bot",
  };

  return map[value] || value;
}

export const FundService = {
  async getSelectedTraderIds(userId: string): Promise<string[]> {
    const funds = await FundRepository.listByUser(userId);

    return Array.from(
      new Set(
        funds
          .filter((f: any) => f.status === "ACTIVE")
          .map((f: any) => normalizeTraderId(f.traderId))
          .filter(Boolean) as string[]
      )
    );
  },
};
