import { Alert, Box, Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type { BrandStructure } from "../../../types/onboarding";
import { CardChoice, StepHeading } from "../onboardingShared";

export function CompanyStructurePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";
  const [structure, setStructure] = useState<BrandStructure>("multi_brand");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continueNext = async () => {
    setBusy(true);
    setError(null);
    try {
      if (companyId) await onboardingApi.setBrandStructure(companyId, structure);
      navigate("/onboarding/company-profile");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <StepHeading eyebrow="Company setup" title="How does your company manage its brands?" />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 1.25 }}>
        <CardChoice
          selected={structure === "single_brand"}
          title="One brand for all products"
          body="Products inherit company branding."
          onClick={() => setStructure("single_brand")}
        />
        <CardChoice
          selected={structure === "multi_brand"}
          title="Different brands for different products"
          body="Every product can have its own domain, industry and brand profile."
          onClick={() => setStructure("multi_brand")}
        />
        <CardChoice
          selected={structure === "unsure"}
          title="I'm not sure yet"
          body="Start with company defaults and customize products later."
          onClick={() => setStructure("unsure")}
        />
        <Button
          variant="contained"
          sx={{ mt: 1, borderRadius: "999px" }}
          disabled={busy}
          onClick={() => void continueNext()}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
}
