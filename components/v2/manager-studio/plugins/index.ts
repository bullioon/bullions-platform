export interface StudioPlugin {
  id: string;
  title: string;
  description: string;
}

export const studioPlugins: StudioPlugin[] = [
  {
    id: "identity",
    title: "Identity",
    description: "Build your investment identity.",
  },
  {
    id: "brand",
    title: "Brand",
    description: "Define your investment firm.",
  },
  {
    id: "gallery",
    title: "Gallery",
    description: "Show your trading world.",
  },
  {
    id: "journal",
    title: "Journal",
    description: "Publish insights and updates.",
  },
  {
    id: "research",
    title: "Research",
    description: "Share institutional research.",
  },
  {
    id: "products",
    title: "Products",
    description: "Manage investment products.",
  },
  {
    id: "strategies",
    title: "Strategies",
    description: "Configure strategy products.",
  },
];
