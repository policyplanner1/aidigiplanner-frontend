import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { CONNECT_PROVIDERS, providerForPlatform } from "../../../constants/connectProviders";
import { SOCIAL_PLATFORMS } from "../../../constants/platforms";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import {
  usesManualSocialHandles,
} from "../../../services/social/socialAccountsService";
import { followAuthorizationUrl } from "../../../services/social/socialApiMode";
import { pushNotification } from "../../../store/notificationStore";
import type { SocialAccount } from "../../../types/organization";
import type { ConnectProvider } from "../../../types/social";
import { ConnectProviderDialog } from "../components/ConnectProviderDialog";
import { ManageAccountDialog } from "../components/ManageAccountDialog";
import { SelectAccountsDialog } from "../components/SelectAccountsDialog";
import { WhatsAppConnectDialog } from "../components/WhatsAppConnectDialog";
import {
  useAddManualSocialAccount,
  useConfirmOAuthSession,
  useConnectWhatsApp,
  useDisconnectSocialAccount,
  useOAuthSession,
  useSocialAccounts,
  useStartSocialConnect,
} from "../hooks/useSocialAccounts";

const HANDLE_PLATFORMS = SOCIAL_PLATFORMS.filter(
  (item) => item.id !== "whatsapp" && item.id !== "tiktok" && item.id !== "threads",
);

function platformLabel(platform: string) {
  return SOCIAL_PLATFORMS.find((item) => item.id === platform)?.label ?? platform;
}

function healthChip(account: SocialAccount) {
  if (account.tokenHealth === "needs_reconnect") {
    return { color: "warning" as const, label: "Needs attention" };
  }
  if (account.tokenHealth === "expiring") {
    return { color: "warning" as const, label: "Token expiring" };
  }
  return { color: "success" as const, label: "Connected" };
}

