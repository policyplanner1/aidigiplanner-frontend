import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { getContentFormat, type ContentFormatId } from "../../../constants/contentFormats";
import { CONTENT_FORMAT_ICONS } from "../../../constants/contentFormatIcons";
import { useBrandProfile } from "../../brand/hooks/useBrandProfile";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import {
  ensureBrandProductLineForGenerate,
  getBrandProfileForm,
  productLineApiId,
  productLineLabel,
} from "../../../services/brand/brandProfileService";
import {
  approveAndPublishConcept,
  conceptToDraft,
  runCreativeGeneration,
  runReelAssetRender,
  submitConceptForReview,
  toCreativeFormat,
  versionLabel,
  type CreativeConcept,
  type GenerationJob,
  type ReelStyle,
  type VoiceoverMode,
} from "../../../services/content/creativesApi";
import {
  generateContentDraft,
  getBestTimes,
  getWeekdays,
  saveSocialPost,
  type PublishStatus,
} from "../../../services/social/publishingService";
import { CreativePreview } from "../components/CreativePreview";
import { STAGE_GLASS } from "../components/StudioFlow";

const QUICK_FORMATS: ContentFormatId[] = ["post", "reel", "carousel", "story", "video", "campaign"];

function toggleItem<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

// There's no server-side progress percentage to poll -- generation is a
// single opaque job. These are rough real-world timings observed for this
// pipeline (ideation-only for reels/video since they stop at
// awaiting_render; ideation+image render for everything else), used to
// drive a believable progress curve rather than an indefinite spinner.
function estimatedGenerateMs(format: ContentFormatId): number {
  if (format === "reel" || format === "video") return 30_000;
  if (format === "carousel") return 100_000;
  return 75_000;
}
const ESTIMATED_RENDER_MS = 6 * 60_000;
// Never let the simulated bar claim "done" before the job actually is --
// it eases toward this ceiling and only the real completion fills the rest.
const PROGRESS_CEILING = 92;

