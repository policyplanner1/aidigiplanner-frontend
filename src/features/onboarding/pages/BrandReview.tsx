import { Alert, Box, Button, Chip, Collapse, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type { CompanyBrandProfile } from "../../../types/onboarding";
import { StepHeading } from "../onboardingShared";

type ReviewState = {
  target: "company" | "product";
  profile: CompanyBrandProfile;
  productId?: string;
  productName?: string;
};

export function BrandReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ReviewState | null;
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";

  const [profile, setProfile] = useState<CompanyBrandProfile | null>(state?.profile ?? null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state || !profile) {
    return <Navigate to="/onboarding/company-profile" replace />;
  }

  const set = <K extends keyof CompanyBrandProfile>(key: K, value: CompanyBrandProfile[K]) =>
    setProfile((current) => (current ? { ...current, [key]: value } : current));

  const palette = profile.visual_identity?.palette ?? [];
  const fonts = [profile.visual_identity?.heading_font, profile.visual_identity?.body_font].filter(Boolean);
  const tones = profile.tone ?? [];

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      if (state.target === "company") {
        if (companyId) {
          await onboardingApi.saveCompanyBrandProfile(companyId, {
            ...profile,
            category: profile.category || "General",
            market: profile.market || "India",
            audience_primary: profile.audience_primary || "Professionals",
          });
        }
        navigate("/onboarding/products");
        return;
      }

      if (state.productId) {
        await onboardingApi.saveProductBrandProfile(state.productId, {
          ...profile,
          category: profile.category || "General",
          market: profile.market || "India",
          audience_primary: profile.audience_primary || "Customers",
          compliance_mandatory_disclaimer: profile.compliance_mandatory_disclaimer ?? "",
        });
      }
      navigate("/onboarding/sub-products");
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBusy(false);
    }
  };

  const editDetails = () => {
    navigate(state.target === "company" ? "/onboarding/company-profile" : "/onboarding/products");
  };

  return (
    <Box>
      <StepHeading
        eyebrow="Company setup"
        title={state.target === "company" ? "Your brand profile is ready" : `${state.productName ?? "Product"} brand profile`}
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 1.5 }}>
        <TextField
          label="Brand name"
          fullWidth
          value={profile.name}
          onChange={(event) => set("name", event.target.value)}
        />
        <TextField
          label="Tagline"
          fullWidth
          value={profile.tagline ?? ""}
          onChange={(event) => set("tagline", event.target.value)}
        />
        <TextField
          label="Industry"
          fullWidth
          value={profile.category ?? ""}
          onChange={(event) => set("category", event.target.value)}
        />
        <TextField
          label="Company description"
          fullWidth
          multiline
          minRows={3}
          value={profile.description ?? ""}
          onChange={(event) => set("description", event.target.value)}
        />
        <TextField
          label="Target audience"
          fullWidth
          value={profile.audience_primary}
          onChange={(event) => set("audience_primary", event.target.value)}
        />

        <Box>
          <Typography sx={{ ...TYPE.label, mb: 0.5 }}>Brand colours</Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {palette.length ? palette.map((color) => <Chip key={color} label={color} size="small" />) : (
              <Typography variant="caption" color="text.secondary">No colours detected yet.</Typography>
            )}
          </Box>
        </Box>

        <Box>
          <Typography sx={{ ...TYPE.label, mb: 0.5 }}>Fonts</Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {fonts.length ? fonts.map((font) => <Chip key={font} label={font} size="small" variant="outlined" />) : (
              <Typography variant="caption" color="text.secondary">No fonts detected yet.</Typography>
            )}
          </Box>
        </Box>

        <Box>
          <Typography sx={{ ...TYPE.label, mb: 0.5 }}>Brand personality / tone of voice</Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {tones.length ? tones.map((tone) => <Chip key={tone} label={tone} size="small" color="secondary" variant="outlined" />) : (
              <Typography variant="caption" color="text.secondary">No tone detected yet.</Typography>
            )}
          </Box>
        </Box>

        <Button onClick={() => setDetailsOpen((open) => !open)} sx={{ justifySelf: "start" }}>
          Edit details
        </Button>
        <Collapse in={detailsOpen}>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <TextField
              label="Preferred language"
              fullWidth
              placeholder="English, Hindi"
              value={(profile.languages ?? []).join(", ")}
              onChange={(event) => set("languages", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
            />
            <TextField label="Contact email" fullWidth value={profile.contact_email ?? ""} onChange={(event) => set("contact_email", event.target.value)} />
            <TextField label="Contact number" fullWidth value={profile.contact_number ?? ""} onChange={(event) => set("contact_number", event.target.value)} />
            <TextField
              label="Website"
              fullWidth
              value={profile.website_url ?? ""}
              onChange={(event) => set("website_url", event.target.value)}
            />
            <TextField label="Regulatory category" fullWidth value={profile.regulatory_category ?? ""} onChange={(event) => set("regulatory_category", event.target.value)} />
            <TextField
              label="Mandatory disclaimer"
              fullWidth
              multiline
              minRows={2}
              value={profile.compliance_mandatory_disclaimer ?? ""}
              onChange={(event) => set("compliance_mandatory_disclaimer", event.target.value)}
            />
          </Box>
        </Collapse>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Button onClick={editDetails}>Start over</Button>
          <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void confirm()}>
            {busy ? "Saving…" : "Confirm and Continue"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
