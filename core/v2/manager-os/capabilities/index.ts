export type ManagerCapabilityId =
  | "identity"
  | "gallery"
  | "journal"
  | "research"
  | "products"
  | "strategies"
  | "publishing";

export interface ManagerCapability {
  id: ManagerCapabilityId;
  title: string;
  description: string;
  stage: "draft" | "active" | "locked";
}

export const managerCapabilities: ManagerCapability[] = [
  {
    id: "identity",
    title: "Identity",
    description: "Define the public investment identity.",
    stage: "active",
  },
  {
    id: "gallery",
    title: "Gallery",
    description: "Build visual proof and manager context.",
    stage: "draft",
  },
  {
    id: "journal",
    title: "Journal",
    description: "Publish narrative updates and market notes.",
    stage: "draft",
  },
  {
    id: "research",
    title: "Research",
    description: "Attach institutional research and theses.",
    stage: "draft",
  },
  {
    id: "products",
    title: "Marketplace",
    description: "Sell research, AI, systems, software and access.",
    stage: "draft",
  },
  {
    id: "strategies",
    title: "Strategies",
    description: "Connect investment products to this manager.",
    stage: "active",
  },
  {
    id: "publishing",
    title: "Publishing",
    description: "Control visibility, review, and verification.",
    stage: "active",
  },
];