export function ContentStudioPage() {
  const { currentProject, subProducts, currentSubProduct, setCurrentSubProductId } = useWorkspace();
  const { session } = useAuth();
  const { can } = usePermissions();
  const live = session?.source === "api";
  const profileQuery = useBrandProfile(currentProject?.id ?? "", currentProject?.name ?? "", live);
  const brandProfile = profileQuery.data ?? getBrandProfileForm(currentProject?.id ?? "none", currentProject?.name ?? "", live);

  const [format, setFormat] = useState<ContentFormatId>("post");
  const [platforms, setPlatforms] = useState<string[]>(["Instagram", "Facebook"]);
  const [brief, setBrief] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [productLine, setProductLine] = useState("");
  const [conceptCount, setConceptCount] = useState(3);
  const [customize, setCustomize] = useState(false);
  const [objective, setObjective] = useState("");
  const [offer, setOffer] = useState("");
  const [festival, setFestival] = useState("");
  const [toneOverride, setToneOverride] = useState("");
  const [audienceOverride, setAudienceOverride] = useState("");
  const [ctaOverride, setCtaOverride] = useState("");
  const [language, setLanguage] = useState("en");
  const [reelStyle, setReelStyle] = useState<ReelStyle>("story");
  const [voiceover, setVoiceover] = useState<VoiceoverMode>("silent_text");
  const [reelDurationS, setReelDurationS] = useState(15);
  const [dryRun, setDryRun] = useState(false);
  const [day, setDay] = useState("Wed");
  const [time, setTime] = useState("19:30");
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [concepts, setConcepts] = useState<CreativeConcept[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeSeverity, setNoticeSeverity] = useState<"success" | "error" | "info">("info");
  const [generating, setGenerating] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<number | null>(null);
  const [busyAction, setBusyAction] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<CreativeConcept | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimer.current !== null) window.clearInterval(progressTimer.current);
    };
  }, []);

  const productLineOptions = useMemo(
    () =>
      brandProfile.productLines
        .map((line) => {
          const id = productLineApiId(line);
          return id ? { id, label: productLineLabel(line) } : null;
        })
        .filter((item): item is { id: string; label: string } => Boolean(item)),
    [brandProfile.productLines],
  );
  const selectedProductLine =
    productLineOptions.some((item) => item.id === productLine) ? productLine : (productLineOptions[0]?.id ?? "");

  const meta = getContentFormat(format);
  const creativeFormat = toCreativeFormat(format);
  const isReel = creativeFormat === "reel" || creativeFormat === "video";
  const awaitingRender = job?.status === "awaiting_render";
  const channelOptions = meta.platforms;
  const channelLabel = platforms.join(", ") || "your channels";
  const times = useMemo(() => getBestTimes(platforms[0] ?? "Instagram"), [platforms]);

  if (!currentProject) {
    return <NeedProject feature="Content Studio" />;
  }

  const showNotice = (message: string | null, severity: "success" | "error" | "info" = "info") => {
    setNotice(message);
    setNoticeSeverity(severity);
  };

  const stopProgress = (finalValue?: number) => {
    if (progressTimer.current !== null) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    if (finalValue !== undefined) setProgress(finalValue);
  };

  const startProgress = (durationMs: number) => {
    stopProgress();
    const startedAt = Date.now();
    setProgress(2);
    progressTimer.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const eased = PROGRESS_CEILING * (1 - Math.exp(-elapsed / durationMs));
      setProgress(Math.min(PROGRESS_CEILING, Math.round(eased)));
    }, 250);
  };

  const generate = async (noteExtra = "") => {
    showNotice(null);
    if (platforms.length === 0) {
      showNotice("Choose at least one social platform.", "error");
      return;
    }
    if (brief.trim().length < 3) {
      showNotice("Write a slightly longer topic before generating.", "error");
      return;
    }
    if (live && profileQuery.isLoading) {
      showNotice("Loading brand profile…", "info");
      return;
    }

    setGenerating(true);
    setConcepts([]);
    setJob(null);
    startProgress(estimatedGenerateMs(format));

    const notes = [extraNotes.trim() || brief.trim(), noteExtra.trim()].filter(Boolean).join("\n");

    try {
      if (live) {
        const productLineId =
          selectedProductLine || (await ensureBrandProductLineForGenerate(currentProject.id, currentProject.name));
        const result = await runCreativeGeneration(
          {
            projectId: currentProject.id,
            brief,
            format,
            productLine: productLineId,
            language,
            extraNotes: notes,
            conceptCount: isReel ? 1 : conceptCount,
            platforms,
            subProductId: currentSubProduct?.id,
            objective,
            offer,
            festivalOccasion: festival,
            audienceOverride,
            toneOverride: toneOverride ? toneOverride.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
            ctaOverride,
            reelStyle: isReel ? reelStyle : undefined,
            voiceover: isReel ? voiceover : undefined,
            reelDurationS: isReel ? reelDurationS : undefined,
            dryRun,
          },
          setJob,
        );
        setJob(result.job);
        setConcepts(result.concepts);
        if (result.job.status === "awaiting_render") {
          showNotice(
            "Script is ready. Review the scenes, then render video. Video generation is billed separately.",
            "success",
          );
        } else if (result.job.status === "partially_failed") {
          showNotice(
            result.job.error_message
              ? `Generated with some issues: ${result.job.error_message}`
              : "Generated with some issues.",
            "error",
          );
        } else if (result.job.status === "succeeded") {
          showNotice("Generation complete.", "success");
        }
      } else {
        const draft = generateContentDraft({
          brief,
          format,
          platform: channelLabel,
          voice: brandProfile.voice,
          audience: brandProfile.audience,
        });
        setJob({
          id: "local",
          brief_id: "local",
          project_id: currentProject.id,
          status: "succeeded",
          estimated_cost_inr: 0,
          actual_cost_inr: 0,
          error_message: null,
        });
        setConcepts(
          (["Professional", "Engaging", "Creative"] as const).map((angle, index) => ({
            id: `local_${index}`,
            job_id: "local",
            concept_index: index,
            angle,
            hook: draft.hook,
            caption: draft.caption,
            hashtags: draft.hashtags.split(/\s+/).filter(Boolean),
            cta: draft.cta,
            on_image_headline: draft.title,
            on_image_subhead: meta.hint,
            on_image_kicker: versionLabel(index),
            image_prompt: "",
            negative_prompt: "",
            reel_script: draft.script ? { script: draft.script } : null,
            carousel_slides: null,
            disclaimer_line: "",
            compliance_notes: [],
            assets: [],
          })),
        );
      }
    } catch (error) {
      showNotice(getApiErrorMessage(error), "error");
    } finally {
      stopProgress(100);
      setGenerating(false);
    }
  };

  const renderVideo = async () => {
    if (!job || job.status !== "awaiting_render") return;
    setRendering(true);
    startProgress(ESTIMATED_RENDER_MS);
    showNotice("Rendering video clips. This can take a few minutes.", "info");
    try {
      const result = await runReelAssetRender({ projectId: currentProject.id, jobId: job.id }, setJob);
      setJob(result.job);
      setConcepts(result.concepts);
      if (result.job.status === "succeeded") {
        showNotice("Reel video is ready.", "success");
      } else if (result.job.status === "partially_failed") {
        showNotice(
          result.job.error_message
            ? `Render failed: ${result.job.error_message}`
            : "Render finished with some missing clips.",
          "error",
        );
      } else {
        showNotice(result.job.error_message || "Render finished, but no video was produced.", "error");
      }
    } catch (error) {
      showNotice(getApiErrorMessage(error), "error");
    } finally {
      stopProgress(100);
      setRendering(false);
    }
  };

  const persistLocal = (status: PublishStatus, message: string, concept: CreativeConcept) => {
    const draft = conceptToDraft(concept);
    platforms.forEach((platform, platformIndex) => {
      saveSocialPost({
        projectId: currentProject.id,
        campaignId: null,
        format,
        platform,
        title: draft.title,
        caption: draft.caption,
        hashtags: draft.hashtags,
        hook: draft.hook,
        script: draft.script,
        cta: draft.cta,
        day,
        time,
        status,
        id: `post_${Date.now()}_${concept.id}_${platformIndex}`,
      });
    });
    showNotice(message, "success");
  };

  const runOnConcept = async (
    concept: CreativeConcept,
    action: "draft" | "review" | "publish",
  ) => {
    setBusyAction(true);
    showNotice(null);
    try {
      if (live && concept.id && !concept.id.startsWith("local_")) {
        if (action === "review") await submitConceptForReview(currentProject.id, concept.id);
        if (action === "publish") await approveAndPublishConcept(currentProject.id, concept.id);
      }
      persistLocal(
        action === "publish" ? "published" : action === "review" ? "in_review" : "draft",
        action === "publish"
          ? "Approved and published."
          : action === "review"
            ? "Sent for approval."
            : "Saved as draft.",
        concept,
      );
    } catch (error) {
      showNotice(getApiErrorMessage(error), "error");
    } finally {
      setBusyAction(false);
    }
  };

  const contextChips = [
    currentProject.name,
    currentSubProduct?.name,
    brandProfile.language || language,
    brandProfile.voice,
    brandProfile.audience,
  ].filter(Boolean);

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow={`Quick Create · ${currentProject.name}`}
          title="What would you like to create?"
          description="The current product is already selected. Brand colours, tone, audience, and compliance are added automatically."
        />

        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", lg: "0.95fr 1.05fr" },
          }}
        >
          <Box sx={{ ...STAGE_GLASS, p: 3, borderRadius: "20px" }}>
            <Typography sx={{ fontWeight: 800, mb: 1.25 }}>Content format</Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2.5 }}>
              {QUICK_FORMATS.map((id) => {
                const Icon = CONTENT_FORMAT_ICONS[id];
                return (
                  <Chip
                    key={id}
                    icon={<Icon fontSize="small" />}
                    label={getContentFormat(id).label}
                    color={format === id ? "secondary" : "default"}
                    onClick={() => {
                      setFormat(id);
                      const allowed = getContentFormat(id).platforms as readonly string[];
                      setPlatforms((current) => current.filter((item) => allowed.includes(item)));
                    }}
                  />
                );
              })}
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Topic"
              placeholder="Explain why young families need health insurance"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
            />

            {isReel ? (
              <Box sx={{ display: "grid", gap: 1.5, mt: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Reel style"
                  value={reelStyle}
                  onChange={(event) => setReelStyle(event.target.value as ReelStyle)}
                  helperText={
                    reelStyle === "avatar"
                      ? "Uses the reel avatar from Brand Profile Identity. Upload one before generating."
                      : "Each concept uses its own cover image as the first frame."
                  }
                >
                  <MenuItem value="story">Story — cover image as the face of each scene</MenuItem>
                  <MenuItem value="avatar">Avatar — one uploaded face across every scene</MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Voiceover"
                  value={voiceover}
                  onChange={(event) => setVoiceover(event.target.value as VoiceoverMode)}
                  helperText={
                    voiceover === "native_audio"
                      ? "Requires Gemini Enterprise/Vertex AI access — fails on a standard Gemini Developer API key."
                      : "Recommended for this environment — works with a standard Gemini API key."
                  }
                >
                  <MenuItem value="silent_text">Silent text — cheaper, spoken lines on screen</MenuItem>
                  <MenuItem value="native_audio">Native audio — Veo with real speech</MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Reel duration"
                  value={reelDurationS}
                  onChange={(event) => setReelDurationS(Number(event.target.value))}
                >
                  {[4, 8, 10, 15, 20, 25, 30].map((seconds) => (
                    <MenuItem key={seconds} value={seconds}>
                      {seconds} seconds
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            ) : null}

            <Typography sx={{ fontWeight: 800, mt: 2.5, mb: 1 }}>Where should it be posted?</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
              {channelOptions.map((item) => (
                <FormControlLabel
                  key={item}
                  control={
                    <Checkbox
                      checked={platforms.includes(item)}
                      onChange={() => setPlatforms((current) => toggleItem(current, item))}
                    />
                  }
                  label={item}
                />
              ))}
            </Box>

            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
              {contextChips.map((item) => (
                <Chip key={item} size="small" label={item} />
              ))}
            </Box>

            <Button onClick={() => setCustomize((open) => !open)} sx={{ mb: 1.5, alignSelf: "flex-start" }}>
              {customize ? "Hide customize content" : "Customize content"}
            </Button>
            <Collapse in={customize}>
              <Box sx={{ display: "grid", gap: 1.5, mb: 2 }}>
                {subProducts.length ? (
                  <TextField
                    select
                    fullWidth
                    label="Sub-product"
                    value={currentSubProduct?.id ?? ""}
                    onChange={(event) => setCurrentSubProductId(event.target.value || null)}
                  >
                    <MenuItem value="">All / product default</MenuItem>
                    {subProducts.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : null}
                <TextField
                  select
                  fullWidth
                  label="Product line"
                  value={selectedProductLine}
                  onChange={(event) => setProductLine(event.target.value)}
                >
                  {productLineOptions.length ? (
                    productLineOptions.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.label}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      Uses the product brand by default
                    </MenuItem>
                  )}
                </TextField>
                <TextField select fullWidth label="Language" value={language} onChange={(event) => setLanguage(event.target.value)}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="hinglish">Hinglish</MenuItem>
                </TextField>
                {isReel ? null : (
                  <TextField
                    select
                    fullWidth
                    label="Number of concepts"
                    helperText="How many versions to generate per topic"
                    value={conceptCount}
                    onChange={(event) => setConceptCount(Number(event.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map((count) => (
                      <MenuItem key={count} value={count}>
                        {count}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                <TextField fullWidth label="Content objective" placeholder="Drive quote requests from first-time buyers" value={objective} onChange={(event) => setObjective(event.target.value)} />
                <TextField fullWidth label="Tone" placeholder="Professional, educational" value={toneOverride} onChange={(event) => setToneOverride(event.target.value)} />
                <TextField fullWidth label="Target audience" placeholder="Young families aged 25–40 in India" value={audienceOverride} onChange={(event) => setAudienceOverride(event.target.value)} />
                <TextField fullWidth label="CTA" placeholder="Get a free quote" value={ctaOverride} onChange={(event) => setCtaOverride(event.target.value)} />
                <TextField fullWidth label="Offer" placeholder="First-year premium waiver" value={offer} onChange={(event) => setOffer(event.target.value)} />
                <TextField fullWidth label="Festival or occasion" placeholder="Diwali" value={festival} onChange={(event) => setFestival(event.target.value)} />
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Extra notes"
                  placeholder="Keep claims IRDAI-safe. No guaranteed returns."
                  value={extraNotes}
                  onChange={(event) => setExtraNotes(event.target.value)}
                />
                <FormControlLabel
                  control={<Checkbox checked={dryRun} onChange={(_, checked) => setDryRun(checked)} />}
                  label="Practice mode (mock render, no AI cost)"
                />
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  <TextField select fullWidth label="Publishing day" value={day} onChange={(event) => setDay(event.target.value)}>
                    {getWeekdays().map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Suggested time"
                    value={times.includes(time) ? time : times[0]}
                    onChange={(event) => setTime(event.target.value)}
                  >
                    {times.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </Collapse>

            <Button
              variant="contained"
              onClick={() => void generate()}
              disabled={generating || rendering || platforms.length === 0}
              sx={{ borderRadius: "999px", px: 2.5 }}
            >
              {generating ? "Generating..." : isReel ? "Generate script" : "Generate Content"}
            </Button>
          </Box>

          <Box sx={{ display: "grid", gap: 1.5, minWidth: 0 }}>
            {notice ? <Alert severity={noticeSeverity}>{notice}</Alert> : null}
            <CreativePreview
              projectId={currentProject.id}
              job={job}
              concepts={concepts}
              generating={generating || rendering}
              progress={progress}
              error={null}
              emptyHint={`${meta.label} will appear here after you generate.`}
              onRetry={(hint) => void generate(hint)}
              onSelect={setSelectedConcept}
            />
            {concepts.length || awaitingRender ? (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {awaitingRender ? (
                  <Button variant="contained" disabled={rendering || generating} onClick={() => void renderVideo()}>
                    {rendering ? "Rendering video…" : "Render video"}
                  </Button>
                ) : null}
                {can(PERMISSIONS.CONTENT_CREATE) ? (
                  <Button
                    variant="outlined"
                    disabled={busyAction}
                    onClick={() => void runOnConcept(selectedConcept ?? concepts[0], "draft")}
                  >
                    Save draft
                  </Button>
                ) : null}
                {can(PERMISSIONS.CONTENT_CREATE) ? (
                  <Button
                    variant="outlined"
                    disabled={busyAction}
                    onClick={() => void runOnConcept(selectedConcept ?? concepts[0], "review")}
                  >
                    Send for approval
                  </Button>
                ) : null}
                {can(PERMISSIONS.CONTENT_PUBLISH) || can(PERMISSIONS.CONTENT_APPROVE) ? (
                  <Button
                    variant="contained"
                    disabled={busyAction || awaitingRender}
                    onClick={() => void runOnConcept(selectedConcept ?? concepts[0], "publish")}
                  >
                    Approve and publish
                  </Button>
                ) : null}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </ScreenFrame>
  );
}
