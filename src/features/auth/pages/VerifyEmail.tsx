import { Alert, Box, Button, Link, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { useAuth } from "../../../hooks/useAuth";
import { AuthFlowError, getApiErrorMessage } from "../../../services/api/errors";
import { authApi } from "../../../services/auth/authApi";
import { postAuthPath } from "../../../services/auth/mapSession";
import { clearSignupCache, readSignupCache } from "../../onboarding/signupCache";
import { OtpBoxes } from "../components/OtpBoxes";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const cached = readSignupCache();
  const email = (params.get("email") || cached?.email || "").trim().toLowerCase();
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const verifying = useRef(false);
  const { login } = useAuth();

  const verify = async (code = otp) => {
    if (code.length !== 6 || verifying.current) {
      if (code.length !== 6) setError("Enter the 6-digit code.");
      return;
    }
    verifying.current = true;
    setBusy(true);
    setError(null);
    try {
      await authApi.verifyEmail({ email, otp: code });
      const password = cached?.password;
      if (password) {
        try {
          const session = await login(email, password);
          clearSignupCache();
          navigate(postAuthPath(session), { replace: true });
          return;
        } catch (loginError) {
          if (loginError instanceof AuthFlowError && loginError.code === "email_not_verified") {
            setError(loginError.message);
            return;
          }
          clearSignupCache();
          navigate("/pending", { replace: true, state: { email } });
          return;
        }
      }
      navigate("/login", { replace: true, state: { email } });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      verifying.current = false;
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await authApi.resendVerification(email);
      setInfo("A new code was sent.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Account verification</Typography>
      <Typography variant="h5" sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>
        Verify your email
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.75, mb: 3 }}>
        Enter the code sent to {email || "your inbox"}.
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {info ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {info}
        </Alert>
      ) : null}

      <OtpBoxes
        value={otp}
        disabled={busy}
        onChange={(value) => {
          setOtp(value);
          if (value.length === 6) void verify(value);
        }}
      />

      <Button
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 3, borderRadius: "999px", py: 1.15 }}
        disabled={busy || otp.length !== 6}
        onClick={() => void verify()}
      >
        {busy ? "Verifying..." : "Verify and Continue"}
      </Button>

      <Button fullWidth sx={{ mt: 1.25 }} disabled={busy || !email} onClick={() => void resend()}>
        Resend Code
      </Button>

      <Typography sx={{ mt: 2 }} color="text.secondary">
        Wrong email?{" "}
        <Link component={RouterLink} to="/signup">
          Create account
        </Link>
      </Typography>
    </Box>
  );
}
