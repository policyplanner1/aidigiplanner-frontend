import axios from "axios";

import { apiClient } from "../api/client";

export type BrandProductLine = {
  id?: string;
  label?: string;
  partners?: string[];
  hooks?: string[];
  [key: string]: unknown;
};

export type BrandVisualIdentity = {
  palette?: string[];
  typography?: string;
  heading_font?: string;
  body_font?: string;
  style_keywords?: string[];
  avoid?: string[];
  [key: string]: unknown;
};

export type BrandProfile = {
  id: string;
  project_id: string;
  name: string;
  category: string;
  market: string;
  audience_primary: string;
  audience_secondary: string;
  tone: string[];
  languages: string[];
  voice?: string;
  pillars?: string[];
  website_url?: string | null;
  domains?: string[];
  knowledge_notes?: string[];
  knowledge_urls?: string[];
  ai_instructions?: string;
  visual_identity: BrandVisualIdentity;
  logo_path?: string;
  logo_mime_type?: string | null;
  dark_logo_mime_type?: string | null;
  icon_mime_type?: string | null;
  avatar_mime_type?: string | null;
  compliance_mandatory_disclaimer: string;
  compliance_secondary_disclaimers: string[];
  compliance_banned_claims: string[];
  compliance_rules: string[];
  cta_bank: string[];
  hashtag_bank: string[];
  product_lines: BrandProductLine[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type BrandProfileWrite = {
  name: string;
  category: string;
  market: string;
  audience_primary: string;
  audience_secondary: string;
  tone: string[];
  languages: string[];
  voice?: string;
  pillars?: string[];
  website_url?: string | null;
  domains?: string[];
  knowledge_notes?: string[];
  knowledge_urls?: string[];
  ai_instructions?: string;
  visual_identity: {
    palette: string[];
    heading_font?: string;
    body_font?: string;
    typography?: string;
    style_keywords: string[];
    avoid: string[];
  };
  compliance_mandatory_disclaimer: string;
  compliance_secondary_disclaimers: string[];
  compliance_banned_claims: string[];
  compliance_rules: string[];
  cta_bank: string[];
  hashtag_bank: string[];
  product_lines: Array<{
    id: string;
    label: string;
    partners: string[];
    hooks: string[];
  }>;
};

export function brandProfileKey(projectId: string) {
  return ["brand-profile", projectId] as const;
}

export function brandAssetKey(projectId: string, kind: BrandAssetKind) {
  return ["brand-asset", projectId, kind] as const;
}

export type BrandAssetKind = "logo" | "icon-light" | "icon-dark" | "avatar";

const LOCAL_ASSETS_KEY = "ai-growth-brand-assets";

type LocalAssets = {
  logo?: string;
  light?: string;
  dark?: string;
  avatar?: string;
};

function localKey(kind: BrandAssetKind): keyof LocalAssets {
  if (kind === "icon-light") return "light";
  if (kind === "icon-dark") return "dark";
  if (kind === "avatar") return "avatar";
  return "logo";
}

function readLocalAssets(projectId: string): LocalAssets {
  try {
    const raw = localStorage.getItem(LOCAL_ASSETS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LocalAssets>;
    return parsed[projectId] ?? {};
  } catch {
    return {};
  }
}

function writeLocalAsset(projectId: string, kind: BrandAssetKind, dataUrl: string) {
  let all: Record<string, LocalAssets> = {};
  try {
    all = JSON.parse(localStorage.getItem(LOCAL_ASSETS_KEY) ?? "{}") as Record<string, LocalAssets>;
  } catch {
    all = {};
  }
  all[projectId] = { ...all[projectId], [localKey(kind)]: dataUrl };
  localStorage.setItem(LOCAL_ASSETS_KEY, JSON.stringify(all));
}

function assetPath(projectId: string, kind: BrandAssetKind, scope: "products" | "projects" = "products") {
  const root = `/${scope}/${projectId}/brand-profile`;
  if (kind === "logo") return `${root}/logo`;
  if (kind === "icon-light") return `${root}/logo-dark`;
  if (kind === "avatar") return `${root}/avatar`;
  return `${root}/icon`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function resolveMediaUrl(value: string) {
  if (value.startsWith("http") || value.startsWith("blob:") || value.startsWith("data:")) return value;
  const base = String(import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(/\/$/, "");
  if (value.startsWith("/")) return value;
  return `${base}/${value.replace(/^\//, "")}`;
}

async function readAssetFromResponse(data: unknown, contentType: string): Promise<string | null> {
  const type = contentType.toLowerCase();
  if (data instanceof Blob) {
    if (type.includes("json") || data.type.includes("json")) {
      const parsed = JSON.parse(await data.text()) as Record<string, unknown>;
      const url = parsed.url ?? parsed.logo_url ?? parsed.icon_url ?? parsed.logo_path ?? parsed.path;
      return typeof url === "string" && url.trim() ? resolveMediaUrl(url) : null;
    }
    if (!data.size) return null;
    return URL.createObjectURL(data);
  }
  if (data && typeof data === "object") {
    const parsed = data as Record<string, unknown>;
    const url = parsed.url ?? parsed.logo_url ?? parsed.icon_url ?? parsed.logo_path ?? parsed.path;
    return typeof url === "string" && url.trim() ? resolveMediaUrl(url) : null;
  }
  return null;
}

export async function getBrandAsset(projectId: string, kind: BrandAssetKind, live: boolean): Promise<string | null> {
  if (!live) return readLocalAssets(projectId)[localKey(kind)] ?? null;

  try {
    const response = await apiClient.get(assetPath(projectId, kind, "products"), {
      responseType: "blob",
    });
    return readAssetFromResponse(response.data, String(response.headers["content-type"] ?? ""));
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
    try {
      const response = await apiClient.get(assetPath(projectId, kind, "projects"), {
        responseType: "blob",
      });
      return readAssetFromResponse(response.data, String(response.headers["content-type"] ?? ""));
    } catch (fallback) {
      if (axios.isAxiosError(fallback) && fallback.response?.status === 404) return null;
      throw fallback;
    }
  }
}

export async function uploadBrandAsset(
  projectId: string,
  kind: BrandAssetKind,
  file: File,
  live: boolean,
): Promise<string | null> {
  if (!live) {
    const dataUrl = await fileToDataUrl(file);
    writeLocalAsset(projectId, kind, dataUrl);
    return dataUrl;
  }

  const form = new FormData();
  form.append("file", file);

  try {
    const response = await apiClient.put(assetPath(projectId, kind, "products"), form);
    return readAssetFromResponse(response.data, String(response.headers["content-type"] ?? ""));
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
    const response = await apiClient.put(assetPath(projectId, kind, "projects"), form);
    return readAssetFromResponse(response.data, String(response.headers["content-type"] ?? ""));
  }
}

export async function getBrandProfile(projectId: string): Promise<BrandProfile | null> {
  const paths = [
    `/products/${projectId}/brand-profile/effective`,
    `/products/${projectId}/brand-profile`,
    `/projects/${projectId}/brand-profile`,
  ];
  for (const path of paths) {
    try {
      const { data } = await apiClient.get<BrandProfile>(path);
      return data;
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
    }
  }
  return null;
}

export async function saveBrandProfile(projectId: string, body: BrandProfileWrite): Promise<BrandProfile> {
  try {
    const { data } = await apiClient.put<BrandProfile>(`/products/${projectId}/brand-profile`, body);
    return data;
  } catch (error) {
    if (!axios.isAxiosError(error) || (error.response?.status !== 404 && error.response?.status !== 405)) {
      throw error;
    }
  }

  const path = `/projects/${projectId}/brand-profile`;
  try {
    const { data } = await apiClient.put<BrandProfile>(path, body);
    return data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    const status = error.response?.status;
    if (status !== 404 && status !== 405) throw error;

    try {
      const { data } = await apiClient.patch<BrandProfile>(path, body);
      return data;
    } catch (patchError) {
      if (
        axios.isAxiosError(patchError) &&
        (patchError.response?.status === 404 || patchError.response?.status === 405)
      ) {
        const { data } = await apiClient.post<BrandProfile>(path, body);
        return data;
      }
      throw patchError;
    }
  }
}