export function SocialAccountsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { organization, currentProject } = useWorkspace();
  const { can } = usePermissions();
  const canConnect = can(PERMISSIONS.SOCIAL_MANAGE);
  const manual = usesManualSocialHandles();

  const [providerOpen, setProviderOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [managing, setManaging] = useState<SocialAccount | null>(null);
  const [banner, setBanner] = useState<string | null>(params.get("message"));
  const [handlePlatform, setHandlePlatform] = useState("instagram");
  const [handle, setHandle] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  const sessionId = params.get("status") === "error" ? null : params.get("sessionId");
  const accountsQuery = useSocialAccounts(currentProject?.id);
  const oauthQuery = useOAuthSession(manual ? null : sessionId);
  const startConnect = useStartSocialConnect();
  const confirmSession = useConfirmOAuthSession(currentProject?.id ?? "");
  const connectWhatsApp = useConnectWhatsApp(currentProject?.id ?? "");
  const disconnect = useDisconnectSocialAccount(currentProject?.id ?? "");
  const addHandle = useAddManualSocialAccount(currentProject?.id ?? "");

  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const accounts = accountsQuery.data ?? [];
  const connected = accounts.filter((item) => item.status === "connected");
  const attention = connected.filter(
    (item) =>
      item.tokenHealth === "needs_reconnect" || item.tokenHealth === "expiring",
  );

  const connectedPlatforms = useMemo(
    () => new Set(connected.map((item) => item.platform)),
    [connected],
  );

  const platformFilterItems = useMemo(
    () => [
      { id: "all", label: "All" },
      ...Array.from(connectedPlatforms).map((platform) => ({ id: platform, label: platformLabel(platform) })),
    ],
    [connectedPlatforms],
  );

  const visibleConnected = useMemo(
    () => (platformFilter === "all" ? connected : connected.filter((item) => item.platform === platformFilter)),
    [connected, platformFilter],
  );

  const availableProviders = CONNECT_PROVIDERS.filter((provider) =>
    provider.platforms.some((platform) => !connectedPlatforms.has(platform)),
  );

  useEffect(() => {
    if (params.get("status") === "error") {
      setBanner(params.get("message") || "The platform did not complete authorization.");
    }
  }, [params]);

  if (!currentProject || !organization) {
    return <NeedProject feature="Accounts" />;
  }

  const beginProvider = async (provider: ConnectProvider) => {
    setProviderOpen(false);
    setBanner(null);

    if (provider === "whatsapp") {
      setWhatsAppOpen(true);
      return;
    }

    try {
      const result = await startConnect.mutateAsync({
        provider,
        projectId: currentProject.id,
        organizationId: organization.id,
      });
      followAuthorizationUrl(result.authorizationUrl, navigate);
    } catch (error) {
      setBanner(
        error instanceof Error
          ? error.message
          : "Could not start the connection. Check that the backend OAuth route is live.",
      );
    }
  };

  const finishSelection = async (accountIds: string[]) => {
    if (!sessionId) return;
    try {
      await confirmSession.mutateAsync({ sessionId, accountIds });
      setParams({});
      setBanner("Accounts connected. Tokens stay encrypted on the backend.");
    } catch (error) {
      setBanner(
        error instanceof Error ? error.message : "Could not save the selected accounts.",
      );
    }
  };

  const reconnect = async (account: SocialAccount) => {
    const provider = providerForPlatform(account.platform);
    setManaging(null);
    if (!provider) {
      setBanner("This platform is not available for reconnect yet.");
      return;
    }
    await beginProvider(provider);
  };

  const removeAccount = async (account: SocialAccount) => {
    try {
      await disconnect.mutateAsync(account.id);
      setManaging(null);
      setBanner("Account removed from this product.");
      pushNotification({
        type: "social_account_disconnected",
        title: "Social account disconnected",
        detail: `${account.platform} · ${account.handle}`,
        path: "/app/social-accounts",
      });
    } catch (error) {
      setBanner(
        error instanceof Error ? error.message : "Could not disconnect this account.",
      );
    }
  };

  const saveHandle = async () => {
    if (!handle.trim()) {
      setBanner("Add a handle like @yourbrand.");
      return;
    }
    try {
      await addHandle.mutateAsync({
        platform: handlePlatform,
        handle: handle.trim(),
        profileUrl: profileUrl.trim() || undefined,
      });
      setManualOpen(false);
      setHandle("");
      setProfileUrl("");
      setBanner("Handle saved. The API records it for generation — OAuth is not supported.");
    } catch (error) {
      setBanner(getApiErrorMessage(error));
    }
  };

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow={`Social · ${connected.length} connected`}
          title="Accounts"
          description={
            manual
              ? `Add a handle and profile URL for ${currentProject.name}. The API does not support social OAuth.`
              : `Connections belong to ${currentProject.name}. React never talks to Meta, Google, or WhatsApp directly.`
          }
          action={
            canConnect ? (
              <Button variant="contained" onClick={() => (manual ? setManualOpen(true) : setProviderOpen(true))}>
                Connect account
              </Button>
            ) : null
          }
        />

        {manual ? (
          <Alert severity="info">
            Save the public handle and URL only. Passwords and OAuth tokens are not collected.
          </Alert>
        ) : null}

        {banner ? <Alert severity="warning">{banner}</Alert> : null}

        {!manual && attention.length > 0 ? (
          <Alert severity="warning">
            {attention.length} connection{attention.length === 1 ? "" : "s"} need
            attention. Reconnect before a scheduled post fails.
          </Alert>
        ) : null}

        {accountsQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(accountsQuery.error)}
          </Alert>
        ) : null}

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 1.25, flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 700 }}>Connected accounts</Typography>
            {connectedPlatforms.size > 1 ? (
              <CapsuleFilter items={platformFilterItems} value={platformFilter} onChange={setPlatformFilter} />
            ) : null}
          </Box>
          {connected.length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  No live connections on this product yet.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {visibleConnected.map((account) => {
                const chip = healthChip(account);
                return (
                  <Card key={account.id}>
                    <CardContent
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          {platformLabel(account.platform)}
                        </Typography>
                        <Typography sx={{ mt: 0.25 }}>
                          {account.handle ?? account.accountName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Product: {currentProject.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Chip size="small" color={chip.color} label={manual ? "Saved" : chip.label} />
                        {canConnect ? (
                          <>
                            {manual ? null : (
                              <Button size="small" onClick={() => setManaging(account)}>
                                Manage
                              </Button>
                            )}
                            <Button size="small" onClick={() => void removeAccount(account)}>
                              Remove
                            </Button>
                          </>
                        ) : null}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>

        {manual ? (
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.25 }}>Available platforms</Typography>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              {HANDLE_PLATFORMS.map((platform) => (
                <Card key={platform.id}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 700 }}>{platform.label}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {platform.description}
                    </Typography>
                    {canConnect ? (
                      <Button
                        sx={{ mt: 1.5 }}
                        variant="contained"
                        onClick={() => {
                          setHandlePlatform(platform.id);
                          setManualOpen(true);
                        }}
                      >
                        Add handle
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ) : availableProviders.length > 0 ? (
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.25 }}>Available to connect</Typography>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              {availableProviders.map((provider) => (
                <Card key={provider.id}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{provider.label}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {provider.description}
                        </Typography>
                      </Box>
                      <Chip size="small" label="Not connected" />
                    </Box>
                    {canConnect ? (
                      <Button
                        sx={{ mt: 1.5 }}
                        variant="contained"
                        onClick={() => void beginProvider(provider.id)}
                      >
                        Connect
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>

      <Dialog open={manualOpen} onClose={() => setManualOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a social handle</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            The backend stores the public handle and URL. There is no OAuth login.
          </Typography>
          <TextField
            select
            label="Platform"
            fullWidth
            margin="normal"
            value={handlePlatform}
            onChange={(event) => setHandlePlatform(event.target.value)}
          >
            {HANDLE_PLATFORMS.map((platform) => (
              <MenuItem key={platform.id} value={platform.id}>
                {platform.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Handle"
            fullWidth
            margin="normal"
            placeholder="@yourbrand"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
          />
          <TextField
            label="Profile URL"
            fullWidth
            margin="normal"
            placeholder="https://www.instagram.com/yourbrand"
            value={profileUrl}
            onChange={(event) => setProfileUrl(event.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setManualOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={addHandle.isPending} onClick={() => void saveHandle()}>
            {addHandle.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConnectProviderDialog
        open={providerOpen}
        onClose={() => setProviderOpen(false)}
        onSelect={(provider) => void beginProvider(provider)}
      />
      <WhatsAppConnectDialog
        open={whatsAppOpen}
        submitting={connectWhatsApp.isPending}
        onClose={() => setWhatsAppOpen(false)}
        onSubmit={(values) => {
          connectWhatsApp.mutate(
            {
              projectId: currentProject.id,
              organizationId: organization.id,
              displayName: values.displayName,
              phoneNumber: values.phoneNumber,
            },
            {
              onSuccess: () => {
                setWhatsAppOpen(false);
                setBanner("WhatsApp Business attached for messaging.");
              },
              onError: (error) => {
                setBanner(
                  error instanceof Error ? error.message : "Could not connect WhatsApp.",
                );
              },
            },
          );
        }}
      />
      <SelectAccountsDialog
        open={!manual && Boolean(sessionId)}
        session={oauthQuery.data}
        loading={oauthQuery.isLoading}
        error={
          oauthQuery.data?.status === "error"
            ? oauthQuery.data.errorMessage ?? "OAuth session expired."
            : oauthQuery.isError
              ? "Could not load authorized accounts from the backend."
              : null
        }
        submitting={confirmSession.isPending}
        onClose={() => setParams({})}
        onConfirm={(ids) => void finishSelection(ids)}
      />
      <ManageAccountDialog
        account={managing}
        projectName={currentProject.name}
        busy={disconnect.isPending || startConnect.isPending}
        onClose={() => setManaging(null)}
        onReconnect={() => {
          if (managing) void reconnect(managing);
        }}
        onDisconnect={() => {
          if (managing) void removeAccount(managing);
        }}
      />
    </ScreenFrame>
  );
}
