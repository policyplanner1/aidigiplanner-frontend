import type { BrandProfile, BrandProfileWrite, BrandVisualIdentity } from "./brandProfileApi";
import { getBrandProfile, saveBrandProfile } from "./brandProfileApi";

export const BRAND_TRAITS = ["Professional", "Trustworthy", "Friendly", "Warm", "Expert"] as const;

export type BrandProfileProductLine = {
  id: string;
  label: string;
  partners: string;
  hooks: string;
};

export type BrandProfileForm = {
  projectId: string;
  voice: string;
  audience: string;
  audienceSecondary: string;
  language: string;
  primaryColor: string;
  secondaryColor: string;
  pillars: string;
  bannedWords: string;
  websiteUrl: string;
  domains: string;
  headingFont: string;
  bodyFont: string;
  imageStyle: string;
  traits: string;
  tone: string;
  avoid: string;
  products: string;
  productLines: BrandProfileProductLine[];
  knowledgeNotes: string;
  knowledgeUrls: string;
  aiInstructions: string;
  contentRules: string;
  market: string;
  category: string;
  logoPath: string;
  mandatoryDisclaimer: string;
  secondaryDisclaimers: string;
  ctaBank: string;
  hashtagBank: string;
};

const KEY = "ai-growth-brand-profiles";

const REQUIRED_FIELDS: (keyof BrandProfileForm)[] = [
  "voice",
  "audience",
  "language",
  "primaryColor",
  "secondaryColor",
];

function readForms(): BrandProfileForm[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BrandProfileForm[];
  } catch {
    return [];
  }
}

export function websiteFromName(name: string) {
  const host = name.replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
  return host ? `${host}.com` : "";
}

export function emptyBrandProfileForm(projectId: string): BrandProfileForm {
  return {
    projectId,
    voice: "",
    audience: "",
    audienceSecondary: "",
    language: "",
    primaryColor: "#FF6B45",
    secondaryColor: "#1F8A80",
    pillars: "",
    bannedWords: "",
    websiteUrl: "",
    domains: "",
    headingFont: "",
    bodyFont: "",
    imageStyle: "",
    traits: "",
    tone: "",
    avoid: "",
    products: "",
    productLines: [],
    knowledgeNotes: "",
    knowledgeUrls: "",
    aiInstructions: "",
    contentRules: "",
    market: "",
    category: "",
    logoPath: "",
    mandatoryDisclaimer: "",
    secondaryDisclaimers: "",
    ctaBank: "",
    hashtagBank: "",
  };
}

export function defaultsForProject(projectId: string, name = ""): BrandProfileForm {
  const site = websiteFromName(name);
  return {
    ...emptyBrandProfileForm(projectId),
    voice: "Warm, expert, and IRDAI-safe. Speak like a trusted advisor.",
    audience: "25–40 year old salaried professionals in Pune",
    language: "English + Marathi mix",
    pillars: "Education, customer problems, product clarity, myth vs fact",
    bannedWords: "guaranteed return, risk-free, 100% profit",
    websiteUrl: site ? `https://${site}` : "",
    domains: site ? `${site}, www.${site}` : "",
    headingFont: "Outfit",
    bodyFont: "Outfit",
    imageStyle: "Warm photography, real people, high contrast type",
    traits: "Professional, Trustworthy, Friendly",
    tone: "Clear and educational",
    avoid: "Technical jargon, aggressive sales language",
    aiInstructions: "Stay inside this project's voice, audience, and banned claims. Never mix in another brand.",
    contentRules: "Every post should teach, clarify, or bust a myth. End with a useful next step.",
  };
}

export function getBrandProfileForm(projectId: string, projectName = "", live = false): BrandProfileForm {
  const found = readForms().find((form) => form.projectId === projectId);
  if (live) {
    return {
      ...emptyBrandProfileForm(projectId),
      projectId,
      productLines: found?.productLines ?? [],
    };
  }
  const base = defaultsForProject(projectId, projectName);
  return {
    ...base,
    ...found,
    projectId,
    productLines: found?.productLines ?? base.productLines,
  };
}

