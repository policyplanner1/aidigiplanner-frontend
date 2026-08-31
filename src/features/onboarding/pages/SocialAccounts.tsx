import { Alert, Box, Button, CircularProgress, FormControlLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import { useLatestOnboardingProduct } from "../useLatestOnboardingProduct";
import { SOCIALS } from "../onboardingConstants";
import { StepHeading } from "../onboardingShared";

type ConnectedAccount = { id?: string; handle: string };

export function OnboardingSocialAccountsPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";
  const { product, isLoading } = useLatestOnboardingProduct(companyId);

  const [connected, setConnected] = useState<Record<string, ConnectedAccount>>({});
  const [connectFor, setConnectFor] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [scope, setScope] = useState<"product" | "sub_products" | "company">("product");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectAccount = async () => {
    if (!connectFor || !handle.trim() || !product) {
      setError("Add a handle to connect.");
      return;
    }
    const platform = SOCIALS.find((item) => item.id === connectFor);
    if (!platform) return;

    setBusy(true);
    setError(null);
    try {
      const { data } = await onboardingApi.addSocialAccount(product.id, {
        platform: platform.api,
        handle: handle.trim(),
        profile_url: profileUrl.trim() || undefined,
        scope,
      });
      const accountId = data && typeof data === "object" ? (data as { id?: string }).id : undefined;
      setConnected((current) => ({ ...current, [connectFor]: { id: accountId, handle: handle.trim() } }));
      setConnectFor(null);
      setHandle("");
      setProfileUrl("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async (platformId: string) => {
    const account = connected[platformId];
    if (!account || !product) return;
    setBusy(true);
    setError(null);
    try {
      if (account.id) await onboardingApi.deleteSocialAccount(product.id, account.id);
      setConnected((current) => {
        const next = { ...current };
        delete next[platformId];
        return next;
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      <StepHeading eyebrow="Company setup" title={`Connect social accounts for ${product?.name ?? "your product"}`} />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        {SOCIALS.map((item) => {
          const account = connected[item.id];
          return (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                p: 1.25,
                borderRadius: "14px",
                border: `1px solid ${SURFACE.border}`,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
                {account ? (
                  <Typography noWrap sx={{ ...TYPE.body, color: "#1F8A80", fontSize: 13 }}>
                    Connected · {account.handle}
                  </Typography>
                ) : (
                  <Typography sx={{ ...TYPE.body, color: "text.secondary", fontSize: 13 }}>Not connected</Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                {account ? (
                  <>
                    <Button size="small" onClick={() => setConnectFor(item.id)}>Reconnect</Button>
                    <Button size="small" color="error" disabled={busy} onClick={() => void disconnect(item.id)}>
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button size="small" variant="contained" onClick={() => setConnectFor(item.id)}>
                    Connect
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {connectFor ? (
        <Box sx={{ display: "grid", gap: 1.25, p: 1.5, mt: 1.5, borderRadius: "14px", backgroundColor: SURFACE.well }}>
          <Typography sx={{ fontWeight: 700 }}>
            Connect {SOCIALS.find((item) => item.id === connectFor)?.label}
          </Typography>
          <TextField label="Handle" fullWidth placeholder="@yourbrand" value={handle} onChange={(event) => setHandle(event.target.value)} />
          <TextField
            label="Profile URL"
            fullWidth
            placeholder="https://www.instagram.com/yourbrand"
            value={profileUrl}
            onChange={(event) => setProfileUrl(event.target.value)}
          />
          <Typography sx={{ ...TYPE.label }}>This account belongs to</Typography>
          <RadioGroup value={scope} onChange={(event) => setScope(event.target.value as typeof scope)}>
            <FormControlLabel value="product" control={<Radio />} label={product?.name ?? "This product"} />
            <FormControlLabel value="sub_products" control={<Radio />} label="Selected sub-products" />
            <FormControlLabel value="company" control={<Radio />} label="Entire company" />
          </RadioGroup>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={() => setConnectFor(null)}>Cancel</Button>
            <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void connectAccount()}>
              Save
            </Button>
          </Box>
        </Box>
      ) : null}

      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button onClick={() => navigate("/onboarding/team")}>Skip for Now</Button>
        <Button variant="contained" sx={{ borderRadius: "999px" }} onClick={() => navigate("/onboarding/team")}>
          Continue
        </Button>
      </Box>
    </Box>
  );
}
