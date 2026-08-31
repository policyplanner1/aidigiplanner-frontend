import { CheckCircle, CloudUpload, Delete, Download, Inventory2, Visibility } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import {
  BRAND_ASSET_TYPES,
  deleteBrandAsset,
  listBrandAssets,
  replaceBrandAsset,
  updateBrandAsset,
  uploadBrandAsset,
  type BrandAsset,
  type BrandAssetType,
} from "../../../services/brand/brandLibraryService";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BrandLibraryPage() {
  const { organization, currentProject } = useWorkspace();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.PRODUCT_EDIT) || can(PERMISSIONS.COMPANY_MANAGE);

  const [typeFilter, setTypeFilter] = useState<"all" | BrandAssetType>("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState<BrandAssetType>("logo");
  const [uploadScope, setUploadScope] = useState<"product" | "company">("product");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const replaceInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const assets = useMemo(
    () => (organization ? listBrandAssets(organization.id, currentProject?.id ?? undefined) : []),
    [organization, currentProject?.id],
  );

  const visible = typeFilter === "all" ? assets : assets.filter((asset) => asset.type === typeFilter);
  const active = visible.filter((asset) => !asset.archived);
  const archived = visible.filter((asset) => asset.archived);

  const filterItems = [
    { id: "all", label: "All" },
    ...BRAND_ASSET_TYPES.map((item) => ({ id: item.id, label: item.label })),
  ];

  if (!organization) {
    return <NeedProject feature="Brand Library" />;
  }

  const submitUpload = async () => {
    if (!uploadFile) {
      setError("Choose a file to upload.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await uploadBrandAsset({
        companyId: organization.id,
        productId: uploadScope === "product" ? currentProject?.id ?? null : null,
        name: uploadName,
        type: uploadType,
        file: uploadFile,
      });
      setUploadOpen(false);
      setUploadName("");
      setUploadFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload this file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow={currentProject ? currentProject.name : organization.name}
          title="Brand Library"
          description="Logos, images, videos, fonts, guidelines, templates, and approved creatives — organized by company and product."
          action={
            canManage ? (
              <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setUploadOpen(true)}>
                Upload
              </Button>
            ) : null
          }
        />

        <CapsuleFilter items={filterItems} value={typeFilter} onChange={(id) => setTypeFilter(id as "all" | BrandAssetType)} />

        {active.length === 0 && archived.length === 0 ? (
          <Box sx={{ ...GLASS_SX, p: 3, borderRadius: 1, maxWidth: 480 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No brand assets yet.</Typography>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>
              Upload your logo, brand guidelines, or approved creatives to keep them in one place.
            </Typography>
            {canManage ? (
              <Button variant="contained" onClick={() => setUploadOpen(true)}>
                Upload asset
              </Button>
            ) : null}
          </Box>
        ) : (
          <>
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" } }}>
              {active.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  canManage={canManage}
                  onReplace={(file) => void replaceBrandAsset(asset.id, file)}
                  onTag={(tags) => updateBrandAsset(asset.id, { tags })}
                  onApprove={() => updateBrandAsset(asset.id, { approved: !asset.approved })}
                  onArchive={() => updateBrandAsset(asset.id, { archived: true })}
                  onDelete={() => deleteBrandAsset(asset.id)}
                  replaceInputRef={(node) => {
                    replaceInputs.current[asset.id] = node;
                  }}
                />
              ))}
            </Box>

            {archived.length > 0 ? (
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 13.5 }}>Archived ({archived.length})</Typography>
                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" } }}>
                  {archived.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      canManage={canManage}
                      onReplace={(file) => void replaceBrandAsset(asset.id, file)}
                      onTag={(tags) => updateBrandAsset(asset.id, { tags })}
                      onApprove={() => updateBrandAsset(asset.id, { approved: !asset.approved })}
                      onArchive={() => updateBrandAsset(asset.id, { archived: false })}
                      onDelete={() => deleteBrandAsset(asset.id)}
                      archivedView
                      replaceInputRef={(node) => {
                        replaceInputs.current[asset.id] = node;
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ) : null}
          </>
        )}
      </Box>

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Upload brand asset</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 0.5 }}>
          {error ? <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert> : null}
          <TextField label="Name" fullWidth margin="normal" value={uploadName} onChange={(event) => setUploadName(event.target.value)} placeholder="Primary logo — dark" />
          <TextField select label="Type" fullWidth margin="normal" value={uploadType} onChange={(event) => setUploadType(event.target.value as BrandAssetType)}>
            {BRAND_ASSET_TYPES.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          {currentProject ? (
            <TextField select label="Available to" fullWidth margin="normal" value={uploadScope} onChange={(event) => setUploadScope(event.target.value as "product" | "company")}>
              <MenuItem value="product">{currentProject.name} only</MenuItem>
              <MenuItem value="company">Entire company (all products)</MenuItem>
            </TextField>
          ) : null}
          <Button variant="outlined" component="label" sx={{ mt: 1.5, width: "fit-content" }}>
            {uploadFile ? uploadFile.name : "Choose file"}
            <input hidden type="file" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void submitUpload()} disabled={busy}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </ScreenFrame>
  );
}

