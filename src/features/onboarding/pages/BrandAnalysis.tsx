import { CheckCircle } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type { CompanyBrandProfile } from "../../../types/onboarding";
import { ANALYSIS_STAGES, emptyProfile } from "../onboardingConstants";
import { StepHeading } from "../onboardingShared";

type AnalysisState = {
  target: "company" | "product";
  industry?: string;
  website?: string;
  description?: string;
  extra?: Partial<CompanyBrandProfile>;
  productId?: string;
  productName?: string;
};

export function BrandAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as AnalysisState | null;
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";
  const companyName = session?.organizationName ?? "Your company";

  const [stageIndex, setStageIndex] = useState(0);
  const [status, setStatus] = useState<"running" | "unavailable" | "empty" | "failed">("running");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((current) => Math.min(current + 1, ANALYSIS_STAGES.length - 1));
    }, 650);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!state) return;
    let cancelled = false;

    const run = async () => {
      try {
        const hasSource = Boolean(state.website?.trim() || state.description?.trim());
        if (!hasSource) {
          if (!cancelled) {
            setStatus("empty");
          }
          return;
        }

        if (state.target === "company") {
          await onboardingApi.analyzeCompanyBrand(companyId, {
            website_url: state.website || undefined,
            description: state.description || undefined,
            dry_run: false,
          });
          const { data } = await onboardingApi.getCompanyBrandProfile(companyId);
          if (cancelled) return;
          const merged: CompanyBrandProfile = {
            ...emptyProfile(companyName, state.industry),
            ...data,
            ...state.extra,
            name: data.name || companyName,
          };
          navigate("/onboarding/brand-review", { replace: true, state: { target: "company", profile: merged } });
          return;
        }

        if (state.productId) {
          await onboardingApi.analyzeProductBrand(state.productId, {
            website_url: state.website || undefined,
            description: state.description || undefined,
            dry_run: false,
          });
          const { data } = await onboardingApi.getEffectiveProductBrand(state.productId);
          if (cancelled) return;
          const merged: CompanyBrandProfile = {
            ...emptyProfile(state.productName ?? "Product", state.industry),
            ...data,
          };
          navigate("/onboarding/brand-review", {
            replace: true,
            state: { target: "product", productId: state.productId, productName: state.productName, profile: merged },
          });
        }
      } catch (err) {
        if (cancelled) return;
        const message = getApiErrorMessage(err);
        setErrorMessage(message);
        setStatus(/reach|network|timeout|unavailable/i.test(message) ? "unavailable" : "failed");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.target, state?.productId]);

  if (!state) {
    return <Navigate to="/onboarding/company-profile" replace />;
  }

  const retry = () => {
    setStatus("running");
    setErrorMessage(null);
    setStageIndex(0);
    // Re-trigger the effect by navigating to the same route with a fresh state object.
    navigate(location.pathname, { replace: true, state: { ...state } });
  };

  const enterManually = () => {
    navigate(state.target === "company" ? "/onboarding/company-profile" : "/onboarding/products", { replace: true });
  };

  return (
    <Box>
      <StepHeading eyebrow="Company setup" title="Creating your brand profile…" />

      {status === "unavailable" ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          We couldn't reach that website. Check the URL, or enter a description instead.
        </Alert>
      ) : null}
      {status === "empty" ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add a website URL or a short description before we can analyse this brand.
        </Alert>
      ) : null}
      {status === "failed" ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage ?? "We couldn't finish the analysis."}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 1.25, py: 1 }}>
        {ANALYSIS_STAGES.map((label, index) => (
          <Box key={label} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {status === "running" && index < stageIndex ? (
              <CheckCircle sx={{ color: "#1F8A80" }} fontSize="small" />
            ) : status === "running" && index === stageIndex ? (
              <CircularProgress size={16} />
            ) : status === "running" ? (
              <Box sx={{ width: 16, height: 16, borderRadius: "50%", border: `1px solid ${SURFACE.border}` }} />
            ) : (
              <Box sx={{ width: 16, height: 16, borderRadius: "50%", border: `1px solid ${SURFACE.border}` }} />
            )}
            <Typography sx={{ ...TYPE.body, color: index <= stageIndex ? "text.primary" : "text.secondary" }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {status !== "running" ? (
        <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
          <Button variant="contained" sx={{ borderRadius: "999px" }} onClick={retry}>
            Retry
          </Button>
          <Button variant="outlined" onClick={enterManually}>
            Enter description manually
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
