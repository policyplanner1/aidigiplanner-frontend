import { useOrganizationStore } from "../../store/organizationStore";

// Brand Library (spec §40) has no backend storage of its own — creative assets
// live behind aidigiplanner-backend's per-concept download endpoint, but there's
// no generic "upload a logo/font/guideline PDF and keep it" API. This is a
// local/mock asset store: metadata always persists; the file content only
// persists as a data URL for files under DATA_URL_LIMIT (localStorage has a
// small total quota) — larger files keep their metadata but lose the preview
// after a reload, and need re-uploading.

export type BrandAssetType =
  | "logo"
  | "product_image"
  | "video"
  | "font"
  | "guideline"
  | "template"
  | "brochure"
  | "pdf"
  | "approved_creative"
  | "disclaimer";

export const BRAND_ASSET_TYPES: { id: BrandAssetType; label: string }[] = [
  { id: "logo", label: "Logo" },
  { id: "product_image", label: "Product image" },
  { id: "video", label: "Video" },
  { id: "font", label: "Font" },
  { id: "guideline", label: "Brand guideline" },
  { id: "template", label: "Template" },
  { id: "brochure", label: "Brochure" },
  { id: "pdf", label: "PDF" },
  { id: "approved_creative", label: "Approved creative" },
  { id: "disclaimer", label: "Disclaimer" },
];

export type BrandAsset = {
  id: string;
  companyId: string;
  productId: string | null; // null = shared at the company level
  name: string;
  type: BrandAssetType;
  tags: string[];
  approved: boolean;
  archived: boolean;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string | null; // null once too large to keep inline, or never uploaded
  createdAt: string;
};

const ASSETS_KEY = "ai-growth-brand-assets";
const DATA_URL_LIMIT = 400_000; // ~400KB — keeps localStorage usage sane for a demo store.

function readAssets(): BrandAsset[] {
  const raw = localStorage.getItem(ASSETS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BrandAsset[];
  } catch {
    return [];
  }
}

function writeAssets(assets: BrandAsset[]) {
  try {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  } catch {
    // Quota exceeded (too many inline data URLs) — drop previews, keep metadata.
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets.map((asset) => ({ ...asset, dataUrl: null }))));
  }
  useOrganizationStore.getState().bumpRevision();
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export function listBrandAssets(companyId: string, productId?: string | null): BrandAsset[] {
  return readAssets()
    .filter((asset) => asset.companyId === companyId)
    .filter((asset) => (productId === undefined ? true : asset.productId === productId || asset.productId === null))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function uploadBrandAsset(input: {
  companyId: string;
  productId: string | null;
  name: string;
  type: BrandAssetType;
  file: File;
}): Promise<BrandAsset> {
  const dataUrl = input.file.size <= DATA_URL_LIMIT ? await readFileAsDataUrl(input.file) : null;
  const asset: BrandAsset = {
    id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    companyId: input.companyId,
    productId: input.productId,
    name: input.name.trim() || input.file.name,
    type: input.type,
    tags: [],
    approved: false,
    archived: false,
    mimeType: input.file.type,
    sizeBytes: input.file.size,
    dataUrl,
    createdAt: new Date().toISOString(),
  };
  writeAssets([asset, ...readAssets()]);
  return asset;
}

export async function replaceBrandAsset(assetId: string, file: File): Promise<void> {
  const dataUrl = file.size <= DATA_URL_LIMIT ? await readFileAsDataUrl(file) : null;
  const assets = readAssets();
  writeAssets(
    assets.map((asset) =>
      asset.id === assetId
        ? { ...asset, mimeType: file.type, sizeBytes: file.size, dataUrl, createdAt: new Date().toISOString() }
        : asset,
    ),
  );
}

export function updateBrandAsset(assetId: string, patch: Partial<Pick<BrandAsset, "tags" | "approved" | "archived" | "productId" | "name">>) {
  const assets = readAssets();
  writeAssets(assets.map((asset) => (asset.id === assetId ? { ...asset, ...patch } : asset)));
}

export function deleteBrandAsset(assetId: string) {
  writeAssets(readAssets().filter((asset) => asset.id !== assetId));
}
