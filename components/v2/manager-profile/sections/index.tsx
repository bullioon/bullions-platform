import type { ReactNode } from "react";
import type { ManagerProfile } from "@/types/v2/profile/managerProfile";

import { ManagerHero } from "@/components/v2/manager-profile/hero/ManagerHero";
import { InvestmentPhilosophy } from "@/components/v2/manager-profile/InvestmentPhilosophy";
import { TrustLayer } from "@/components/v2/manager-profile/TrustLayer";
import { ProductShelf } from "@/components/v2/manager-profile/ProductShelf";
import {
  ManagerJournalSection,
  ManagerResearchSection,
} from "@/components/v2/manager-profile/ManagerSocialSections";
import { ManagerGallery } from "@/components/v2/manager-profile/gallery/ManagerGallery";

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
    render: (profile) => (
      <ManagerHero profile={profile} />
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
    render: ({ strategies, runtime }) => (
      <ProductShelf
        strategies={strategies}
        runtimeStrategies={runtime?.strategies ?? []}
      />
    ),
  },

  research: {
    id: "research",
    render: ({ manager }) => (
      <ManagerResearchSection manager={manager} />
    ),
  },

  gallery: {
    id: "gallery",
    render: ({ manager }) => (
      <ManagerGallery manager={manager} />
    ),
  },

  journal: {
    id: "journal",
    render: ({ manager }) => (
      <ManagerJournalSection manager={manager} />
    ),
  },
};
