import type { ApiSocialAccountPublic } from "../../types/onboarding";
import type { SocialAccount, SocialPlatform } from "../../types/organization";
import type {
  ConnectProvider,
  OAuthSession,
  StartConnectRequest,
  WhatsAppConnectRequest,
} from "../../types/social";
import { isLiveAuth } from "../api/errors";
import { onboardingApi } from "../onboarding/onboardingApi";
import { socialAccountsApi } from "./socialAccountsApi";
import { socialAccountsMock } from "./socialAccountsMock";
import { isLiveSocialApi } from "./socialApiMode";

export { isLiveSocialApi, oauthReturnUrl } from "./socialApiMode";

export function usesManualSocialHandles() {
  return isLiveAuth() && !isLiveSocialApi();
}

export function toSocialApiPlatform(platform: string) {
  if (platform === "google_business") return "google";
  if (platform === "x" || platform === "twitter") return "twitter";
  return platform;
}

export function fromSocialApiPlatform(platform: string): SocialPlatform {
  if (platform === "google") return "google_business";
  if (platform === "twitter") return "x";
  return platform as SocialPlatform;
}

function unwrapAccounts(data: ApiSocialAccountPublic[] | { items?: ApiSocialAccountPublic[] } | unknown) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { items?: ApiSocialAccountPublic[] }).items)) {
    return (data as { items: ApiSocialAccountPublic[] }).items;
  }
  return [];
}

export function mapProductSocialAccount(row: ApiSocialAccountPublic, projectId: string): SocialAccount {
  return {
    id: row.id,
    projectId: row.product_id || row.project_id || projectId,
    organizationId: "",
    platform: fromSocialApiPlatform(row.platform),
    accountName: row.handle,
    handle: row.handle,
    status: row.status === "disabled" ? "disconnected" : "connected",
    tokenHealth: "valid",
    purpose: "publishing",
  };
}

export async function listSocialAccounts(projectId: string): Promise<SocialAccount[]> {
  if (usesManualSocialHandles()) {
    const { data } = await onboardingApi.listSocialAccounts(projectId);
    return unwrapAccounts(data).map((row) => mapProductSocialAccount(row, projectId));
  }
  if (isLiveSocialApi()) {
    return socialAccountsApi.list(projectId);
  }
  return socialAccountsMock.list(projectId);
}

export async function addManualSocialAccount(input: {
  projectId: string;
  platform: string;
  handle: string;
  profileUrl?: string;
  scope?: "product" | "sub_products" | "company";
}) {
  await onboardingApi.addSocialAccount(input.projectId, {
    platform: toSocialApiPlatform(input.platform),
    handle: input.handle,
    profile_url: input.profileUrl || undefined,
    scope: input.scope ?? "product",
  });
}

export async function startSocialConnect(
  provider: Exclude<ConnectProvider, "whatsapp">,
  body: StartConnectRequest,
) {
  if (isLiveSocialApi()) {
    return socialAccountsApi.startConnect(provider, body);
  }
  return socialAccountsMock.startConnect(provider, body);
}

export async function getSocialOAuthSession(sessionId: string): Promise<OAuthSession> {
  if (isLiveSocialApi()) {
    return socialAccountsApi.getOAuthSession(sessionId);
  }
  return socialAccountsMock.getOAuthSession(sessionId);
}

export async function confirmSocialOAuthSession(
  sessionId: string,
  accountIds: string[],
): Promise<SocialAccount[]> {
  if (isLiveSocialApi()) {
    return socialAccountsApi.confirmOAuthSession(sessionId, accountIds);
  }
  return socialAccountsMock.confirmOAuthSession(sessionId, accountIds);
}

export async function connectWhatsAppAccount(body: WhatsAppConnectRequest) {
  if (isLiveSocialApi()) {
    return socialAccountsApi.connectWhatsApp(body);
  }
  return socialAccountsMock.connectWhatsApp(body);
}

export async function disconnectSocialConnection(accountId: string, projectId?: string) {
  if (usesManualSocialHandles()) {
    if (!projectId) throw new Error("A product is required to remove this account.");
    await onboardingApi.deleteSocialAccount(projectId, accountId);
    return;
  }
  if (isLiveSocialApi()) {
    await socialAccountsApi.disconnect(accountId);
    return;
  }
  socialAccountsMock.disconnect(accountId);
}
