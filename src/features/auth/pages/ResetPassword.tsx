import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { getApiErrorMessage } from "../../../services/api/errors";
import { authApi } from "../../../services/auth/authApi";
import { resetPasswordSchema, type ResetPasswordValues } from "../schemas/authSchemas";
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter";

type ResetPasswordState = {
  email?: string;
  otp?: string;
  resetToken?: string | null;
  from?: string;
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ResetPasswordState | null) ?? {};
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const signInPath = state.from === "/admin/login" ? "/admin/login" : "/login";

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Arriving here without having verified an OTP means there's nothing to reset —
  // send the user back to start the recovery flow properly.
  if (!state.email || !state.otp) {
    return <Navigate to="/forgot-password" replace />;
  }

  const savePassword = async (values: ResetPasswordValues) => {
    setBusy(true);
    setError(null);
    try {
      await authApi.resetPassword({
        email: state.email as string,
        otp: state.otp as string,
        new_password: values.password,
        reset_token: state.resetToken,
      });
      setDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Box>
        <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Account recovery</Typography>
        <Typography sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>Password updated</Typography>
        <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.75, mb: 2.5 }}>
          You can sign in with your new password.
        </Typography>
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
    );
  }

  return (
    <Box>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Account recovery</Typography>
      <Typography sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>Set a new password</Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.75, mb: 2.5 }}>
        Choose a new password for this account.
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Box component="form" onSubmit={handleSubmit(savePassword)} noValidate>
        <TextField
          label="New password"
          type="password"
          fullWidth
          autoComplete="new-password"
          margin="normal"
          placeholder="At least 10 characters"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter password={watch("password")} />
        <TextField
          label="Confirm password"
          type="password"
          fullWidth
          autoComplete="new-password"
          margin="normal"
          placeholder="Re-enter your password"
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          {...register("confirmPassword")}
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
    </Box>
  );
}
