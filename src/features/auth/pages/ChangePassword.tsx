import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { TYPE } from "../../../constants/fonts";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { authApi } from "../../../services/auth/authApi";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "../schemas/authSchemas";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "password", label: "Change password" },
] as const;

type SettingsTab = (typeof tabs)[number]["id"];

export function ChangePasswordPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab: SettingsTab = params.get("tab") === "password" ? "password" : "profile";

  return (
    <ScreenFrame>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your profile and sign-in password for this workspace."
      />
      <CapsuleFilter
        items={tabs}
        value={tab}
        onChange={(id) => {
          setParams(id === "password" ? { tab: "password" } : {}, { replace: true });
        }}
      />
      <Box sx={{ mt: 2.5 }}>
        {tab === "profile" ? (
          <Box sx={{ ...GLASS_SX, p: { xs: 2.5, md: 3 }, borderRadius: 1, maxWidth: 480 }}>
            <Typography sx={{ ...TYPE.label, mb: 2 }}>Profile</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Name</Typography>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{user?.name ?? "—"}</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Email</Typography>
            <Typography sx={{ fontWeight: 700 }}>{user?.email ?? "—"}</Typography>
          </Box>
        ) : (
          <ChangePasswordForm />
        )}
      </Box>
    </ScreenFrame>
  );
}

function ChangePasswordForm() {
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    setBanner(null);
    setError(null);
    try {
      await authApi.changePassword({
        current_password: values.currentPassword,
        new_password: values.password,
      });
      reset();
      setBanner("Password updated.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        ...GLASS_SX,
        p: { xs: 2.5, md: 3 },
        borderRadius: 1,
        maxWidth: 480,
        animation: "authSlide 0.3s ease",
        "@keyframes authSlide": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Change password</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Enter your old password, then choose a new one and confirm it.
      </Typography>
      {banner ? (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setBanner(null)}>
          {banner}
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}
      <TextField
        label="Old password"
        type="password"
        fullWidth
        margin="normal"
        autoComplete="current-password"
        placeholder="Enter your current password"
        error={Boolean(errors.currentPassword)}
        helperText={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <TextField
        label="New password"
        type="password"
        fullWidth
        margin="normal"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register("password")}
      />
      <TextField
        label="Confirm new password"
        type="password"
        fullWidth
        margin="normal"
        autoComplete="new-password"
        placeholder="Re-enter the new password"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{ mt: 2, borderRadius: "999px", px: 2.5 }}
      >
        {isSubmitting ? "Saving..." : "Save password"}
      </Button>
    </Box>
  );
}
