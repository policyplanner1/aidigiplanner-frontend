import { Add, CheckCircle } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { useAuth } from "../../../hooks/useAuth";
import { getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type { BrandStructure, BrandingMode, CompanyBrandProfile, ProductInviteRole } from "../../../types/onboarding";

type WizardStep =
  | "structure"
  | "company"
  | "analyze"
  | "review"
  | "product"
  | "productReview"
  | "subproducts"
  | "social"
  | "team"
  | "ready";

const INDUSTRIES = [
  "Insurance",
  "Beauty & Personal Care",
  "Healthcare",
  "Education",
  "Real Estate",
  "Finance",
  "Retail",
  "D2C",
  "SaaS",
  "NGO",
  "Food & Beverage",
  "Travel",
  "Business Services",
  "Other",
];

const ANALYSIS_STAGES = [
  "Reading website",
  "Finding logo and brand colours",
  "Understanding products and services",
  "Identifying target audience",
  "Preparing content style",
];

const SOCIALS = [
  { id: "instagram", api: "instagram", label: "Instagram" },
  { id: "facebook", api: "facebook", label: "Facebook" },
  { id: "linkedin", api: "linkedin", label: "LinkedIn" },
  { id: "youtube", api: "youtube", label: "YouTube" },
  { id: "x", api: "twitter", label: "X" },
  { id: "google_business", api: "google", label: "Google Business" },
];

const ROLES: { id: ProductInviteRole; label: string }[] = [
  { id: "creator", label: "Content Creator" },
  { id: "approver", label: "Approver" },
  { id: "publisher", label: "Publisher" },
  { id: "analyst", label: "Analyst" },
  { id: "product_manager", label: "Product Manager" },
];

function emptyProfile(name: string, category = "General"): CompanyBrandProfile {
  return {
    name,
    category,
    market: "India",
    audience_primary: "",
    audience_secondary: "",
    tone: [],
    languages: ["en"],
    voice: "",
    tagline: "",
    description: "",
    website_url: "",
    visual_identity: { palette: [], style_keywords: [], avoid: [] },
    compliance_mandatory_disclaimer: "",
    compliance_secondary_disclaimers: [],
    compliance_banned_claims: [],
    compliance_rules: [],
    cta_bank: [],
    hashtag_bank: [],
    product_lines: [],
  };
}

function CardChoice({
  selected,
  title,
  body,
  onClick,
}: {
  selected: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: "16px",
        cursor: "pointer",
        border: `1.5px solid ${selected ? "#FF6B45" : SURFACE.border}`,
        backgroundColor: selected ? "rgba(255,107,69,0.08)" : SURFACE.well,
        transition: "border-color 0.15s ease, background-color 0.15s ease",
      }}
    >
      <Typography sx={{ ...TYPE.section }}>{title}</Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.5, fontSize: 14 }}>{body}</Typography>
    </Box>
  );
}

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const live = isLiveAuth() && session?.source === "api";
  const companyId = session?.organizationId ?? "";
  const companyName = session?.organizationName ?? "Your company";

  const [step, setStep] = useState<WizardStep>("structure");
  const [loading, setLoading] = useState(live);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [structure, setStructure] = useState<BrandStructure>("multi_brand");
  const [industry, setIndustry] = useState("Insurance");
  const [source, setSource] = useState<"website" | "description">("website");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [analysisIndex, setAnalysisIndex] = useState(0);
  const [analyzeKind, setAnalyzeKind] = useState<"company" | "product">("company");

  const [profile, setProfile] = useState<CompanyBrandProfile>(() => emptyProfile(companyName));
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [productName, setProductName] = useState("");
  const [productIndustry, setProductIndustry] = useState("Insurance");
  const [productWebsite, setProductWebsite] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [brandingMode, setBrandingMode] = useState<BrandingMode>("separate_brand");
  const [productId, setProductId] = useState("");
  const [productProfile, setProductProfile] = useState<CompanyBrandProfile>(() => emptyProfile(""));

  const [subNames, setSubNames] = useState(["", "", ""]);
  const [connected, setConnected] = useState<Record<string, string>>({});
  const [connectFor, setConnectFor] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [socialScope, setSocialScope] = useState<"product" | "sub_products" | "company">("product");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProductInviteRole>("creator");
  const [invited, setInvited] = useState(0);

  const isSingle = structure === "single_brand";

  useEffect(() => {
    if (!live || !companyId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    onboardingApi
      .getOnboarding(companyId)
      .then(({ data }) => {
        if (cancelled) return;
        const current = String(data.onboarding_step ?? "");
        if (data.brand_structure) setStructure(data.brand_structure);
        if (current === "completed") {
          navigate("/app/dashboard", { replace: true });
          return;
        }
        if (current === "first_product_created") setStep("subproducts");
        else if (current === "brand_profile_completed") setStep("product");
        else if (current === "brand_structure_selected") setStep("company");
        else setStep("structure");
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, live, navigate]);

  useEffect(() => {
    if (step !== "analyze") return;
    setAnalysisIndex(0);
    const timer = window.setInterval(() => {
      setAnalysisIndex((current) => Math.min(current + 1, ANALYSIS_STAGES.length - 1));
    }, 700);
    return () => window.clearInterval(timer);
  }, [step]);

  const palette = profile.visual_identity?.palette ?? [];
  const tones = profile.tone ?? [];
  const summary = useMemo(
    () => ({
      company: companyName,
      product: productName || "First product",
      brand: profile.name || companyName,
      subs: subNames.map((item) => item.trim()).filter(Boolean).length,
      socials: Object.keys(connected).length,
    }),
    [companyName, connected, productName, profile.name, subNames],
  );

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const loadCompanyProfile = async () => {
    if (!live || !companyId) {
      setProfile({
        ...emptyProfile(companyName, industry),
        website_url: website,
        description,
        audience_primary: "Young families aged 25–40 in India",
        tone: ["Professional", "Reliable", "Modern"],
        visual_identity: { palette: ["#1F3A5F", "#FFFFFF", "#C9A227"] },
      });
      return;
    }
    await onboardingApi.analyzeCompanyBrand(companyId, {
      website_url: source === "website" ? website.trim() : undefined,
      description: source === "description" ? description.trim() : undefined,
      dry_run: false,
    });
    try {
      const { data } = await onboardingApi.getCompanyBrandProfile(companyId);
      setProfile({ ...emptyProfile(companyName, industry), ...data, name: data.name || companyName });
    } catch {
      setProfile(emptyProfile(companyName, industry));
    }
  };

  const loadProductProfile = async (id: string) => {
    if (!live) {
      setProductProfile({
        ...emptyProfile(productName, productIndustry),
        website_url: productWebsite,
        tone: ["Professional", "Educational", "Trustworthy"],
      });
      return;
    }
    await onboardingApi.analyzeProductBrand(id, {
      website_url: productWebsite.trim() || undefined,
      description: productWebsite.trim() ? undefined : productDescription.trim() || productName,
      dry_run: false,
    });
    try {
      const { data } = await onboardingApi.getEffectiveProductBrand(id);
      setProductProfile({ ...emptyProfile(productName, productIndustry), ...data });
    } catch {
      setProductProfile(emptyProfile(productName, productIndustry));
    }
  };

  const retryAnalyze = () =>
    run(async () => {
      setError(null);
      setStep("analyze");
      if (analyzeKind === "company") {
        await loadCompanyProfile();
        setStep("review");
        return;
      }
      if (!productId) throw new Error("Create the product first, then retry analysis.");
      await loadProductProfile(productId);
      setStep("productReview");
    });

  const saveStructure = () =>
    run(async () => {
      if (live && companyId) await onboardingApi.setBrandStructure(companyId, structure);
      setStep("company");
    });

  const continueFromCompany = () =>
    run(async () => {
      if (isSingle) {
        if (!industry.trim() || (!website.trim() && !description.trim())) {
          throw new Error("Industry and a website or short description are required.");
        }
        if (live && companyId) {
          await onboardingApi.setSingleBrandDetails(companyId, industry);
        }
        setAnalyzeKind("company");
        setStep("analyze");
        await loadCompanyProfile();
        setStep("review");
        return;
      }

      if (live && companyId) {
        await onboardingApi.setGroupProfile(companyId, website.trim() || undefined);
        if (logoFile) await onboardingApi.uploadGroupLogo(companyId, logoFile);
      }
      setStep("product");
    });

  const confirmBrand = () =>
    run(async () => {
      if (live && companyId) {
        await onboardingApi.saveCompanyBrandProfile(companyId, {
          ...profile,
          name: profile.name || companyName,
          category: profile.category || industry,
          market: profile.market || "India",
          audience_primary: profile.audience_primary || "Professionals",
        });
      }
      setStep("product");
    });

  const createFirstProduct = () =>
    run(async () => {
      if (!productName.trim()) throw new Error("Product name is required.");
      if (!productIndustry.trim()) throw new Error("Product industry is required.");
      if (!productWebsite.trim() && !productDescription.trim()) {
        throw new Error("Add a product website or a short description.");
      }
      let id = productId;
      if (live && companyId) {
        const created = await onboardingApi.createProduct(companyId, {
          name: productName.trim(),
          description: productWebsite.trim() || productDescription.trim() || null,
          branding_mode: brandingMode,
        });
        id = created.id;
        setProductId(id);
        if (brandingMode === "separate_brand") {
          setAnalyzeKind("product");
          setStep("analyze");
          await loadProductProfile(id);
          setStep("productReview");
          return;
        }
      } else {
        id = `local_${Date.now()}`;
        setProductId(id);
      }
      if (brandingMode === "separate_brand" && !live) {
        setProductProfile({
          ...emptyProfile(productName, productIndustry),
          website_url: productWebsite,
          tone: ["Professional", "Educational", "Trustworthy"],
        });
        setStep("productReview");
        return;
      }
      setStep("subproducts");
    });

  const confirmProduct = () =>
    run(async () => {
      if (live && productId) {
        await onboardingApi.saveProductBrandProfile(productId, {
          ...productProfile,
          name: productProfile.name || productName,
          category: productProfile.category || productIndustry,
          market: productProfile.market || "India",
          audience_primary: productProfile.audience_primary || "Customers",
          compliance_mandatory_disclaimer: productProfile.compliance_mandatory_disclaimer ?? "",
        });
      }
      setStep("subproducts");
    });

  const saveSubs = (skip: boolean) =>
    run(async () => {
      const names = skip ? [] : subNames.map((item) => item.trim()).filter(Boolean);
      if (live && productId && names.length) await onboardingApi.addSubProducts(productId, names);
      setStep("social");
    });

  const connectAccount = () =>
    run(async () => {
      if (!connectFor || !handle.trim()) throw new Error("Add a handle to connect.");
      const platform = SOCIALS.find((item) => item.id === connectFor);
      if (live && productId && platform) {
        await onboardingApi.addSocialAccount(productId, {
          platform: platform.api,
          handle: handle.trim(),
          profile_url: profileUrl.trim() || undefined,
          scope: socialScope,
        });
      }
      setConnected((current) => ({ ...current, [connectFor]: handle.trim() }));
      setConnectFor(null);
      setHandle("");
      setProfileUrl("");
    });

  const sendInvite = () =>
    run(async () => {
      if (!inviteEmail.trim()) throw new Error("Enter an email to invite.");
      if (live && productId) {
        await onboardingApi.inviteToProduct(productId, {
          email: inviteEmail.trim(),
          role: inviteRole,
          sub_product_ids: [],
        });
      }
      setInvited((count) => count + 1);
      setInviteEmail("");
    });

  const finish = (to = "/app/dashboard") =>
    run(async () => {
      if (live && companyId) await onboardingApi.completeOnboarding(companyId);
      navigate(to, { replace: true });
    });

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Company setup</Typography>
      <Typography variant="h5" sx={{ ...TYPE.title, mt: 0.5, mb: 2, fontSize: "1.45rem" }}>
        {step === "structure" && "How does your company manage its brands?"}
        {step === "company" && (isSingle ? "Company details" : "Group profile")}
        {step === "analyze" && "Creating your brand profile…"}
        {step === "review" && "Your brand profile is ready"}
        {step === "product" && "Create your first product"}
        {step === "productReview" && `${productName || "Product"} brand profile`}
        {step === "subproducts" && `Does ${productName || "this product"} have sub-products?`}
        {step === "social" && `Connect social accounts for ${productName || "your product"}`}
        {step === "team" && "Invite a team member"}
        {step === "ready" && "Your workspace is ready"}
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {step === "structure" ? (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          <CardChoice
            selected={structure === "single_brand"}
            title="One brand for all products"
            body="All products can inherit the company branding."
            onClick={() => setStructure("single_brand")}
          />
          <CardChoice
            selected={structure === "multi_brand"}
            title="Different brands for different products"
            body="Each product can have its own industry, domain, logo, colours, tone, and social accounts."
            onClick={() => setStructure("multi_brand")}
          />
          <CardChoice
            selected={structure === "unsure"}
            title="I’m not sure yet"
            body="Use company branding as the default. You can create an independent product brand later."
            onClick={() => setStructure("unsure")}
          />
          <Button variant="contained" sx={{ mt: 1, borderRadius: "999px" }} disabled={busy} onClick={() => void saveStructure()}>
            Continue
          </Button>
        </Box>
      ) : null}

      {step === "company" ? (
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
                <FormControlLabel value="description" control={<Radio />} label="Enter a short description" />
              </RadioGroup>
              {source === "website" ? (
                <TextField label="Website" fullWidth placeholder="https://www.example.com" value={website} onChange={(event) => setWebsite(event.target.value)} />
              ) : (
                <TextField
                  label="Short description"
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="We help families compare health and life insurance plans in India."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              )}
              <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void continueFromCompany()}>
                {busy ? "Analysing…" : source === "website" ? "Analyse Website" : "Analyse description"}
              </Button>
            </>
          ) : (
            <>
              <TextField
                label="Group website"
                fullWidth
                placeholder="https://www.example.com"
                helperText="Optional"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
              <Button variant="outlined" component="label" sx={{ borderRadius: "999px", width: "fit-content" }}>
                {logoFile ? logoFile.name : "Upload logo"}
                <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
              </Button>
              <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void continueFromCompany()}>
                Continue to Products
              </Button>
            </>
          )}
        </Box>
      ) : null}

      {step === "analyze" ? (
        <Box sx={{ display: "grid", gap: 1.25, py: 1 }}>
          {ANALYSIS_STAGES.map((label, index) => (
            <Box key={label} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {index < analysisIndex ? (
                <CheckCircle sx={{ color: "#1F8A80" }} fontSize="small" />
              ) : index === analysisIndex ? (
                <CircularProgress size={16} />
              ) : (
                <Box sx={{ width: 16, height: 16, borderRadius: "50%", border: `1px solid ${SURFACE.border}` }} />
              )}
              <Typography sx={{ ...TYPE.body, color: index <= analysisIndex ? "text.primary" : "text.secondary" }}>{label}</Typography>
            </Box>
          ))}
          {error ? (
            <Button variant="contained" sx={{ mt: 1.5, borderRadius: "999px", width: "fit-content" }} disabled={busy} onClick={() => void retryAnalyze()}>
              {busy ? "Retrying…" : "Retry analysis"}
            </Button>
          ) : null}
        </Box>
      ) : null}

      {step === "review" ? (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Typography sx={{ ...TYPE.section }}>{profile.name || companyName}</Typography>
          <Typography color="text.secondary">{profile.category || industry}</Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {palette.map((color) => (
              <Chip key={color} label={color} size="small" />
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {tones.map((tone) => (
              <Chip key={tone} label={tone} size="small" color="secondary" variant="outlined" />
            ))}
          </Box>
          <TextField
            label="Target audience"
            fullWidth
            placeholder="Young families aged 25–40 in India"
            value={profile.audience_primary}
            onChange={(event) => setProfile((current) => ({ ...current, audience_primary: event.target.value }))}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
            placeholder="We help families compare health and life insurance plans in India."
            value={profile.description ?? ""}
            onChange={(event) => setProfile((current) => ({ ...current, description: event.target.value }))}
          />
          <Button onClick={() => setDetailsOpen((open) => !open)}>Additional brand details</Button>
          <Collapse in={detailsOpen}>
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <TextField label="Tagline" fullWidth placeholder="Cover that actually makes sense." value={profile.tagline ?? ""} onChange={(event) => setProfile((current) => ({ ...current, tagline: event.target.value }))} />
              <TextField label="Contact email" fullWidth placeholder="hello@example.com" value={profile.contact_email ?? ""} onChange={(event) => setProfile((current) => ({ ...current, contact_email: event.target.value }))} />
              <TextField label="Contact number" fullWidth placeholder="+91 98765 43210" value={profile.contact_number ?? ""} onChange={(event) => setProfile((current) => ({ ...current, contact_number: event.target.value }))} />
              <TextField label="Preferred languages" fullWidth placeholder="English, Hindi" value={(profile.languages ?? []).join(", ")} onChange={(event) => setProfile((current) => ({ ...current, languages: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
              <TextField label="Regulatory category" fullWidth placeholder="IRDAI — insurance" value={profile.regulatory_category ?? ""} onChange={(event) => setProfile((current) => ({ ...current, regulatory_category: event.target.value }))} />
              <TextField label="Mandatory disclaimer" fullWidth placeholder="Insurance is the subject matter of solicitation." value={profile.compliance_mandatory_disclaimer ?? ""} onChange={(event) => setProfile((current) => ({ ...current, compliance_mandatory_disclaimer: event.target.value }))} />
            </Box>
          </Collapse>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button onClick={() => setStep("company")}>Edit details</Button>
            <Button variant="outlined" disabled={busy} onClick={() => void retryAnalyze()}>
              Retry analysis
            </Button>
            <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void confirmBrand()}>
              Confirm and Continue
            </Button>
          </Box>
        </Box>
      ) : null}

      {step === "product" ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField label="Product name" fullWidth placeholder="Policy Planner" value={productName} onChange={(event) => setProductName(event.target.value)} />
          <TextField select fullWidth label="Industry" value={productIndustry} onChange={(event) => setProductIndustry(event.target.value)}>
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
            value={productWebsite}
            onChange={(event) => setProductWebsite(event.target.value)}
          />
          <TextField
            label="Short description"
            fullWidth
            multiline
            minRows={2}
            placeholder="Family health cover with cashless hospitalisation across India."
            helperText="Required if there is no product website"
            value={productDescription}
            onChange={(event) => setProductDescription(event.target.value)}
          />
          <Typography sx={{ ...TYPE.label }}>Branding</Typography>
          <CardChoice
            selected={brandingMode === "use_company_branding"}
            title="Use company branding"
            body="This product inherits the company brand profile."
            onClick={() => setBrandingMode("use_company_branding")}
          />
          <CardChoice
            selected={brandingMode === "separate_brand"}
            title="Create a separate product brand"
            body="AI can analyse the product website and build a new brand profile."
            onClick={() => setBrandingMode("separate_brand")}
          />
          <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void createFirstProduct()}>
            {busy ? "Creating…" : "Analyse and Create Product"}
          </Button>
        </Box>
      ) : null}

      {step === "productReview" ? (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Typography color="text.secondary">{productProfile.category || productIndustry}</Typography>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {(productProfile.tone ?? []).map((tone) => (
              <Chip key={tone} label={tone} size="small" />
            ))}
          </Box>
          <TextField
            label="Target audience"
            fullWidth
            placeholder="Young families aged 25–40 in India"
            value={productProfile.audience_primary}
            onChange={(event) => setProductProfile((current) => ({ ...current, audience_primary: event.target.value }))}
          />
          <TextField
            label="Tagline"
            fullWidth
            placeholder="Cover that actually makes sense."
            value={productProfile.tagline ?? ""}
            onChange={(event) => setProductProfile((current) => ({ ...current, tagline: event.target.value }))}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button onClick={() => setStep("product")}>Edit</Button>
            <Button variant="outlined" disabled={busy} onClick={() => void retryAnalyze()}>
              Retry analysis
            </Button>
            <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void confirmProduct()}>
              Confirm Product
            </Button>
          </Box>
        </Box>
      ) : null}

      {step === "subproducts" ? (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <Typography sx={{ ...TYPE.body, color: "text.secondary" }}>
            Examples: Health Insurance, Term Insurance, Motor Insurance. Sub-products inherit this product’s branding.
          </Typography>
          {subNames.map((name, index) => (
            <TextField
              key={index}
              fullWidth
              placeholder={index === 0 ? "Health Insurance" : "Another sub-product"}
              value={name}
              onChange={(event) => setSubNames((current) => current.map((item, i) => (i === index ? event.target.value : item)))}
            />
          ))}
          <Box>
            <Button startIcon={<Add />} onClick={() => setSubNames((current) => [...current, ""])}>
              Add another
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button disabled={busy} onClick={() => void saveSubs(true)}>
              Skip for now
            </Button>
            <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void saveSubs(false)}>
              Save and Continue
            </Button>
          </Box>
        </Box>
      ) : null}

      {step === "social" ? (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          {SOCIALS.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                py: 1,
                borderBottom: `1px solid ${SURFACE.border}`,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
                {connected[item.id] ? (
                  <Typography sx={{ ...TYPE.body, color: "#1F8A80", fontSize: 13 }}>{connected[item.id]}</Typography>
                ) : null}
              </Box>
              <Button size="small" variant={connected[item.id] ? "outlined" : "contained"} onClick={() => setConnectFor(item.id)}>
                {connected[item.id] ? "Connected" : "Connect"}
              </Button>
            </Box>
          ))}
          {connectFor ? (
            <Box sx={{ display: "grid", gap: 1.25, p: 1.5, borderRadius: "14px", backgroundColor: SURFACE.well }}>
              <TextField label="Handle" fullWidth placeholder="@yourbrand" value={handle} onChange={(event) => setHandle(event.target.value)} />
              <TextField
                label="Profile URL"
                fullWidth
                placeholder="https://www.instagram.com/yourbrand"
                value={profileUrl}
                onChange={(event) => setProfileUrl(event.target.value)}
              />
              <Typography sx={{ ...TYPE.label }}>Where should this account be available?</Typography>
              <RadioGroup value={socialScope} onChange={(event) => setSocialScope(event.target.value as typeof socialScope)}>
                <FormControlLabel value="product" control={<Radio />} label={productName || "This product"} />
                <FormControlLabel value="sub_products" control={<Radio />} label="Selected sub-products" />
                <FormControlLabel value="company" control={<Radio />} label="Entire company" />
              </RadioGroup>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={() => setConnectFor(null)}>Cancel</Button>
                <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void connectAccount()}>
                  Save
                </Button>
              </Box>
            </Box>
          ) : null}
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button onClick={() => setStep("team")}>Skip for now</Button>
            <Button variant="contained" sx={{ borderRadius: "999px" }} onClick={() => setStep("team")}>
              Continue
            </Button>
          </Box>
        </Box>
      ) : null}

      {step === "team" ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField label="Email" fullWidth placeholder="alex@example.com" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} />
          <TextField select fullWidth label="Role" value={inviteRole} onChange={(event) => setInviteRole(event.target.value as ProductInviteRole)}>
            {ROLES.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Access" fullWidth value={productName || "First product"} disabled />
          <Button onClick={() => setDetailsOpen((open) => !open)}>Customize permissions</Button>
          <Collapse in={detailsOpen}>
            <Typography sx={{ ...TYPE.body, color: "text.secondary" }}>
              Creator generates and edits content. Approver reviews. Publisher schedules. Analyst views analytics. Product Manager manages the assigned product. Advanced permission matrices are not in the current API.
            </Typography>
          </Collapse>
          {invited ? (
            <Alert severity="success">{invited} invitation{invited === 1 ? "" : "s"} sent.</Alert>
          ) : null}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button disabled={busy} onClick={() => setStep("ready")}>
              Skip for now
            </Button>
            <Button variant="outlined" disabled={busy} onClick={() => void sendInvite()}>
              Send invitation
            </Button>
            <Button variant="contained" sx={{ borderRadius: "999px" }} onClick={() => setStep("ready")}>
              Continue
            </Button>
          </Box>
        </Box>
      ) : null}

      {step === "ready" ? (
        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Row label="Company" value={summary.company} />
          <Row label="Product" value={summary.product} />
          <Row label="Brand profile" value="Completed" />
          <Row label="Sub-products" value={summary.subs ? `${summary.subs} added` : "Skipped"} />
          <Row label="Social accounts" value={summary.socials ? `${summary.socials} connected` : "Skipped"} />
          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" disabled={busy} onClick={() => void finish("/app/social/content")}>
              Create first content
            </Button>
            <Button variant="contained" sx={{ borderRadius: "999px" }} disabled={busy} onClick={() => void finish()}>
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      ) : null}

      <Button sx={{ mt: 3 }} onClick={logout}>
        Sign out
      </Button>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, borderBottom: `1px solid ${SURFACE.border}` }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
