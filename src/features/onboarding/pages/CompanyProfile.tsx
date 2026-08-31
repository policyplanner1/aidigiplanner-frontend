import { Box, Button, Collapse, FormControlLabel, MenuItem, Radio, RadioGroup, TextField, Typography, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { TYPE } from "../../../constants/fonts";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type { CompanyBrandProfile } from "../../../types/onboarding";
import { INDUSTRIES } from "../onboardingConstants";
import { StepHeading } from "../onboardingShared";

export function CompanyProfilePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";
  const companyName = session?.organizationName ?? "Your company";

  const onboarding = useQuery({
    queryKey: ["onboarding", companyId],
    queryFn: async () => (await onboardingApi.getOnboarding(companyId)).data,
    enabled: Boolean(companyId),
  });
  const isSingle = onboarding.data?.brand_structure === "single_brand";

  const [industry, setIndustry] = useState("Insurance");
  const [source, setSource] = useState<"website" | "description">("website");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [groupWebsite, setGroupWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [extra, setExtra] = useState<Partial<CompanyBrandProfile>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continueSingle = async () => {
    if (!industry.trim() || (!website.trim() && !description.trim())) {
      setError("Industry and a website or short description are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (companyId) await onboardingApi.setSingleBrandDetails(companyId, industry);
      navigate("/onboarding/brand-analysis", {
        state: {
          target: "company",
          industry,
          website: source === "website" ? website.trim() : "",
          description: source === "description" ? description.trim() : "",
          extra,
        },
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBusy(false);
    }
  };

  const continueMulti = async () => {
    setBusy(true);
    setError(null);
    try {
      if (companyId) {
        await onboardingApi.setGroupProfile(companyId, groupWebsite.trim() || undefined);
        if (logoFile) await onboardingApi.uploadGroupLogo(companyId, logoFile);
      }
      navigate("/onboarding/products");
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

  return (
    <Box>
      <StepHeading eyebrow="Company setup" title={isSingle ? "Company details" : "Group profile"} />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 2 }}>
        <TextField label="Company name" fullWidth value={companyName} disabled />

        {isSingle ? (
          <>
            <TextField select fullWidth label="Industry" value={industry} onChange={(event) => setIndustry(event.target.value)}>
              {INDUSTRIES.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
            <Typography sx={{ ...TYPE.label }}>Help AI understand your company</Typography>
            <RadioGroup value={source} onChange={(event) => setSource(event.target.value as "website" | "description")}>
              <FormControlLabel value="website" control={<Radio />} label="Use company website" />
              <FormControlLabel value="description" control={<Radio />} label="Enter company description manually" />
            </RadioGroup>
            {source === "website" ? (
              <TextField
                label="Website URL"
                fullWidth
                placeholder="https://www.example.com"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            ) : (
              <TextField
                label="One-line company description"
                fullWidth
                multiline
                minRows={3}
                placeholder="We help families compare health and life insurance plans in India."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            )}

            <Button onClick={() => setDetailsOpen((open) => !open)} sx={{ justifySelf: "start" }}>
              Add more details
            </Button>
            <Collapse in={detailsOpen}>
              <Box sx={{ display: "grid", gap: 1.5 }}>
                <Button variant="outlined" component="label" sx={{ borderRadius: "999px", width: "fit-content" }}>
                  {logoFile ? logoFile.name : "Upload company logo"}
                  <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
                </Button>
                <TextField label="Tagline" fullWidth value={extra.tagline ?? ""} onChange={(event) => setExtra((cur) => ({ ...cur, tagline: event.target.value }))} />
                <TextField label="Contact number" fullWidth value={extra.contact_number ?? ""} onChange={(event) => setExtra((cur) => ({ ...cur, contact_number: event.target.value }))} />
                <TextField label="Contact email" fullWidth value={extra.contact_email ?? ""} onChange={(event) => setExtra((cur) => ({ ...cur, contact_email: event.target.value }))} />
                <TextField
                  label="Preferred language"
                  fullWidth
                  placeholder="English, Hindi"
                  value={(extra.languages ?? []).join(", ")}
                  onChange={(event) => setExtra((cur) => ({ ...cur, languages: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))}
                />
                <TextField label="Regulatory category" fullWidth placeholder="IRDAI — insurance" value={extra.regulatory_category ?? ""} onChange={(event) => setExtra((cur) => ({ ...cur, regulatory_category: event.target.value }))} />
                <TextField label="Mandatory disclaimer" fullWidth multiline minRows={2} value={extra.compliance_mandatory_disclaimer ?? ""} onChange={(event) => setExtra((cur) => ({ ...cur, compliance_mandatory_disclaimer: event.target.value }))} />
              </Box>
            </Collapse>

            <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void continueSingle()}>
              {busy ? "Analysing…" : "Analyse Website"}
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="Group website"
              fullWidth
              placeholder="https://www.example.com"
              helperText="Optional"
              value={groupWebsite}
              onChange={(event) => setGroupWebsite(event.target.value)}
            />
            <Button variant="outlined" component="label" sx={{ borderRadius: "999px", width: "fit-content" }}>
              {logoFile ? logoFile.name : "Upload group logo (optional)"}
              <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
            </Button>
            <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void continueMulti()}>
              Continue to Products
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
