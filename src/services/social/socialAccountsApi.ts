import { apiClient } from "../api/client";
import type { SocialAccount } from "../../types/organization";
import type {
  ConfirmAccountsResponse,
  ConnectProvider,
  OAuthSession,
  StartConnectRequest,
  StartConnectResponse,
  WhatsAppConnectRequest,
} from "../../types/social";

export const socialAccountsApi = {
  async list(projectId: string): Promise<SocialAccount[]> {
    const { data } = await apiClient.get<{ accounts: SocialAccount[] }>(
      "/social/accounts",
      { params: { projectId } },
    );
    return data.accounts;
  },

  async startConnect(
    provider: Exclude<ConnectProvider, "whatsapp">,
    body: StartConnectRequest,
  ): Promise<StartConnectResponse> {
    const path =
      provider === "meta" ? "/social/connect/meta" : "/social/connect/google";
    const { data } = await apiClient.post<StartConnectResponse>(path, {
      ...body,
      purpose: provider === "youtube" ? "youtube" : provider === "google_business" ? "google_business" : undefined,
    });
    return data;
  },

  async getOAuthSession(sessionId: string): Promise<OAuthSession> {
    const { data } = await apiClient.get<OAuthSession>(
      `/social/oauth/sessions/${sessionId}`,
    );
    return data;
  },

  async confirmOAuthSession(
    sessionId: string,
    accountIds: string[],
  ): Promise<SocialAccount[]> {
    const { data } = await apiClient.post<ConfirmAccountsResponse>(
      `/social/oauth/sessions/${sessionId}/confirm`,
      { accountIds },
    );
    return data.accounts;
  },

  async connectWhatsApp(body: WhatsAppConnectRequest): Promise<SocialAccount> {
    const { data } = await apiClient.post<SocialAccount>(
      "/social/connect/whatsapp",
      body,
    );
    return data;
  },

  async disconnect(accountId: string): Promise<void> {
    await apiClient.post(`/social/accounts/${accountId}/disconnect`);
  },
};
