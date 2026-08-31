import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import { Row, StepHeading } from "../onboardingShared";

export function OnboardingCompletedPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";
  const companyName = session?.organizationName ?? "Your company";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onboarding = useQuery({
    queryKey: ["onboarding", companyId],
    queryFn: async () => (await onboardingApi.getOnboarding(companyId)).data,
    enabled: Boolean(companyId),
  });

  const finish = async (to: string) => {
    setBusy(true);
    setError(null);
    try {
      if (companyId) await onboardingApi.completeOnboarding(companyId);
      navigate(to, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBusy(false);
    }
  };

  if (onboarding.isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const data = onboarding.data;

  return (
    <Box>
      <StepHeading eyebrow="Company setup" title="Your workspace is ready" />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 1.25 }}>
        <Row label="Company" value={data?.company_name || companyName} />
        <Row label="Products" value={String(data?.product_count ?? 1)} />
        <Row label="Sub-products" value={String(data?.sub_product_count ?? 0)} />
        <Row label="Brand profile" value="Completed" />
        <Row label="Connected social accounts" value={String(data?.social_account_count ?? 0)} />
        <Row label="Invited members" value={String(data?.team_member_count ?? 0)} />

        <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
          <Button variant="outlined" disabled={busy} onClick={() => void finish("/app/create")}>
            Create First Content
          </Button>
          <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void finish("/app/dashboard")}>
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
