import { managerExperienceSections } from "@/core/v2/experience/registry";

export type ManagerSectionId =
  | "hero"
  | "philosophy"
  | "trust"
  | "products"
  | "research"
  | "gallery"
  | "journal";

export const managerTemplate = managerExperienceSections
  .filter((section) => section.enabled)
  .sort((a, b) => a.order - b.order)
  .map((section) => section.id as ManagerSectionId);