export function liveFormFromProfile(projectId: string, profile: BrandProfile | null): BrandProfileForm {
  if (!profile) return getBrandProfileForm(projectId, "", true);
  return { ...profileToForm(profile, emptyBrandProfileForm(projectId)), projectId };
}

export function getBrandProfileSaveErrors(form: BrandProfileForm, projectName: string): string[] {
  const errors: string[] = [];
  if (!projectName.trim()) errors.push("Project name is required.");
  if (!form.audience.trim()) errors.push("Primary audience is required.");
  if (splitProfileList(form.language).length === 0) errors.push("Add at least one language.");
  if (splitProfileList(form.traits).length + splitProfileList(form.tone).length === 0) {
    errors.push("Add a tone or at least one trait.");
  }
  return errors;
}

export function getBrandProfileScore(form: BrandProfileForm) {
  const filled = REQUIRED_FIELDS.filter((key) => String(form[key] ?? "").trim().length > 0).length;
  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}

export function getBrandProfileAssetCount(form: BrandProfileForm) {
  return splitProfileList(form.pillars).length + splitProfileList(form.domains).length + splitProfileList(form.products).length;
}

export function splitProfileList(value: string) {
  return value
    .split(/[,•\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinProfileList(items: string[]) {
  return items.filter(Boolean).join(", ");
}

export function slugProfileValue(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "general"
  );
}

export function emptyProductLine(_index = 1): BrandProfileProductLine {
  return {
    id: "",
    label: "",
    partners: "",
    hooks: "",
  };
}

function isPlaceholderLineId(value: string) {
  return /^line[_-]?\d+$/i.test(value.trim());
}

export function humanizeProductLine(value: string) {
  const text = value.trim();
  if (!text || isPlaceholderLineId(text)) return "";
  return text
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function productLineFromFields(id: string, label: string, partners = "", hooks = ""): BrandProfileProductLine | null {
  const rawId = id.trim();
  const rawLabel = label.trim();
  const slugSource = !rawId || isPlaceholderLineId(rawId) ? rawLabel : rawId;
  const apiId = slugSource && !isPlaceholderLineId(slugSource) ? slugProfileValue(slugSource) : "";
  const display = (rawLabel && !isPlaceholderLineId(rawLabel) ? rawLabel : humanizeProductLine(rawId || apiId)) || apiId;
  if (!apiId && !display) return null;
  return {
    id: apiId || slugProfileValue(display),
    label: display || apiId,
    partners,
    hooks,
  };
}

const PRODUCT_LINE_META = new Set(["id", "label", "name", "title", "slug", "key", "partners", "hooks", "description", "sku"]);

function productLinesFromRecord(raw: Record<string, unknown>): BrandProfileProductLine[] {
  const nestedKeys = Object.keys(raw).filter((key) => {
    if (PRODUCT_LINE_META.has(key)) return false;
    const value = raw[key];
    return typeof value === "string" || (value !== null && typeof value === "object");
  });
  const hasCanonical = Boolean(raw.id || raw.label || raw.name || raw.title || raw.slug || raw.key);

  if (!hasCanonical && nestedKeys.length) {
    return nestedKeys.flatMap((key) => {
      const value = raw[key];
      if (typeof value === "string") {
        const line = productLineFromFields(key, value);
        return line ? [line] : [];
      }
      if (value && typeof value === "object") {
        return productLinesFromRecord({ id: key, ...(value as Record<string, unknown>) });
      }
      const line = productLineFromFields(key, key);
      return line ? [line] : [];
    });
  }

  const line = productLineFromFields(
    String(raw.id ?? raw.slug ?? raw.key ?? ""),
    String(raw.label ?? raw.name ?? raw.title ?? ""),
    asStringArray(raw.partners).join(", "),
    asStringArray(raw.hooks).join(", "),
  );
  return line ? [line] : [];
}

export function normalizeProductLines(raw: unknown): BrandProfileProductLine[] {
  if (raw == null || raw === "") return [];
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return normalizeProductLines(JSON.parse(trimmed) as unknown);
      } catch {
        /* treat as a label list */
      }
    }
    return trimmed
      .split(/\n/)
      .map((item) => productLineFromFields(item, item))
      .filter((item): item is BrandProfileProductLine => Boolean(item));
  }
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === "string") {
        const line = productLineFromFields(item, item);
        return line ? [line] : [];
      }
      if (item && typeof item === "object") {
        return productLinesFromRecord(item as Record<string, unknown>);
      }
      return [];
    });
  }
  if (typeof raw === "object") {
    return productLinesFromRecord(raw as Record<string, unknown>);
  }
  return [];
}

