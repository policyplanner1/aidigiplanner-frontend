import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import { TYPE } from "../../../constants/fonts";
import { AuthFlowError, getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import { authApi } from "../../../services/auth/authApi";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
} from "../../../services/auth/mockAuth";
import { postAuthPath } from "../../../services/auth/mapSession";
import {
  loginSchema,
  type LoginFormValues,
} from "../schemas/authSchemas";

type LoginFormProps = {
  expectedRole?: "SUPER_ADMIN" | "ORGANIZATION";
};

export function LoginForm({ expectedRole = "ORGANIZATION" }: LoginFormProps) {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    setUnverifiedEmail(null);
    setResendMessage(null);

    try {
      const session = await login(values.email, values.password);

      if (expectedRole === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
        logout();
        setSubmitError("Use the organization login for this account.");
        return;
      }

      if (expectedRole === "ORGANIZATION" && session.user.role === "SUPER_ADMIN") {
        logout();
        setSubmitError("Use the Super Admin portal at /admin/login.");
        return;
      }

      navigate(postAuthPath(session), { replace: true });
    } catch (error) {
      if (error instanceof AuthFlowError && error.code === "email_not_verified") {
        setUnverifiedEmail(values.email);
      }
      setSubmitError(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    }
  };

  const demoAccounts =
    expectedRole === "SUPER_ADMIN"
      ? DEMO_ACCOUNTS.filter((account) => account.user.role === "SUPER_ADMIN")
      : DEMO_ACCOUNTS.filter((account) => account.user.role !== "SUPER_ADMIN");

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>
        {expectedRole === "SUPER_ADMIN" ? "Platform" : "Organization"}
      </Typography>
      <Typography variant="h5" sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>
        {expectedRole === "SUPER_ADMIN" ? "Super Admin login" : "Sign in"}
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.75, mb: 3 }}>
        {expectedRole === "SUPER_ADMIN"
          ? "This portal is only for platform administrators."
          : "Access your organization workspace."}
      </Typography>

      {submitError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      ) : null}

      {unverifiedEmail ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Confirm {unverifiedEmail} before signing in.
          </Typography>
          <Button
            size="small"
            sx={{ mt: 1 }}
            disabled={resending}
            onClick={async () => {
              setResending(true);
              setResendMessage(null);
              try {
                await authApi.resendVerification(unverifiedEmail);
                setResendMessage("Verification email sent.");
              } catch (error) {
                setResendMessage(getApiErrorMessage(error));
              } finally {
                setResending(false);
              }
            }}
          >
            {resending ? "Sending..." : "Resend verification email"}
          </Button>
          {resendMessage ? (
            <Typography variant="body2" sx={{ mt: 0.75 }}>
              {resendMessage}
            </Typography>
          ) : null}
        </Alert>
      ) : null}

      <TextField
        label="Email"
        fullWidth
        autoComplete="email"
        margin="normal"
        placeholder="you@example.com"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register("email")}
      />

      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        autoComplete="current-password"
        margin="normal"
        placeholder="At least 10 characters"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register("password")}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
          <Link
          component="button"
          type="button"
          underline="none"
          onClick={() =>
            navigate("/forgot-password", {
              state: {
                email: watch("email"),
                from: expectedRole === "SUPER_ADMIN" ? "/admin/login" : "/login",
              },
            })
          }
          sx={{
            fontWeight: 600,
            fontSize: 13,
            textDecoration: "none",
            "&:hover": { textDecoration: "none" },
          }}
        >
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 2.5, borderRadius: "999px", py: 1.15 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      {expectedRole === "ORGANIZATION" ? (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          New company?{" "}
          <Link component={RouterLink} to="/register" underline="none">
            Create an account
          </Link>
        </Typography>
      ) : null}

      {!isLiveAuth() ? (
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Demo accounts
        </Typography>
        {demoAccounts.map((account) => (
          <Typography key={account.user.id} variant="body2">
            {account.user.email} / {DEMO_PASSWORD}
          </Typography>
        ))}
      </Alert>
      ) : null}
    </Box>
  );
}
