import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useOrganizationStore } from "../../../store/organizationStore";
import {
  confirmSocialOAuthSession,
  connectWhatsAppAccount,
  disconnectSocialConnection,
  getSocialOAuthSession,
  listSocialAccounts,
  startSocialConnect,
  addManualSocialAccount,
} from "../../../services/social/socialAccountsService";
import type { ConnectProvider, WhatsAppConnectRequest } from "../../../types/social";
import { oauthReturnUrl } from "../../../services/social/socialApiMode";

export function socialAccountsKey(projectId: string) {
  return ["social-accounts", projectId] as const;
}

export function useSocialAccounts(projectId: string | undefined) {
  const revision = useOrganizationStore((state) => state.revision);

  return useQuery({
    queryKey: [...socialAccountsKey(projectId ?? ""), revision],
    queryFn: () => listSocialAccounts(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useStartSocialConnect() {
  return useMutation({
    mutationFn: (input: {
      provider: Exclude<ConnectProvider, "whatsapp">;
      projectId: string;
      organizationId: string;
    }) =>
      startSocialConnect(input.provider, {
        projectId: input.projectId,
        organizationId: input.organizationId,
        returnUrl: oauthReturnUrl(),
      }),
  });
}

export function useOAuthSession(sessionId: string | null) {
  return useQuery({
    queryKey: ["social-oauth-session", sessionId],
    queryFn: () => getSocialOAuthSession(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

export function useConfirmOAuthSession(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { sessionId: string; accountIds: string[] }) =>
      confirmSocialOAuthSession(input.sessionId, input.accountIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialAccountsKey(projectId) });
    },
  });
}

export function useConnectWhatsApp(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: WhatsAppConnectRequest) => connectWhatsAppAccount(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialAccountsKey(projectId) });
    },
  });
}

export function useDisconnectSocialAccount(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => disconnectSocialConnection(accountId, projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialAccountsKey(projectId) });
    },
  });
}

export function useAddManualSocialAccount(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { platform: string; handle: string; profileUrl?: string }) =>
      addManualSocialAccount({ projectId, ...input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: socialAccountsKey(projectId) });
    },
  });
}
