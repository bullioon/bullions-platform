export interface Manager {
  uid: string;

  status: "DRAFT" | "REVIEW" | "VERIFIED" | "LIVE";

  identity: {
    username: string;
    displayName: string;
    tagline: string;
    biography: string;

    avatarUrl: string;
    bannerUrl: string;
  };

  brand: {
    companyName?: string;
    location?: string;
    foundedYear?: number;
    website?: string;
  };

  reputation: {
    verified: boolean;
    allocatorScore: number;
  };

  social?: {
    gallery?: Array<{
      id: string;
      url: string;
      title?: string;
      category?:
        | "desk"
        | "research"
        | "process"
        | "markets"
        | "event"
        | "lifestyle";
      createdAt?: number;
    }>;

    research?: Array<{
      id: string;
      title: string;
      summary?: string;
      url?: string;
      publishedAt: number;
    }>;

    journal?: Array<{
      id: string;
      body: string;
      publishedAt: number;
    }>;

    links?: {
      x?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
      discord?: string;
    };
  };

  createdAt: number;
  updatedAt: number;
}
