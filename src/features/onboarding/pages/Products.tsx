import { Alert, Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type { BrandingMode } from "../../../types/onboarding";
import { INDUSTRIES } from "../onboardingConstants";
import { CardChoice, StepHeading } from "../onboardingShared";

function registrableDomain(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function OnboardingProductsPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const companyId = session?.organizationId ?? "";

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Insurance");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [brandingMode, setBrandingMode] = useState<BrandingMode>("separate_brand");
  const [brandingTouched, setBrandingTouched] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: status } = await onboardingApi.getOnboarding(companyId);
        if (cancelled) return;
        if (status.brand_structure === "multi_brand") {
          setCompanyWebsite(status.group_website_url ?? null);
          return;
        }
        const { data: profile } = await onboardingApi.getCompanyBrandProfile(companyId);
        if (!cancelled) setCompanyWebsite(profile.website_url ?? null);
      } catch {
        // Best-effort nudge only -- no company website on file just means no nudge.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const companyDomain = companyWebsite ? registrableDomain(companyWebsite) : null;
  const productDomain = registrableDomain(website);
  const brandingMismatch = Boolean(companyDomain && productDomain && companyDomain !== productDomain);

  // Default is already "separate_brand" -- if the admin hasn't manually
  // switched to company branding, a mismatch just confirms the default
  // instead of needing to force a change.
  const handleWebsiteChange = (value: string) => {
    setWebsite(value);
    if (brandingTouched) return;
    const domain = registrableDomain(value);
    if (companyDomain && domain && companyDomain !== domain) {
      setBrandingMode("separate_brand");
    }
  };

  const createProduct = async () => {
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!industry.trim()) {
      setError("Product industry is required.");
      return;
    }
    if (!website.trim() && !description.trim()) {
      setError("Add a product website or a short description.");
      return;
    }
    if (!companyId) return;

    setBusy(true);
    setError(null);
    try {
      const created = await onboardingApi.createProduct(companyId, {
        name: name.trim(),
        description: website.trim() || description.trim() || null,
        branding_mode: brandingMode,
      });

      if (brandingMode === "separate_brand") {
        navigate("/onboarding/brand-analysis", {
          state: {
            target: "product",
            productId: created.id,
            productName: created.name,
            industry,
            website: website.trim(),
            description: description.trim(),
          },
        });
        return;
      }

      navigate("/onboarding/sub-products");
    } catch (err) {
      setError(getApiErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Box>
      <StepHeading eyebrow="Company setup" title="Create your first product" />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ display: "grid", gap: 2 }}>
        <TextField label="Product name" fullWidth placeholder="Policy Planner" value={name} onChange={(event) => setName(event.target.value)} />
        <TextField select fullWidth label="Industry" value={industry} onChange={(event) => setIndustry(event.target.value)}>
          {INDUSTRIES.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Product website"
          fullWidth
          placeholder="https://www.example.com"
          value={website}
          onChange={(event) => handleWebsiteChange(event.target.value)}
        />
        <TextField
          label="Short description"
          fullWidth
          multiline
          minRows={2}
          placeholder="Family health cover with cashless hospitalisation across India."
          helperText="Required if there is no product website"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <Typography sx={{ ...TYPE.label }}>Branding</Typography>
        {brandingMismatch ? (
          <Alert severity="info">
            This product appears to use separate branding. Would you like AI to create a new brand profile?
          </Alert>
        ) : null}
        <CardChoice
          selected={brandingMode === "use_company_branding"}
          title="Use company branding"
          body="This product inherits the company brand profile."
          onClick={() => {
            setBrandingTouched(true);
            setBrandingMode("use_company_branding");
          }}
        />
        <CardChoice
          selected={brandingMode === "separate_brand"}
          title="Create a separate product brand"
          body="Recommended if this product has its own website. AI analyses it and builds a new brand profile."
          onClick={() => {
            setBrandingTouched(true);
            setBrandingMode("separate_brand");
          }}
        />

        <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void createProduct()}>
          {busy ? "Creating…" : "Continue"}
        </Button>
      </Box>
    </Box>
  );
}
