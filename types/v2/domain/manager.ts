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

  createdAt: number;
  updatedAt: number;
}
