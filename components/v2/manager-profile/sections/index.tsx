import type { ReactNode } from "react";
import type { ManagerProfile } from "@/types/v2/profile/managerProfile";

import { ManagerHero } from "@/components/v2/manager-profile/ManagerHero";
import { InvestmentPhilosophy } from "@/components/v2/manager-profile/InvestmentPhilosophy";
import { TrustLayer } from "@/components/v2/manager-profile/TrustLayer";
import { ProductShelf } from "@/components/v2/manager-profile/ProductShelf";

export type ManagerProfileSectionId =
  | "hero"
  | "philosophy"
  | "trust"
  | "products"
  | "research"
  | "gallery"
  | "journal";

export type ManagerSection = {
  id: ManagerProfileSectionId;
  render: (profile: ManagerProfile) => ReactNode;
};

export const managerSectionRegistry: Record<ManagerProfileSectionId, ManagerSection> = {
  hero: {
    id: "hero",
    render: ({ manager, stats, runtime }) => (
      <ManagerHero
        displayName={manager.identity.displayName}
        tagline={manager.identity.tagline}
        biography={manager.identity.biography}
        strategyCount={
          runtime?.stats.strategies ??
          stats.strategies
        }
        verifiedCount={
          runtime?.stats.verifiedStrategies ??
          stats.verifiedStrategies
        }
        capitalFollowing={
          runtime?.stats.totalCapital ??
          stats.totalCapital
        }
        allocators={
          runtime?.stats.totalAllocators ??
          stats.totalAllocators
        }
      />
    ),
  },

  philosophy: {
    id: "philosophy",
    render: () => <InvestmentPhilosophy />,
  },

  trust: {
    id: "trust",
    render: ({ stats }) => (
      <TrustLayer
        verifiedStrategies={stats.verifiedStrategies}
        strategies={stats.strategies}
        totalCapital={stats.totalCapital}
        totalAllocators={stats.totalAllocators}
      />
    ),
  },

  products: {
    id: "products",
    render: ({ strategies }) => <ProductShelf strategies={strategies} />,
  },

  research: {
    id: "research",
    render: () => null,
  },

  gallery: {
    id: "gallery",
    render: () => null,
  },

  journal: {
    id: "journal",
    render: () => null,
  },
};
