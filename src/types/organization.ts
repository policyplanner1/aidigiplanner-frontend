export type OrganizationStatus = "active" | "suspended";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: OrganizationStatus;
};

export type BrandStatus = "active" | "inactive";

export type ProjectModules = {
  social: boolean;
  marketing: boolean;
  leads: boolean;
  crm: boolean;
};

export type Brand = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  industry: string;
  status: BrandStatus;
  modules: ProjectModules;
};

export type Project = Brand;

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "linkedin"
  | "google_business"
  | "whatsapp"
  | "tiktok"
  | "x"
  | "threads";

export type SocialAccountStatus = "connected" | "disconnected";

export type TokenHealth = "valid" | "expiring" | "needs_reconnect";

export type SocialAccountPurpose = "publishing" | "messaging";

export type SocialAccountMetrics = {
  subscribers?: number;
  location?: string;
  phoneNumber?: string;
};

export type SocialAccount = {
  id: string;
  projectId: string;
  organizationId: string;
  platform: SocialPlatform;
  accountName: string;
  status: SocialAccountStatus;
  platformAccountId?: string;
  handle?: string;
  tokenHealth?: TokenHealth;
  purpose?: SocialAccountPurpose;
  metrics?: SocialAccountMetrics;
};
