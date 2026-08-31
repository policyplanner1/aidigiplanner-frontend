import { Alert, Box, Button, Collapse, CircularProgress, MenuItem, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type { ProductInviteRole } from "../../../types/onboarding";
import { useLatestOnboardingProduct } from "../useLatestOnboardingProduct";
import { StepHeading } from "../onboardingShared";

const ROLES: { id: ProductInviteRole; label: string }[] = [
  { id: "product_manager", label: "Product Manager" },
  { id: "creator", label: "Content Creator" },
  { id: "approver", label: "Approver" },
  { id: "publisher", label: "Publisher" },
  { id: "analyst", label: "Analyst" },
];

export function OnboardingTeamPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";
  const { product, isLoading } = useLatestOnboardingProduct(companyId);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProductInviteRole>("creator");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [invited, setInvited] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvite = async () => {
    if (!fullName.trim()) {
      setError("Enter their full name to invite.");
      return;
    }
    if (!email.trim()) {
      setError("Enter an email to invite.");
      return;
    }
    if (!product) return;
    setBusy(true);
    setError(null);
    try {
      await onboardingApi.inviteToProduct(product.id, {
        email: email.trim(),
        full_name: fullName.trim(),
        role,
        sub_product_ids: [],
      });
      setInvited((count) => count + 1);
      setFullName("");
      setEmail("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const finishStep = () => navigate("/onboarding/completed");

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      <StepHeading eyebrow="Company setup" title="Invite a team member" />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 2 }}>
        <TextField label="Full name" fullWidth placeholder="Alex Johnson" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        <TextField label="Email address" fullWidth placeholder="alex@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField select fullWidth label="Role" value={role} onChange={(event) => setRole(event.target.value as ProductInviteRole)}>
          {ROLES.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Product access" fullWidth value={product?.name ?? "First product"} disabled />

        <Button onClick={() => setDetailsOpen((open) => !open)} sx={{ justifySelf: "start" }}>
          Customize Permissions
        </Button>
        <Collapse in={detailsOpen}>
          <Typography sx={{ ...TYPE.body, color: "text.secondary" }}>
            Content Creator generates and edits content. Approver reviews and approves. Publisher
            schedules and publishes. Analyst has read-only analytics access. Product Manager
            manages the whole product. Per-permission customization isn't available yet — invite
            with the closest role for now.
          </Typography>
        </Collapse>

        {invited ? (
          <Alert severity="success">
            {invited} invitation{invited === 1 ? "" : "s"} sent.
          </Alert>
        ) : null}

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button disabled={busy} onClick={finishStep}>
            Skip for Now
          </Button>
          <Button variant="outlined" disabled={busy} onClick={() => void sendInvite()}>
            Send Invitation
          </Button>
          <Button variant="contained" sx={{ borderRadius: "999px" }} onClick={finishStep}>
            Finish Setup
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
