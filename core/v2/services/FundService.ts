import { doc, getDoc, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
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

    const traderIds = funds
      .filter((f: any) => f.status === "ACTIVE")
      .flatMap((f: any) => {
        if (Array.isArray(f.managers) && f.managers.length > 0) {
          return f.managers.map((manager: any) => normalizeTraderId(manager?.traderId));
        }

        if (Array.isArray(f.strategyAllocations) && f.strategyAllocations.length > 0) {
          return f.strategyAllocations.map((allocation: any) => normalizeTraderId(allocation?.traderId));
        }

        return [normalizeTraderId(f.traderId)];
      })
      .filter(Boolean) as string[];

    return Array.from(new Set(traderIds));
  },

  async deallocateByTraderId(userId: string, traderId: string): Promise<string[]> {
    const activeFundId = `${userId}_active`;
    const activeFundRef = doc(db, "funds", activeFundId);
    const activeFundSnap = await getDoc(activeFundRef);

    if (activeFundSnap.exists()) {
      const activeFund = activeFundSnap.data() as any;

      if (activeFund.status === "ACTIVE") {
        const managers = Array.isArray(activeFund.managers) ? activeFund.managers : [];
        const strategyAllocations = Array.isArray(activeFund.strategyAllocations)
          ? activeFund.strategyAllocations
          : [];

        const removedAllocations = strategyAllocations.filter(
          (allocation: any) => normalizeTraderId(allocation.traderId) === traderId
        );

        const nextManagers = managers.filter(
          (manager: any) => normalizeTraderId(manager.traderId) !== traderId
        );

        const nextStrategyAllocations = strategyAllocations.filter(
          (allocation: any) => normalizeTraderId(allocation.traderId) !== traderId
        );

        for (let index = 0; index < removedAllocations.length; index++) {
          const allocation = removedAllocations[index];

          await FundRepository.closeStrategyAllocation({
            strategyId: allocation.strategyId,
            amount: Number(allocation.capitalUsd || 0),
            decrementAllocator: index === 0,
          });
        }

        if (nextManagers.length === 0) {
          await updateDoc(activeFundRef, {
            managers: [],
            strategyAllocations: [],
            status: "CLOSED",
            capitalUsd: 0,
            fundEquityUsd: 0,
            fundPnlUsd: 0,
            updatedAt: Date.now(),
          });

          await updateDoc(doc(db, "users", userId), {
            activeFundId: null,
            fundActive: false,
            copiedTraderId: null,
            systemActive: false,
            allocatedUsd: 0,
            fundEquityUsd: 0,
            fundPnlUsd: 0,
            updatedAt: Date.now(),
          });

          return [];
        }

        await updateDoc(activeFundRef, {
          managers: nextManagers,
          strategyAllocations: nextStrategyAllocations,
          updatedAt: Date.now(),
        });

        return nextManagers
          .map((manager: any) => normalizeTraderId(manager.traderId))
          .filter(Boolean) as string[];
      }
    }

    return this.getSelectedTraderIds(userId);
  },
};