export function productLineApiId(line: BrandProfileProductLine): string {
  const id = line.id.trim();
  const label = line.label.trim();
  if (id && !isPlaceholderLineId(id)) return id;
  if (label && !isPlaceholderLineId(label)) return slugProfileValue(label);
  return "";
}

export function productLineLabel(line: BrandProfileProductLine): string {
  const label = line.label.trim();
  if (label && !isPlaceholderLineId(label)) return label;
  return humanizeProductLine(line.id) || humanizeProductLine(label) || "Product line";
}

export function creativeProductLineId(form: BrandProfileForm, projectName = ""): string | null {
  for (const line of form.productLines) {
    const id = productLineApiId(line);
    if (id) return id;
  }
  const fallback = slugProfileValue(projectName);
  return fallback === "general" ? null : fallback;
}

export function productLinesToText(lines: BrandProfileProductLine[]) {
  return lines.map((line) => line.label.trim()).filter(Boolean).join("\n");
}

export function saveBrandProfileForm(form: BrandProfileForm) {
  const forms = readForms().filter((item) => item.projectId !== form.projectId);
  localStorage.setItem(KEY, JSON.stringify([...forms, form]));
}

export function displayHost(form: BrandProfileForm) {
  const fromUrl = form.websiteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
  if (fromUrl) return fromUrl;
  return splitProfileList(form.domains)[0] ?? "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return splitProfileList(value);
  return [];
}

function readVisual(raw: BrandVisualIdentity | undefined) {
  const value = raw && typeof raw === "object" ? raw : {};
  return {
    palette: asStringArray(value.palette),
    typography: String(value.typography ?? ""),
    headingFont: String(value.heading_font ?? ""),
    bodyFont: String(value.body_font ?? ""),
    styleKeywords: asStringArray(value.style_keywords),
    avoid: asStringArray(value.avoid),
  };
}

export function profileToForm(profile: BrandProfile, fallback: BrandProfileForm): BrandProfileForm {
  const visual = readVisual(profile.visual_identity);
  const fonts = visual.typography.split(/[/|,]/).map((item) => item.trim()).filter(Boolean);
  const toneValues = asStringArray(profile.tone);
  const traitSet = new Set<string>(BRAND_TRAITS);
  const productLines = normalizeProductLines(profile.product_lines);

  return {
    ...fallback,
    voice: profile.voice ?? "",
    pillars: asStringArray(profile.pillars).join(", "),
    websiteUrl: profile.website_url ?? "",
    domains: asStringArray(profile.domains).join(", "),
    knowledgeNotes: asStringArray(profile.knowledge_notes).join("\n"),
    knowledgeUrls: asStringArray(profile.knowledge_urls).join("\n"),
    aiInstructions: profile.ai_instructions ?? "",
    audience: profile.audience_primary ?? "",
    audienceSecondary: profile.audience_secondary ?? "",
    language: asStringArray(profile.languages).join(", "),
    tone: toneValues.filter((item) => !traitSet.has(item)).join(", "),
    traits: toneValues.filter((item) => traitSet.has(item)).join(", "),
    primaryColor: visual.palette[0] || fallback.primaryColor,
    secondaryColor: visual.palette[1] || fallback.secondaryColor,
    headingFont: visual.headingFont || fonts[0] || fallback.headingFont,
    bodyFont: visual.bodyFont || fonts[1] || fonts[0] || fallback.bodyFont,
    imageStyle: visual.styleKeywords.join(", "),
    avoid: visual.avoid.join(", "),
    bannedWords: asStringArray(profile.compliance_banned_claims).join(", "),
    contentRules: asStringArray(profile.compliance_rules).join("\n"),
    productLines,
    products: productLinesToText(productLines),
    market: profile.market ?? "",
    category: profile.category ?? "",
    logoPath: profile.logo_path ?? (profile.logo_mime_type ? "uploaded" : ""),
    mandatoryDisclaimer: profile.compliance_mandatory_disclaimer ?? "",
    secondaryDisclaimers: asStringArray(profile.compliance_secondary_disclaimers).join("\n"),
    ctaBank: asStringArray(profile.cta_bank).join("\n"),
    hashtagBank: asStringArray(profile.hashtag_bank).join(", "),
  };
}

