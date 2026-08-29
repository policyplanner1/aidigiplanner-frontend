import { Alert, Box, Button, Link, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { getApiErrorMessage } from "../../../services/api/errors";
import { authApi } from "../../../services/auth/authApi";

export function CheckEmailPage() {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<"success" | "error">("success");

  const resend = async () => {
    if (!email) return;
    setBusy(true);
    setMessage(null);
    try {
      await authApi.resendVerification(email);
      setSeverity("success");
      setMessage("Verification email sent.");
    } catch (error) {
      setSeverity("error");
      setMessage(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Check your email
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>
        Your company is registered. Confirm{" "}
        {email || "your inbox"} before signing in. A Super Admin still has to
        approve the company after that.
      </Typography>
      {message ? (
        <Alert severity={severity} sx={{ mb: 2 }}>
          {message}
        </Alert>
      ) : null}
      {email ? (
        <Button
          variant="outlined"
          fullWidth
          disabled={busy}
          onClick={() => void resend()}
        >
          {busy ? "Sending..." : "Resend verification email"}
        </Button>
      ) : null}
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Already verified?{" "}
        <Link component={RouterLink} to="/login">
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}
