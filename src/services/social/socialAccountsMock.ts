import { OAUTH_RETURN_PATH } from "../../constants/connectProviders";
import type { SocialAccount } from "../../types/organization";
import type {
  ConnectProvider,
  OAuthSession,
  PendingSocialAccount,
  StartConnectRequest,
  StartConnectResponse,
  WhatsAppConnectRequest,
} from "../../types/social";
import {
  connectSocialAccount,
  disconnectSocialAccount,
  getProjectById,
  getSocialAccounts,
} from "../projects/projectService";

const SESSION_KEY = "ai-growth-oauth-session";

type StoredSession = {
  id: string;
  provider: Exclude<ConnectProvider, "whatsapp">;
  projectId: string;
  organizationId: string;
  projectName: string;
};

function slugHandle(name: string): string {
  return `@${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 18) || "brand"}`;
}

function buildPendingAccounts(
  provider: Exclude<ConnectProvider, "whatsapp">,
  projectName: string,
): PendingSocialAccount[] {
  if (provider === "meta") {
    return [
      {
        id: "pend_fb",
        platform: "facebook",
        accountName: `${projectName}`,
        handle: projectName,
        platformAccountId: "page_demo_1",
      },
      {
        id: "pend_ig",
        platform: "instagram",
        accountName: projectName,
        handle: slugHandle(projectName),
        platformAccountId: "ig_demo_1",
      },
    ];
  }

  if (provider === "youtube") {
    return [
      {
        id: "pend_yt",
        platform: "youtube",
        accountName: `${projectName} Channel`,
        handle: projectName,
        platformAccountId: "yt_demo_1",
        subscribers: 24500,
      },
    ];
  }

  return [
    {
      id: "pend_gbp",
      platform: "google_business",
      accountName: `${projectName} — Pune`,
      handle: projectName,
      platformAccountId: "gbp_demo_1",
      location: "Pune",
    },
  ];
}

function readSession(sessionId: string): StoredSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed.id === sessionId ? parsed : null;
  } catch {
    return null;
  }
}

export const socialAccountsMock = {
  list(projectId: string): SocialAccount[] {
    return getSocialAccounts(projectId);
  },

  startConnect(
    provider: Exclude<ConnectProvider, "whatsapp">,
    body: StartConnectRequest,
  ): StartConnectResponse {
    const project = getProjectById(body.projectId);
    const session: StoredSession = {
      id: `oauth_${provider}_${crypto.randomUUID()}`,
      provider,
      projectId: body.projectId,
      organizationId: body.organizationId,
      projectName: project?.name ?? "Brand",
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    const params = new URLSearchParams({
      provider,
      status: "success",
      sessionId: session.id,
      demo: "1",
    });

    return {
      authorizationUrl: `${OAUTH_RETURN_PATH}?${params.toString()}`,
    };
  },

  getOAuthSession(sessionId: string): OAuthSession {
    const stored = readSession(sessionId);
    if (!stored) {
      return {
        id: sessionId,
        provider: "meta",
        projectId: "",
        status: "error",
        accounts: [],
        errorMessage: "OAuth session expired. Start Connect again.",
      };
    }

    return {
      id: stored.id,
      provider: stored.provider,
      projectId: stored.projectId,
      status: "pending_selection",
      accounts: buildPendingAccounts(stored.provider, stored.projectName),
    };
  },

  confirmOAuthSession(sessionId: string, accountIds: string[]): SocialAccount[] {
    const stored = readSession(sessionId);
    if (!stored) return [];

    const pending = buildPendingAccounts(stored.provider, stored.projectName);
    const selected = pending.filter((item) => accountIds.includes(item.id));

    const connected = selected.map((item) =>
      connectSocialAccount({
        projectId: stored.projectId,
        organizationId: stored.organizationId,
        platform: item.platform,
        accountName: item.accountName,
        handle: item.handle,
        platformAccountId: item.platformAccountId,
        metrics: {
          subscribers: item.subscribers,
          location: item.location,
          phoneNumber: item.phoneNumber,
        },
      }),
    );

    sessionStorage.removeItem(SESSION_KEY);
    return connected;
  },

  connectWhatsApp(body: WhatsAppConnectRequest): SocialAccount {
    return connectSocialAccount({
      projectId: body.projectId,
      organizationId: body.organizationId,
      platform: "whatsapp",
      accountName: body.displayName,
      handle: body.phoneNumber,
      platformAccountId: body.phoneNumber.replace(/\s+/g, ""),
      purpose: "messaging",
      metrics: { phoneNumber: body.phoneNumber },
    });
  },

  disconnect(accountId: string) {
    disconnectSocialAccount(accountId);
  },
};
