import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Link, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import { authApi } from "../../../services/auth/authApi";
import {
  forgotEmailSchema,
  resetPasswordSchema,
  type ForgotEmailValues,
  type ResetPasswordValues,
} from "../schemas/authSchemas";
import { OtpBoxes } from "../components/OtpBoxes";

type Step = "email" | "otp" | "password" | "done";

const steps: Step[] = ["email", "otp", "password"];

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { email?: string; from?: string } | null;
  const seededEmail =
    typeof locationState?.email === "string" ? locationState.email : "";
  const signInPath = locationState?.from === "/admin/login" ? "/admin/login" : "/login";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(seededEmail);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  const emailForm = useForm<ForgotEmailValues>({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: seededEmail },
  });

  const passwordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const sendOtp = async (values: ForgotEmailValues) => {
    setBusy(true);
    setError(null);
    try {
      await authApi.forgotPassword(values.email);
      setEmail(values.email.trim().toLowerCase());
      setOtp("");
      setStep("otp");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (code = otp) => {
    if (code.length !== 6 || verifyingRef.current) {
      if (code.length !== 6) setError("Enter the 6-digit code.");
      return;
    }
    verifyingRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await authApi.verifyResetOtp({ email, otp: code });
      setResetToken(result.resetToken);
      setStep("password");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      verifyingRef.current = false;
      setBusy(false);
    }
  };

  const savePassword = async (values: ResetPasswordValues) => {
    setBusy(true);
    setError(null);
    try {
      await authApi.resetPassword({
        email,
        otp,
        new_password: values.password,
        reset_token: resetToken,
      });
      setStep("done");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const stepIndex = steps.indexOf(step === "done" ? "password" : step);

  return (
    <Box>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Account recovery</Typography>
      <Typography sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>
        {step === "email"
          ? "Forgot password"
          : step === "otp"
            ? "Enter OTP"
            : step === "password"
              ? "Set a new password"
              : "Password updated"}
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.75, mb: 2.5 }}>
        {step === "email"
          ? "We’ll send a 6-digit code to your email."
          : step === "otp"
            ? `Type the code sent to ${email}.`
            : step === "password"
              ? "Choose a new password for this account."
              : "You can sign in with your new password."}
      </Typography>

      {step !== "done" ? (
        <Box sx={{ display: "flex", gap: 0.75, mb: 2.5 }}>
          {steps.map((item, index) => (
            <Box
              key={item}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: "999px",
                backgroundColor: index <= stepIndex ? "#1F8A80" : "rgba(232,221,210,0.9)",
                transition: "background-color 0.25s ease",
              }}
            />
          ))}
        </Box>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box
        key={step}
        sx={{
          animation: "authSlide 0.35s ease",
          "@keyframes authSlide": {
            from: { opacity: 0, transform: "translateX(18px)" },
            to: { opacity: 1, transform: "translateX(0)" },
          },
        }}
      >
        {step === "email" ? (
          <Box component="form" onSubmit={emailForm.handleSubmit(sendOtp)} noValidate>
            <TextField
              label="Email"
              fullWidth
              autoComplete="email"
              margin="normal"
              placeholder="you@example.com"
              error={Boolean(emailForm.formState.errors.email)}
              helperText={emailForm.formState.errors.email?.message}
              {...emailForm.register("email")}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={busy}
              sx={{ mt: 2.5, borderRadius: "999px", py: 1.15 }}
            >
              {busy ? "Sending code..." : "Send OTP"}
            </Button>
          </Box>
        ) : null}

        {step === "otp" ? (
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              void verifyOtp();
            }}
          >
            <OtpBoxes
              value={otp}
              disabled={busy}
              onChange={(value) => {
                setOtp(value);
                setError(null);
                if (value.length === 6) void verifyOtp(value);
              }}
            />
            {!isLiveAuth() ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
                Demo code is 123456 while live auth is off.
              </Typography>
            ) : null}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={busy || otp.length !== 6}
              sx={{ mt: 2.5, borderRadius: "999px", py: 1.15 }}
            >
              {busy ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              type="button"
              fullWidth
              disabled={busy}
              onClick={() => void sendOtp({ email })}
              sx={{ mt: 1 }}
            >
              Resend code
            </Button>
          </Box>
        ) : null}

        {step === "password" ? (
          <Box component="form" onSubmit={passwordForm.handleSubmit(savePassword)} noValidate>
            <TextField
              label="New password"
              type="password"
              fullWidth
              autoComplete="new-password"
              margin="normal"
              placeholder="At least 10 characters"
              error={Boolean(passwordForm.formState.errors.password)}
              helperText={passwordForm.formState.errors.password?.message}
              {...passwordForm.register("password")}
            />
            <TextField
              label="Confirm password"
              type="password"
              fullWidth
              autoComplete="new-password"
              margin="normal"
              placeholder="Re-enter your password"
              error={Boolean(passwordForm.formState.errors.confirmPassword)}
              helperText={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register("confirmPassword")}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={busy}
              sx={{ mt: 2.5, borderRadius: "999px", py: 1.15 }}
            >
              {busy ? "Saving..." : "Save password"}
            </Button>
          </Box>
        ) : null}

        {step === "done" ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your password was reset. Sign in with the new one.
            </Alert>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate(signInPath, { replace: true })}
              sx={{ borderRadius: "999px", py: 1.15 }}
            >
              Back to sign in
            </Button>
          </Box>
        ) : null}
      </Box>

      {step !== "done" ? (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Remembered it?{" "}
          <Link component={RouterLink} to={signInPath}>
            Sign in
          </Link>
        </Typography>
      ) : null}
    </Box>
  );
}
