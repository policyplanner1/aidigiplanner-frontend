import type {
  SocialAccount,
  SocialPlatform,
} from "./organization";

export type ConnectProvider = "meta" | "youtube" | "google_business" | "whatsapp";

export type StartConnectRequest = {
  projectId: string;
  organizationId: string;
  returnUrl: string;
};

export type StartConnectResponse = {
  authorizationUrl: string;
};

export type PendingSocialAccount = {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  handle?: string;
  platformAccountId: string;
  subscribers?: number;
  location?: string;
  phoneNumber?: string;
};

export type OAuthSession = {
  id: string;
  provider: ConnectProvider;
  projectId: string;
  status: "pending_selection" | "completed" | "error";
  accounts: PendingSocialAccount[];
  errorMessage?: string;
};

export type ConfirmAccountsRequest = {
  accountIds: string[];
};

export type ConfirmAccountsResponse = {
  accounts: SocialAccount[];
};

export type WhatsAppConnectRequest = {
  projectId: string;
  organizationId: string;
  displayName: string;
  phoneNumber: string;
};

export type SocialAccountsListResponse = {
  accounts: SocialAccount[];
};