function AssetCard({
  asset,
  canManage,
  archivedView,
  onReplace,
  onTag,
  onApprove,
  onArchive,
  onDelete,
  replaceInputRef,
}: {
  asset: BrandAsset;
  canManage: boolean;
  archivedView?: boolean;
  onReplace: (file: File) => void;
  onTag: (tags: string[]) => void;
  onApprove: () => void;
  onArchive: () => void;
  onDelete: () => void;
  replaceInputRef: (node: HTMLInputElement | null) => void;
}) {
  const [tagDraft, setTagDraft] = useState(asset.tags.join(", "));
  const isImage = asset.mimeType.startsWith("image/");
  const isVideo = asset.mimeType.startsWith("video/");
  const typeLabel = BRAND_ASSET_TYPES.find((item) => item.id === asset.type)?.label ?? asset.type;

  return (
    <Box sx={{ ...GLASS_SX, borderRadius: 1, overflow: "hidden", opacity: archivedView ? 0.65 : 1 }}>
      <Box sx={{ height: 120, background: SURFACE.well, display: "grid", placeItems: "center", position: "relative" }}>
        {asset.dataUrl && isImage ? (
          <Box component="img" src={asset.dataUrl} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : asset.dataUrl && isVideo ? (
          <Box component="video" src={asset.dataUrl} sx={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
        ) : (
          <Inventory2 sx={{ color: "#8A6F64" }} />
        )}
        {asset.approved ? (
          <CheckCircle sx={{ position: "absolute", top: 6, right: 6, fontSize: 20, color: "#2A9D6A", backgroundColor: "#fff", borderRadius: "50%" }} />
        ) : null}
      </Box>
      <Box sx={{ p: 1.5, display: "grid", gap: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13.5 }} noWrap>
          {asset.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          <Chip size="small" label={typeLabel} />
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
            {formatSize(asset.sizeBytes)}
          </Typography>
        </Box>
        {asset.tags.length ? (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {asset.tags.map((tag) => (
              <Chip key={tag} size="small" variant="outlined" label={tag} />
            ))}
          </Box>
        ) : null}

        {canManage ? (
          <TextField
            size="small"
            placeholder="Tags, comma separated"
            value={tagDraft}
            onChange={(event) => setTagDraft(event.target.value)}
            onBlur={() => onTag(tagDraft.split(",").map((tag) => tag.trim()).filter(Boolean))}
            sx={{ mt: 0.5 }}
          />
        ) : null}

        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
          {asset.dataUrl ? (
            <Button size="small" startIcon={<Visibility fontSize="small" />} href={asset.dataUrl} target="_blank" rel="noopener">
              Preview
            </Button>
          ) : null}
          {asset.dataUrl ? (
            <Button size="small" startIcon={<Download fontSize="small" />} href={asset.dataUrl} download={asset.name}>
              Download
            </Button>
          ) : null}
          {canManage ? (
            <>
              <Button size="small" component="label">
                Replace
                <input
                  hidden
                  type="file"
                  ref={replaceInputRef}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onReplace(file);
                  }}
                />
              </Button>
              <Button size="small" onClick={onApprove}>
                {asset.approved ? "Unapprove" : "Mark approved"}
              </Button>
              <Button size="small" onClick={onArchive}>
                {archivedView ? "Restore" : "Archive"}
              </Button>
              <Button size="small" color="error" startIcon={<Delete fontSize="small" />} onClick={onDelete}>
                Delete
              </Button>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
