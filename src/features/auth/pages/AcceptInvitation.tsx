import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useParams } from "react-router-dom";
import { z } from "zod";

import { TYPE } from "../../../constants/fonts";
import { ROLE_LABELS } from "../../../permissions/roles";
import type { RoleName } from "../../../types/auth";

type InvitePayload = {
  company: string;
  role: string;
  product?: string;
  subProducts?: string[];
  email: string;
  fullName?: string;
};

// aidigiplanner-backend has no invitation-token concept yet — real invites are
// provisioned directly by email with a temporary password (see
// app/modules/companies/provisioning.py's find_or_create_user_by_email), and the
// person just signs in at /login. This screen exists so the spec'd
// "invitation link → accept → set password → login" journey has somewhere to
// live once a real token-based endpoint is added; for now it decodes a
// base64url JSON payload from the :token param for preview purposes only, and
// never calls a real API to create the account.
function decodeInviteToken(token: string | undefined): InvitePayload | null {
  if (!token) return null;
  try {
    const json = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json) as Partial<InvitePayload>;
    if (!data.email || !data.company || !data.role) return null;
    return {
      company: data.company,
      role: data.role,
      product: data.product,
      subProducts: data.subProducts,
      email: data.email,
      fullName: data.fullName,
    };
  } catch {
    return null;
  }
}

function roleLabel(role: string): string {
  return ROLE_LABELS[role as RoleName] ?? role;
}

const acceptInvitationSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    password: z.string().min(10, "Password must be at least 10 characters"),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AcceptInvitationValues = z.infer<typeof acceptInvitationSchema>;

export function AcceptInvitationPage() {
  const { token } = useParams();
  const invite = useMemo(() => decodeInviteToken(token), [token]);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInvitationValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { fullName: invite?.fullName ?? "", password: "", confirmPassword: "" },
  });

  if (!invite) {
    return (
      <Box>
        <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Invitation</Typography>
        <Typography sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>
          This invitation link isn't valid
        </Typography>
        <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.75, mb: 2.5 }}>
          It may have expired, or already been used. Ask whoever invited you to send a new
          invitation, or sign in directly if you already have a password.
        </Typography>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          fullWidth
          size="large"
          sx={{ borderRadius: "999px", py: 1.15 }}
        >
          Go to sign in
        </Button>
      </Box>
    );
  }

  const onSubmit: (values: AcceptInvitationValues) => Promise<void> = async () => {
    // Not backend-wired yet — see the note above decodeInviteToken().
    setNotice(
      "Invitation acceptance isn't connected to the backend yet. Sign in with the email and " +
        "temporary password from your invitation email instead.",
    );
  };

  return (
    <Box>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Invitation</Typography>
      <Typography variant="h5" sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>
        Join {invite.company} on AI Social Planner
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.75, mb: 2 }}>
        Set a password to finish creating your account.
      </Typography>

      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2.5 }}>
        <Chip size="small" label={`Role: ${roleLabel(invite.role)}`} />
        {invite.product ? <Chip size="small" label={`Product: ${invite.product}`} /> : null}
        {invite.subProducts?.length
          ? invite.subProducts.map((sub) => <Chip key={sub} size="small" label={sub} />)
          : null}
      </Box>

      {notice ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      ) : null}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField label="Email" fullWidth margin="normal" value={invite.email} disabled />
        <TextField
          label="Full name"
          fullWidth
          margin="normal"
          error={Boolean(errors.fullName)}
          helperText={errors.fullName?.message}
          {...register("fullName")}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          autoComplete="new-password"
          placeholder="At least 10 characters"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register("password")}
        />
        <TextField
          label="Confirm password"
          type="password"
          fullWidth
          margin="normal"
          autoComplete="new-password"
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
          disabled={isSubmitting}
          sx={{ mt: 2.5, borderRadius: "999px", py: 1.15 }}
        >
          Accept invitation
        </Button>
      </Box>

      <Typography sx={{ mt: 2 }} color="text.secondary">
        Already set your password?{" "}
        <Box component={RouterLink} to="/login" sx={{ color: "inherit", fontWeight: 600 }}>
          Sign in
        </Box>
      </Typography>
    </Box>
  );
}
