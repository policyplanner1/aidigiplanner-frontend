import { apiClient } from "../api/client";
import { productFirst } from "../api/productFirst";
import type { ContentFormatId } from "../../constants/contentFormats";

export type CreativeFormat = "post" | "carousel" | "reel" | "story" | "video";
export type CreativeLanguage = "en" | "hi" | "hinglish";
export type CreativeQuality = "draft" | "standard" | "hero";
export type ReelStyle = "story" | "avatar";
export type VoiceoverMode = "native_audio" | "silent_text";
export type GenerationJobStatus =
  | "queued"
  | "running"
  | "awaiting_render"
  | "succeeded"
  | "failed"
  | "partially_failed";

export type GenerationJob = {
  id: string;
  brief_id: string;
  project_id: string;
  company_id?: string;
  status: GenerationJobStatus;
  prompt_version?: string;
  dry_run?: boolean;
  estimated_cost_inr: number | null;
  actual_cost_inr: number | null;
  error_message: string | null;
  requested_by?: string;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CreativeAsset = {
  id: string;
  concept_id: string;
  kind: string;
  label: string;
  model_id: string;
  mime_type: string;
  estimated_cost_inr: number | null;
  actual_cost_inr: number | null;
  generated_at: string;
};

export type ContentComment = {
  id: string;
  concept_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type CreativeConceptStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected"
  | "scheduled"
  | "published";

export type CreativeConcept = {
  id: string;
  job_id: string;
  concept_index: number;
  angle: string;
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
  on_image_headline: string;
  on_image_subhead: string;
  on_image_kicker: string;
  image_prompt: string;
  negative_prompt: string;
  reel_script: Record<string, unknown> | null;
  carousel_slides: Array<Record<string, unknown>> | null;
  disclaimer_line: string;
  compliance_notes: string[];
  assets: CreativeAsset[];
  status?: CreativeConceptStatus | string;
  scheduled_at?: string | null;
  published_at?: string | null;
  suggested_posting_time?: string | null;
};

export type GenerateCreativesRequest = {
  product_line: string;
  topic: string;
  format: CreativeFormat;
  language?: CreativeLanguage;
  concept_count?: number;
  quality?: CreativeQuality;
  extra_notes?: string;
  force?: boolean;
  dry_run?: boolean;
  carousel_slides?: number;
  reel_duration_s?: number;
  reel_style?: ReelStyle;
  voiceover?: VoiceoverMode;
  platforms?: string[];
  sub_product_id?: string;
  objective?: string;
  offer?: string;
  festival_occasion?: string;
  audience_override?: string;
  tone_override?: string[];
  cta_override?: string;
};

export const VERSION_LABELS = ["Professional", "Engaging", "Creative"] as const;

export function versionLabel(index: number) {
  return VERSION_LABELS[index] ?? `Version ${index + 1}`;
}

export function toApiPlatform(label: string) {
  const key = label.trim().toLowerCase();
  if (key.includes("instagram")) return "instagram";
  if (key.includes("facebook")) return "facebook";
  if (key.includes("youtube")) return "youtube";
  if (key.includes("google")) return "google";
  if (key.includes("twitter") || key === "x") return "twitter";
  if (key.includes("linkedin")) return "linkedin";
  return "";
}

export function toCreativeFormat(format: ContentFormatId): CreativeFormat {
  if (format === "carousel") return "carousel";
  if (format === "reel") return "reel";
  if (format === "story") return "story";
  if (format === "video" || format === "short") return "video";
  return "post";
}

export function toCreativeLanguage(value: string): CreativeLanguage {
  const text = value.toLowerCase();
  if (text.includes("hinglish")) return "hinglish";
  if (text.includes("hindi") || text === "hi") return "hi";
  return "en";
}

export function slugProductLine(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return slug || "general";
}

export function jobStatusLabel(status: GenerationJobStatus) {
  if (status === "queued") return "Queued — waiting to start";
  if (status === "running") return "Generating…";
  if (status === "awaiting_render") return "Script ready — render video when you approve it";
  if (status === "succeeded") return "Generation complete";
  if (status === "partially_failed") return "Generated with some issues";
  return "Generation failed";
}

export function formatInr(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function primaryAsset(concept: CreativeConcept | null) {
  if (!concept?.assets?.length) return null;
  return (
    concept.assets.find((item) => item.kind === "video") ??
    concept.assets.find((item) => item.kind === "image") ??
    concept.assets[0] ??
    null
  );
}

export function formatReelScript(script: Record<string, unknown> | null | undefined) {
  if (!script) return "";
  const scenes = Array.isArray(script.scenes) ? script.scenes : null;
  if (scenes?.length) {
    return scenes
      .map((scene, index) => {
        const row = scene && typeof scene === "object" ? (scene as Record<string, unknown>) : {};
        const vo = String(row.vo_line ?? row.vo ?? "").trim();
        const text = String(row.on_screen_text ?? "").trim();
        const duration = row.duration_s != null ? `${row.duration_s}s` : "";
        const prompt = String(row.visual_prompt ?? "").trim();
        return [
          `Scene ${index + 1}${duration ? ` · ${duration}` : ""}`,
          vo,
          text ? `On screen: ${text}` : "",
          prompt ? `Visual: ${prompt}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");
  }
  return Object.entries(script)
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join("\n");
}

export async function generateCreatives(projectId: string, body: GenerateCreativesRequest) {
  return productFirst<GenerationJob>(projectId, "/creatives/generate", (path) => apiClient.post(path, body));
}

export async function renderCreativeAssets(projectId: string, jobId: string) {
  return productFirst<GenerationJob>(projectId, `/creatives/jobs/${jobId}/render-assets`, (path) =>
    apiClient.post(path),
  );
}

export async function getGenerationJob(projectId: string, jobId: string) {
  return productFirst<GenerationJob>(projectId, `/creatives/jobs/${jobId}`, (path) => apiClient.get(path));
}

export async function listCreativeConcepts(projectId: string, jobId?: string, status?: string) {
  const params: Record<string, string> = {};
  if (jobId) params.job_id = jobId;
  if (status) params.status = status;
  return productFirst<CreativeConcept[]>(projectId, "/creatives", (path) => apiClient.get(path, { params }));
}

export async function getCreativeConcept(projectId: string, conceptId: string) {
  return productFirst<CreativeConcept>(projectId, `/creatives/concepts/${conceptId}`, (path) => apiClient.get(path));
}

export async function downloadCreativeAsset(projectId: string, assetId: string) {
  const response = await productFirst<Blob>(projectId, `/creatives/assets/${assetId}/download`, (path) =>
    apiClient.get(path, { responseType: "blob" }),
  );
  return URL.createObjectURL(response.data);
}

export function submitConceptForReview(productId: string, conceptId: string) {
  return productFirst(productId, `/creatives/concepts/${conceptId}/submit-for-review`, (path) => apiClient.post(path));
}

export function approveConcept(productId: string, conceptId: string) {
  return productFirst(productId, `/creatives/concepts/${conceptId}/approve`, (path) => apiClient.post(path));
}

export function rejectConcept(productId: string, conceptId: string, reason: string) {
  return productFirst(productId, `/creatives/concepts/${conceptId}/reject`, (path) =>
    apiClient.post(path, { reason }),
  );
}

export function scheduleConcept(
  productId: string,
  conceptId: string,
  options: string | { scheduled_at?: string; use_suggested_time?: boolean },
) {
  const body = typeof options === "string" ? { scheduled_at: options } : options;
  return productFirst(productId, `/creatives/concepts/${conceptId}/schedule`, (path) =>
    apiClient.post(path, body),
  );
}

export function publishConcept(productId: string, conceptId: string) {
  return productFirst(productId, `/creatives/concepts/${conceptId}/publish`, (path) => apiClient.post(path));
}

export function approveAndPublishConcept(productId: string, conceptId: string) {
  return productFirst(productId, `/creatives/concepts/${conceptId}/approve-and-publish`, (path) =>
    apiClient.post(path),
  );
}

export function listConceptComments(productId: string, conceptId: string) {
  return productFirst<ContentComment[]>(productId, `/creatives/concepts/${conceptId}/comments`, (path) =>
    apiClient.get(path),
  );
}

export function addConceptComment(productId: string, conceptId: string, body: string) {
  return productFirst<ContentComment>(productId, `/creatives/concepts/${conceptId}/comments`, (path) =>
    apiClient.post(path, { body }),
  );
}

export async function waitForGenerationJob(
  projectId: string,
  jobId: string,
  onJob?: (job: GenerationJob) => void,
  timeoutMs = 300_000,
) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const { data } = await getGenerationJob(projectId, jobId);
    onJob?.(data);
    if (data.status === "failed") {
      throw new Error(data.error_message || "Creative generation failed.");
    }
    if (data.status === "succeeded" || data.status === "awaiting_render" || data.status === "partially_failed") {
      return data;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 2000));
  }
  throw new Error("Generation is still running. Try again in a moment.");
}

export async function runCreativeGeneration(
  input: {
    projectId: string;
    brief: string;
    format: ContentFormatId;
    productLine: string;
    language: string;
    extraNotes?: string;
    conceptCount?: number;
    platforms?: string[];
    subProductId?: string;
    objective?: string;
    offer?: string;
    festivalOccasion?: string;
    audienceOverride?: string;
    toneOverride?: string[];
    ctaOverride?: string;
    reelStyle?: ReelStyle;
    voiceover?: VoiceoverMode;
    reelDurationS?: number;
    dryRun?: boolean;
  },
  onJob?: (job: GenerationJob) => void,
) {
  const topic = input.brief.trim().slice(0, 300);
  if (topic.length < 3) {
    throw new Error("Write a slightly longer topic before generating.");
  }

  const rawLine = input.productLine.trim();
  const productLine = /[^a-zA-Z0-9_-]/.test(rawLine) ? slugProductLine(rawLine) : rawLine.slice(0, 100);
  if (!productLine) {
    throw new Error("This brand profile needs a product line before generating.");
  }

  const format = toCreativeFormat(input.format);
  const body: GenerateCreativesRequest = {
    product_line: productLine,
    topic,
    format,
    language: toCreativeLanguage(input.language),
    concept_count: input.conceptCount ?? 3,
    quality: "standard",
    extra_notes: input.extraNotes ?? "",
    force: true,
    dry_run: input.dryRun ?? false,
    platforms: (input.platforms ?? []).map(toApiPlatform).filter(Boolean),
    sub_product_id: input.subProductId || undefined,
    objective: input.objective || undefined,
    offer: input.offer || undefined,
    festival_occasion: input.festivalOccasion || undefined,
    audience_override: input.audienceOverride || undefined,
    tone_override: input.toneOverride?.length ? input.toneOverride : undefined,
    cta_override: input.ctaOverride || undefined,
  };
  if (format === "carousel") body.carousel_slides = 5;
  if (format === "reel") {
    body.reel_duration_s = input.reelDurationS ?? 15;
    body.reel_style = input.reelStyle ?? "story";
    body.voiceover = input.voiceover ?? "silent_text";
  }

  const { data: started } = await generateCreatives(input.projectId, body);
  onJob?.(started);

  const job = await waitForGenerationJob(input.projectId, started.id, onJob);
  const { data: concepts } = await listCreativeConcepts(input.projectId, job.id);
  const ordered = [...concepts].sort((a, b) => a.concept_index - b.concept_index);
  if (!ordered.length && job.status !== "awaiting_render") {
    throw new Error("The API generated a job, but no concepts came back yet.");
  }
  return { job, concepts: ordered };
}

export async function runReelAssetRender(
  input: { projectId: string; jobId: string },
  onJob?: (job: GenerationJob) => void,
) {
  const { data: started } = await renderCreativeAssets(input.projectId, input.jobId);
  onJob?.(started);
  const job = await waitForGenerationJob(input.projectId, started.id || input.jobId, onJob);
  const { data: concepts } = await listCreativeConcepts(input.projectId, job.id);
  const ordered = [...concepts].sort((a, b) => a.concept_index - b.concept_index);
  return { job, concepts: ordered };
}

export function conceptToDraft(concept: CreativeConcept) {
  const script = concept.carousel_slides?.length
    ? concept.carousel_slides
        .map((slide, index) => {
          const title = String(slide.title ?? slide.headline ?? slide.text ?? "").trim();
          return title ? `Slide ${index + 1}: ${title}` : `Slide ${index + 1}`;
        })
        .join("\n")
    : formatReelScript(concept.reel_script);

  return {
    title: concept.on_image_headline || concept.angle || "Draft",
    hook: concept.hook,
    caption: concept.caption,
    script,
    hashtags: concept.hashtags.join(" "),
    cta: concept.cta,
  };
}
