import { Add } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import { useLatestOnboardingProduct } from "../useLatestOnboardingProduct";
import { StepHeading } from "../onboardingShared";

export function SubProductsPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";
  const { product, isLoading } = useLatestOnboardingProduct(companyId);

  const [names, setNames] = useState(["", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (skip: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const trimmed = skip ? [] : names.map((item) => item.trim()).filter(Boolean);
      if (product && trimmed.length) {
        await onboardingApi.addSubProducts(product.id, trimmed);
      }
      navigate("/onboarding/social-accounts");
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      <StepHeading eyebrow="Company setup" title={`Does ${product?.name ?? "this product"} have sub-products?`} />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 1.5 }}>
        <Typography sx={{ ...TYPE.body, color: "text.secondary" }}>
          Examples: Health Insurance, Term Insurance, Motor Insurance. Sub-products inherit this
          product's branding, social accounts, tone, CTA and compliance rules unless customized.
        </Typography>
        {names.map((name, index) => (
          <TextField
            key={index}
            fullWidth
            placeholder={index === 0 ? "Health Insurance" : "Another sub-product"}
            value={name}
            onChange={(event) => setNames((current) => current.map((item, i) => (i === index ? event.target.value : item)))}
          />
        ))}
        <Box>
          <Button startIcon={<Add />} onClick={() => setNames((current) => [...current, ""])}>
            Add another
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button disabled={busy} onClick={() => void save(true)}>
            Skip for Now
          </Button>
          <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void save(false)}>
            Add Sub-products
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
