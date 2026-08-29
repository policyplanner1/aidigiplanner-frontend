import { Add, ArrowBack, DeleteOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink, Navigate, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { SOCIAL_PLATFORMS } from "../../../constants/platforms";
import { useAuth } from "../../../hooks/useAuth";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { getApiErrorMessage } from "../../../services/api/errors";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import {
  BRAND_TRAITS,
  displayHost,
  emptyBrandKit,
  emptyProductLine,
  getBrandKit,
  getBrandKitScore,
  getBrandProfileSaveErrors,
  joinKitList,
  saveBrandKit,
  slugKitValue,
  splitKitList,
  type BrandKit,
} from "../../../services/brand/brandKitService";
import { useSocialAccounts } from "../../social/hooks/useSocialAccounts";
import { BrandAssetSlot } from "../components/BrandAssetSlot";
import { useBrandProfile, useSaveBrandProfile } from "../hooks/useBrandProfile";

const TABS = ["overview", "identity", "voice", "social"] as const;
type KitTab = (typeof TABS)[number];

const TRAITS = BRAND_TRAITS;

export function BrandKitWorkspacePage() {
  const { projectId } = useParams();
  const { projects, setCurrentProjectId } = useWorkspace();
  const project = projects.find((item) => item.id === projectId);

  useEffect(() => {
    if (project) setCurrentProjectId(project.id);
  }, [project, setCurrentProjectId]);

  if (!projectId) return <Navigate to="/app/brand-kit" replace />;
  if (!project) {
    return (
      <ScreenFrame>
        <PageHeader
          eyebrow="Brand board"
          title="Project not found"
          description="This brand kit belongs to a project that is not in your workspace."
          action={
            <Button component={RouterLink} to="/app/brand-kit">
              Back to Brand Kit
            </Button>
          }
        />
      </ScreenFrame>
    );
  }

  return <BrandKitWorkspace key={project.id} projectId={project.id} projectName={project.name} description={project.description} status={project.status} />;
}

function BrandKitWorkspace({
  projectId,
  projectName,
  description,
  status,
}: {
  projectId: string;
  projectName: string;
  description: string;
  status: string;
}) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const live = session?.source === "api";
  const listed = useBrandProfile(projectId, projectName, live);
  const saveLive = useSaveBrandProfile(projectId);
  const accountsQuery = useSocialAccounts(projectId);
  const [tab, setTab] = useState<KitTab>("overview");
  const [kit, setKit] = useState(() => (live ? emptyBrandKit(projectId) : getBrandKit(projectId, projectName)));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (listed.data) setKit(listed.data);
  }, [listed.data]);

  const score = getBrandKitScore(kit);
  const traits = splitKitList(kit.traits);
  const accounts = accountsQuery.data ?? [];
  const host = displayHost(kit);

  const update = <K extends keyof BrandKit>(key: K, value: BrandKit[K]) => {
    setSaved(false);
    setSaveError(null);
    setKit((current) => ({ ...current, projectId, [key]: value }));
  };

  const persistKit = async () => {
    const next = { ...kit, projectId };
    setSaveError(null);
    setAttemptedSave(true);
    if (!live) {
      saveBrandKit(next);
      setSaved(true);
      return;
    }
    const errors = getBrandProfileSaveErrors(next, projectName);
    if (errors.length) {
      setSaveError(errors.join(" "));
      return;
    }
    try {
      const savedKit = await saveLive.mutateAsync({ kit: next, projectName });
      setKit(savedKit);
      setSaved(true);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    }
  };

  const reanalyze = async () => {
    if (!live) return;
    if (!kit.websiteUrl.trim() && !kit.audience.trim()) {
      setSaveError("Add a website like https://www.example.com, then retry analysis.");
      return;
    }
    setAnalyzing(true);
    setSaveError(null);
    try {
      await onboardingApi.analyzeProductBrand(projectId, {
        website_url: kit.websiteUrl.trim() || undefined,
        description: kit.audience.trim() || undefined,
        dry_run: false,
      });
      await listed.refetch();
      setSaved(true);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleTrait = (trait: string) => {
    const next = traits.includes(trait) ? traits.filter((item) => item !== trait) : [...traits, trait];
    update("traits", joinKitList(next));
  };

  const updateCompliance = (value: string) => {
    setSaved(false);
    setSaveError(null);
    setKit((current) => ({ ...current, projectId, contentRules: value, bannedWords: value }));
  };

  const addProductLine = () => {
    update("productLines", [...kit.productLines, emptyProductLine(kit.productLines.length + 1)]);
  };

  const removeProductLine = (index: number) => {
    update("productLines", kit.productLines.filter((_, lineIndex) => lineIndex !== index));
  };

  const updateProductLineName = (index: number, value: string) => {
    update(
      "productLines",
      kit.productLines.map((line, lineIndex) => {
        if (lineIndex !== index) return line;
        const previousSlug = slugKitValue(line.label || line.id);
        const keepId = line.id.trim() && line.id !== previousSlug;
        return {
          ...line,
          label: value,
          id: keepId ? line.id : slugKitValue(value),
        };
      }),
    );
  };

  if (live && listed.isLoading && !listed.data) {
    return (
      <ScreenFrame>
        <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
          <CircularProgress size={28} />
        </Box>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2 }}>
        <PageHeader
          eyebrow={`Brand Kit · ${projectName}`}
          title={projectName}
          description="Voice, colors, audience and rules that guide all AI content for this project only."
          action={
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/brand-kit")}>
                All projects
              </Button>
              {live ? (
                <Button variant="outlined" disabled={analyzing} onClick={() => void reanalyze()}>
                  {analyzing ? "Analysing…" : "Retry analysis"}
                </Button>
              ) : null}
              <Button variant="contained" disabled={saveLive.isPending} onClick={() => void persistKit()}>
                {saveLive.isPending ? "Saving…" : "Save kit"}
              </Button>
            </Box>
          }
          stats={[
            { label: "Complete", value: `${score}%` },
            { label: "Languages", value: splitKitList(kit.language).length },
            { label: "Accounts", value: accounts.filter((item) => item.status === "connected").length },
          ]}
        />

        <Box sx={{ ...GLASS_SX, px: 1.5, pt: 0.5, borderRadius: 1 }}>
          <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 13, color: "#1F8A80", px: 1, pt: 1 }}>
            {host || "Add a domain in Overview"}
          </Typography>
          <Tabs
            value={tab}
            onChange={(_event, value: KitTab) => setTab(value)}
            variant="scrollable"
            sx={{ minHeight: 44, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 44 } }}
          >
            <Tab value="overview" label="Overview" />
            <Tab value="identity" label="Identity" />
            <Tab value="voice" label="Voice" />
            <Tab value="social" label="Social" />
          </Tabs>
        </Box>

        {listed.isError ? <Alert severity="error">{getApiErrorMessage(listed.error)}</Alert> : null}
        {saveError ? <Alert severity="error">{saveError}</Alert> : null}
        {saved ? <Alert severity="success">Brand kit saved for {projectName}. Content and agents will use this project only.</Alert> : null}

        {tab === "overview" ? (
          <Panel title="Brand information">
              <TextField label="Product name" fullWidth value={projectName} disabled placeholder="Policy Planner" />
              <TextField label="Website" fullWidth value={kit.websiteUrl} placeholder="https://www.example.com" onChange={(event) => update("websiteUrl", event.target.value)} />
              <TextField
                label="Domains"
                fullWidth
                placeholder="example.com, www.example.com"
                helperText="Comma-separated. One product can have several domains."
                value={kit.domains}
                onChange={(event) => update("domains", event.target.value)}
              />
              <TextField label="Description" fullWidth multiline minRows={2} value={description} disabled placeholder="We help families plan health and life insurance." />
              <TextField
                label="Target audience"
                required
                fullWidth
                placeholder="Young families aged 25–40 in India"
                value={kit.audience}
                onChange={(event) => update("audience", event.target.value)}
                error={attemptedSave && live && !kit.audience.trim()}
              />
              <TextField label="Secondary audience" fullWidth placeholder="NRIs, small business owners" value={kit.audienceSecondary} onChange={(event) => update("audienceSecondary", event.target.value)} />
              <Typography sx={{ ...TYPE.label }}>Product lines</Typography>
              {kit.productLines.length === 0 ? (
                <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 14, color: "#8A6F64" }}>
                  No product lines yet.
                </Typography>
              ) : (
                kit.productLines.map((line, index) => (
                  <Box key={`${line.id || "new"}-${index}`} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <TextField
                      label={index === 0 ? "Product line" : undefined}
                      fullWidth
                      placeholder="Health Insurance"
                      value={line.label || line.id}
                      onChange={(event) => updateProductLineName(index, event.target.value)}
                    />
                    <IconButton aria-label="Remove product line" onClick={() => removeProductLine(index)} sx={{ mt: index === 0 ? 0.5 : 0 }}>
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              )}
              <Box>
                <Button startIcon={<Add />} variant="outlined" onClick={addProductLine} sx={{ borderRadius: "999px" }}>
                  Add product line
                </Button>
              </Box>
              <TextField
                label="Compliance rules"
                fullWidth
                multiline
                minRows={3}
                placeholder="Avoid guaranteed returns. Add IRDAI-safe disclaimers where needed."
                helperText="Optional. Banned claims, disclaimers, and other rules."
                value={kit.contentRules || kit.bannedWords}
                onChange={(event) => updateCompliance(event.target.value)}
              />
              <Typography sx={{ ...TYPE.label, color: "text.secondary" }}>Status · {status}</Typography>
              {live ? (
                <Box>
                  <Button variant="outlined" disabled={analyzing} onClick={() => void reanalyze()} sx={{ borderRadius: "999px" }}>
                    {analyzing ? "Analysing website…" : "Retry website analysis"}
                  </Button>
                </Box>
              ) : null}
            </Panel>
        ) : null}

        {tab === "identity" ? (
          <Panel title="Identity">
              <TextField label="Brand voice" fullWidth multiline minRows={2} placeholder="Warm, expert, and easy to trust." value={kit.voice} onChange={(event) => update("voice", event.target.value)} />
              <TextField
                label="Target audience"
                required
                fullWidth
                placeholder="Young families aged 25–40 in India"
                value={kit.audience}
                onChange={(event) => update("audience", event.target.value)}
                error={attemptedSave && live && !kit.audience.trim()}
              />
              <TextField label="Secondary audience" fullWidth placeholder="NRIs, small business owners" value={kit.audienceSecondary} onChange={(event) => update("audienceSecondary", event.target.value)} />
              <TextField
                label="Languages"
                required
                fullWidth
                placeholder="en, hi"
                value={kit.language}
                onChange={(event) => update("language", event.target.value)}
                error={attemptedSave && live && splitKitList(kit.language).length === 0}
                helperText="Required. Example: en, hi."
              />
              <Typography sx={{ ...TYPE.label }}>Visual identity</Typography>
              <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}>
                <BrandAssetSlot projectId={projectId} kind="logo" label="Logo" hint="PNG, JPEG, or WEBP" />
                <BrandAssetSlot projectId={projectId} kind="icon-light" label="Light icon" hint="For dark backgrounds" />
                <BrandAssetSlot projectId={projectId} kind="icon-dark" label="Dark icon" hint="For light backgrounds" />
                <BrandAssetSlot projectId={projectId} kind="avatar" label="Reel avatar" hint="Required for avatar-style reels" />
              </Box>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                <ColorField label="Primary color" value={kit.primaryColor} onChange={(value) => update("primaryColor", value)} />
                <ColorField label="Secondary color" value={kit.secondaryColor} onChange={(value) => update("secondaryColor", value)} />
              </Box>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                <TextField label="Heading font" fullWidth placeholder="Outfit" value={kit.headingFont} onChange={(event) => update("headingFont", event.target.value)} />
                <TextField label="Body font" fullWidth placeholder="Outfit" value={kit.bodyFont} onChange={(event) => update("bodyFont", event.target.value)} />
              </Box>
              <TextField label="Image style" fullWidth placeholder="Warm photography, real people, high contrast type" value={kit.imageStyle} onChange={(event) => update("imageStyle", event.target.value)} />
            </Panel>
        ) : null}

        {tab === "voice" ? (
          <Panel title="Brand voice">
            <Typography sx={{ ...TYPE.label }}>Traits</Typography>
            <FormGroup row>
              {TRAITS.map((trait) => (
                <FormControlLabel
                  key={trait}
                  control={<Checkbox checked={traits.includes(trait)} onChange={() => toggleTrait(trait)} />}
                  label={trait}
                />
              ))}
            </FormGroup>
            <TextField
              label="Tone"
              required
              fullWidth
              placeholder="Clear and educational"
              value={kit.tone}
              onChange={(event) => update("tone", event.target.value)}
              error={attemptedSave && live && splitKitList(kit.traits).length + splitKitList(kit.tone).length === 0}
              helperText="Required unless you pick traits above."
            />
            <TextField label="Avoid" fullWidth multiline minRows={2} placeholder="Jargon, guaranteed returns, aggressive sales language" value={kit.avoid} onChange={(event) => update("avoid", event.target.value)} helperText="Phrasing the agents should stay away from." />
            <TextField label="Brand voice" fullWidth multiline minRows={3} placeholder="Speak like a trusted advisor. Keep claims IRDAI-safe." value={kit.voice} onChange={(event) => update("voice", event.target.value)} />
          </Panel>
        ) : null}

        {tab === "social" ? (
          <Panel title="Social accounts">
            <Typography sx={{ ...TYPE.body, color: "text.secondary" }}>
              Connected accounts for {projectName}. Disconnect or add more from Accounts.
            </Typography>
            {accounts.filter((item) => item.status === "connected" && item.platform !== "tiktok" && item.platform !== "whatsapp").length === 0 ? (
              <Box>
                <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 14, color: "#8A6F64" }}>
                  No accounts connected yet.
                </Typography>
                <Button sx={{ mt: 1.5 }} onClick={() => navigate("/app/social/accounts")}>
                  Connect accounts
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 1 }}>
                {accounts
                  .filter((item) => item.status === "connected" && item.platform !== "tiktok" && item.platform !== "whatsapp")
                  .map((account) => {
                    const label = SOCIAL_PLATFORMS.find((item) => item.id === account.platform)?.label ?? account.platform;
                    return (
                      <Box
                        key={account.id}
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
                          <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
                          <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 12, color: "#1F8A80" }}>
                            Connected · {account.handle ?? account.accountName}
                          </Typography>
                        </Box>
                        <Button size="small" onClick={() => navigate("/app/social/accounts")}>
                          Manage
                        </Button>
                      </Box>
                    );
                  })}
              </Box>
            )}
          </Panel>
        ) : null}
      </Box>
    </ScreenFrame>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ ...GLASS_SX, p: { xs: 2.25, md: 3 }, borderRadius: 1, display: "grid", gap: 2 }}>
      <Typography sx={{ ...TYPE.section, fontWeight: 700 }}>{title}</Typography>
      {children}
    </Box>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const hex = safeHex(value);
  return (
    <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
      <Box
        component="label"
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          backgroundColor: hex,
          border: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <input
          type="color"
          value={hex}
          aria-label={label}
          onChange={(event) => onChange(event.target.value)}
          style={{ opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
        />
      </Box>
      <TextField label={label} fullWidth placeholder="#FF6B45" value={value} onChange={(event) => onChange(event.target.value)} />
    </Box>
  );
}

function safeHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value.trim()) ? value.trim() : "#FF6B45";
}
