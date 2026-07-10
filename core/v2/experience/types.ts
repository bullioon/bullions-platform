export type ExperienceVisibility = "public" | "private";
export type ExperienceSurface = "manager" | "strategy" | "discover" | "bullpad";

export interface ExperienceSection {
  id: string;
  title: string;
  description: string;
  order: number;
  surface: ExperienceSurface;
  visibility: ExperienceVisibility;
  editable: boolean;
  enabled: boolean;
}