function productLinesForWrite(form: BrandProfileForm) {
  const mapped = (form.productLines.length
    ? form.productLines
    : form.products.split("\n").map((label) => ({
        id: slugProfileValue(label),
        label,
        partners: "",
        hooks: "",
      })))
    .map((line) => {
      const label = (line.label.trim() && !isPlaceholderLineId(line.label) ? line.label.trim() : "") || humanizeProductLine(line.id) || line.id.trim();
      const id = productLineApiId({ ...line, label }) || slugProfileValue(label);
      return {
        id,
        label: label || id,
        partners: splitProfileList(line.partners),
        hooks: splitProfileList(line.hooks),
      };
    })
    .filter((line) => line.label);

  return mapped;
}

export function formToProfileBody(form: BrandProfileForm, projectName: string): BrandProfileWrite {
  const productLines = productLinesForWrite(form);

  return {
    name: projectName.trim(),
    category: (form.category || projectName).trim() || "General",
    market: (form.market || form.category || projectName).trim() || "General",
    audience_primary: form.audience.trim(),
    audience_secondary: form.audienceSecondary.trim(),
    tone: [...splitProfileList(form.traits), ...splitProfileList(form.tone)],
    languages: splitProfileList(form.language),
    voice: form.voice.trim(),
    pillars: splitProfileList(form.pillars),
    website_url: form.websiteUrl.trim() || null,
    domains: splitProfileList(form.domains),
    knowledge_notes: form.knowledgeNotes
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    knowledge_urls: splitProfileList(form.knowledgeUrls),
    ai_instructions: form.aiInstructions.trim(),
    visual_identity: {
      palette: [form.primaryColor, form.secondaryColor].filter(Boolean),
      heading_font: form.headingFont.trim(),
      body_font: form.bodyFont.trim(),
      style_keywords: splitProfileList(form.imageStyle),
      avoid: splitProfileList(form.avoid),
    },
    compliance_mandatory_disclaimer: form.mandatoryDisclaimer || "",
    compliance_secondary_disclaimers: splitProfileList(form.secondaryDisclaimers),
    compliance_banned_claims: splitProfileList(form.bannedWords),
    compliance_rules: form.contentRules
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    cta_bank: form.ctaBank
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    hashtag_bank: splitProfileList(form.hashtagBank),
    product_lines: productLines,
  };
}

export async function ensureBrandProductLineForGenerate(projectId: string, projectName: string): Promise<string> {
  const profile = await getBrandProfile(projectId);
  if (!profile) {
    throw new Error("Save this project's Brand Profile before generating content.");
  }

  const form = liveFormFromProfile(projectId, profile);
  const existing = creativeProductLineId(form, profile.name || projectName);
  if (existing) return existing;

  const name = (profile.name || projectName).trim() || "General";
  const next = {
    ...form,
    productLines: [{ id: slugProfileValue(name), label: name, partners: "", hooks: "" }],
  };
  const saved = await saveBrandProfile(projectId, formToProfileBody(next, name));
  return creativeProductLineId(liveFormFromProfile(projectId, saved), name) ?? slugProfileValue(name);
}
