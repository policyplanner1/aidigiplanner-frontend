import { Alert, Box, Button, Typography } from "@mui/material";
import { useState } from "react";

import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import { authApi } from "../../../services/auth/authApi";

export function PendingApprovalPage() {
  const { session, user, logout, companyStatus } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const status = companyStatus ?? "pending_approval";

  const title =
    status === "rejected"
      ? "Registration was not approved"
      : status === "suspended"
        ? "Company is suspended"
        : "Waiting for company approval";

  const body =
    status === "rejected"
      ? "A platform administrator declined this company. You can sign out and register again if that was a mistake."
      : status === "suspended"
        ? "This company is suspended. Contact the platform administrator."
        : "Your email is verified. A Super Admin must approve the company before you can finish setup and open the workspace.";

  const resend = async () => {
    if (!user?.email) return;
    setBusy(true);
    setMessage(null);
    try {
      await authApi.resendVerification(user.email);
      setMessage("Verification email sent.");
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "6px",
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="overline" color="text.secondary">
          {session?.organizationName ?? "Company"}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5 }}>
          {body}
        </Typography>
        {user && !session?.emailVerified && isLiveAuth() ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Confirm {user.email} if you received a verification link.
          </Alert>
        ) : null}
        {message ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {message}
          </Alert>
        ) : null}
        <Box sx={{ display: "flex", gap: 1, mt: 3, flexWrap: "wrap" }}>
          {user && !session?.emailVerified ? (
            <Button onClick={() => void resend()} disabled={busy}>
              Resend verification
            </Button>
          ) : null}
          <Button variant="contained" onClick={logout}>
            Sign out
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
