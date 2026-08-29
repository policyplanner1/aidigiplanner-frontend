import type { BrandProfile, BrandProfileWrite, BrandVisualIdentity } from "./brandProfileApi";
import { getBrandProfile, saveBrandProfile } from "./brandProfileApi";

export const BRAND_TRAITS = ["Professional", "Trustworthy", "Friendly", "Warm", "Expert"] as const;

export type BrandKitProductLine = {
  id: string;
  label: string;
  partners: string;
  hooks: string;
};

export type BrandKit = {
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
  productLines: BrandKitProductLine[];
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

const KEY = "ai-growth-brand-kits";

const REQUIRED_FIELDS: (keyof BrandKit)[] = [
  "voice",
  "audience",
  "language",
  "primaryColor",
  "secondaryColor",
];

function readKits(): BrandKit[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BrandKit[];
  } catch {
    return [];
  }
}

export function websiteFromName(name: string) {
  const host = name.replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
  return host ? `${host}.com` : "";
}

export function emptyBrandKit(projectId: string): BrandKit {
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

export function defaultsForProject(projectId: string, name = ""): BrandKit {
  const site = websiteFromName(name);
  return {
    ...emptyBrandKit(projectId),
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

export function getBrandKit(projectId: string, projectName = "", live = false): BrandKit {
  const found = readKits().find((kit) => kit.projectId === projectId);
  if (live) {
    return {
      ...emptyBrandKit(projectId),
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

export function liveKitFromProfile(projectId: string, profile: BrandProfile | null): BrandKit {
  if (!profile) return getBrandKit(projectId, "", true);
  return { ...profileToKit(profile, emptyBrandKit(projectId)), projectId };
}

export function getBrandProfileSaveErrors(kit: BrandKit, projectName: string): string[] {
  const errors: string[] = [];
  if (!projectName.trim()) errors.push("Project name is required.");
  if (!kit.audience.trim()) errors.push("Primary audience is required.");
  if (splitKitList(kit.language).length === 0) errors.push("Add at least one language.");
  if (splitKitList(kit.traits).length + splitKitList(kit.tone).length === 0) {
    errors.push("Add a tone or at least one trait.");
  }
  return errors;
}

export function getBrandKitScore(kit: BrandKit) {
  const filled = REQUIRED_FIELDS.filter((key) => String(kit[key] ?? "").trim().length > 0).length;
  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}

export function getBrandKitAssetCount(kit: BrandKit) {
  return splitKitList(kit.pillars).length + splitKitList(kit.domains).length + splitKitList(kit.products).length;
}

export function splitKitList(value: string) {
  return value
    .split(/[,•\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinKitList(items: string[]) {
  return items.filter(Boolean).join(", ");
}

export function slugKitValue(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "general"
  );
}

export function emptyProductLine(_index = 1): BrandKitProductLine {
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

function productLineFromFields(id: string, label: string, partners = "", hooks = ""): BrandKitProductLine | null {
  const rawId = id.trim();
  const rawLabel = label.trim();
  const slugSource = !rawId || isPlaceholderLineId(rawId) ? rawLabel : rawId;
  const apiId = slugSource && !isPlaceholderLineId(slugSource) ? slugKitValue(slugSource) : "";
  const display = (rawLabel && !isPlaceholderLineId(rawLabel) ? rawLabel : humanizeProductLine(rawId || apiId)) || apiId;
  if (!apiId && !display) return null;
  return {
    id: apiId || slugKitValue(display),
    label: display || apiId,
    partners,
    hooks,
  };
}

const PRODUCT_LINE_META = new Set(["id", "label", "name", "title", "slug", "key", "partners", "hooks", "description", "sku"]);

function productLinesFromRecord(raw: Record<string, unknown>): BrandKitProductLine[] {
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

export function normalizeProductLines(raw: unknown): BrandKitProductLine[] {
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
      .filter((item): item is BrandKitProductLine => Boolean(item));
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

export function productLineApiId(line: BrandKitProductLine): string {
  const id = line.id.trim();
  const label = line.label.trim();
  if (id && !isPlaceholderLineId(id)) return id;
  if (label && !isPlaceholderLineId(label)) return slugKitValue(label);
  return "";
}

export function productLineLabel(line: BrandKitProductLine): string {
  const label = line.label.trim();
  if (label && !isPlaceholderLineId(label)) return label;
  return humanizeProductLine(line.id) || humanizeProductLine(label) || "Product line";
}

export function creativeProductLineId(kit: BrandKit, projectName = ""): string | null {
  for (const line of kit.productLines) {
    const id = productLineApiId(line);
    if (id) return id;
  }
  const fallback = slugKitValue(projectName);
  return fallback === "general" ? null : fallback;
}

export function productLinesToText(lines: BrandKitProductLine[]) {
  return lines.map((line) => line.label.trim()).filter(Boolean).join("\n");
}

export function saveBrandKit(kit: BrandKit) {
  const kits = readKits().filter((item) => item.projectId !== kit.projectId);
  localStorage.setItem(KEY, JSON.stringify([...kits, kit]));
}

export function displayHost(kit: BrandKit) {
  const fromUrl = kit.websiteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
  if (fromUrl) return fromUrl;
  return splitKitList(kit.domains)[0] ?? "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return splitKitList(value);
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

export function profileToKit(profile: BrandProfile, fallback: BrandKit): BrandKit {
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

function productLinesForWrite(kit: BrandKit) {
  const mapped = (kit.productLines.length
    ? kit.productLines
    : kit.products.split("\n").map((label) => ({
        id: slugKitValue(label),
        label,
        partners: "",
        hooks: "",
      })))
    .map((line) => {
      const label = (line.label.trim() && !isPlaceholderLineId(line.label) ? line.label.trim() : "") || humanizeProductLine(line.id) || line.id.trim();
      const id = productLineApiId({ ...line, label }) || slugKitValue(label);
      return {
        id,
        label: label || id,
        partners: splitKitList(line.partners),
        hooks: splitKitList(line.hooks),
      };
    })
    .filter((line) => line.label);

  return mapped;
}

export function kitToProfileBody(kit: BrandKit, projectName: string): BrandProfileWrite {
  const productLines = productLinesForWrite(kit);

  return {
    name: projectName.trim(),
    category: (kit.category || projectName).trim() || "General",
    market: (kit.market || kit.category || projectName).trim() || "General",
    audience_primary: kit.audience.trim(),
    audience_secondary: kit.audienceSecondary.trim(),
    tone: [...splitKitList(kit.traits), ...splitKitList(kit.tone)],
    languages: splitKitList(kit.language),
    voice: kit.voice.trim(),
    pillars: splitKitList(kit.pillars),
    website_url: kit.websiteUrl.trim() || null,
    domains: splitKitList(kit.domains),
    knowledge_notes: kit.knowledgeNotes
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    knowledge_urls: splitKitList(kit.knowledgeUrls),
    ai_instructions: kit.aiInstructions.trim(),
    visual_identity: {
      palette: [kit.primaryColor, kit.secondaryColor].filter(Boolean),
      heading_font: kit.headingFont.trim(),
      body_font: kit.bodyFont.trim(),
      style_keywords: splitKitList(kit.imageStyle),
      avoid: splitKitList(kit.avoid),
    },
    compliance_mandatory_disclaimer: kit.mandatoryDisclaimer || "",
    compliance_secondary_disclaimers: splitKitList(kit.secondaryDisclaimers),
    compliance_banned_claims: splitKitList(kit.bannedWords),
    compliance_rules: kit.contentRules
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    cta_bank: kit.ctaBank
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    hashtag_bank: splitKitList(kit.hashtagBank),
    product_lines: productLines,
  };
}

export async function ensureBrandProductLineForGenerate(projectId: string, projectName: string): Promise<string> {
  const profile = await getBrandProfile(projectId);
  if (!profile) {
    throw new Error("Save this project's Brand Kit before generating content.");
  }

  const kit = liveKitFromProfile(projectId, profile);
  const existing = creativeProductLineId(kit, profile.name || projectName);
  if (existing) return existing;

  const name = (profile.name || projectName).trim() || "General";
  const next = {
    ...kit,
    productLines: [{ id: slugKitValue(name), label: name, partners: "", hooks: "" }],
  };
  const saved = await saveBrandProfile(projectId, kitToProfileBody(next, name));
  return creativeProductLineId(liveKitFromProfile(projectId, saved), name) ?? slugKitValue(name);
}
