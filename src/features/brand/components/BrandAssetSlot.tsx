import { AddPhotoAlternateOutlined } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRef, type ChangeEvent } from "react";

import { FONT_FAMILY } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { getApiErrorMessage } from "../../../services/api/errors";
import type { BrandAssetKind } from "../../../services/brand/brandProfileApi";
import { useBrandAsset, useUploadBrandAsset } from "../hooks/useBrandAssets";

const THEMES: Record<
  BrandAssetKind,
  { accent: string; wash: string; well: string; sample: string }
> = {
  logo: {
    accent: "#1F8A80",
    wash: "linear-gradient(180deg, #FFFDFB 0%, #F6EEE6 100%)",
    well: "#FFF8F3",
    sample: "Full mark",
  },
  "icon-light": {
    accent: "#FF6B45",
    wash: "linear-gradient(180deg, #FFF6F1 0%, #FFE6D8 100%)",
    well: "linear-gradient(135deg, #FF6B45 0%, #1F8A80 100%)",
    sample: "On coral / teal",
  },
  "icon-dark": {
    accent: "#E8A838",
    wash: "linear-gradient(180deg, #FFFDFB 0%, #F7F1E6 100%)",
    well: "#FFFDFB",
    sample: "On cream",
  },
  avatar: {
    accent: "#1F8A80",
    wash: "linear-gradient(180deg, #F3FAF8 0%, #DCEEEB 100%)",
    well: "#FFFDFB",
    sample: "Reel face",
  },
};

type BrandAssetSlotProps = {
  projectId: string;
  kind: BrandAssetKind;
  label: string;
  hint: string;
};

export function BrandAssetSlot({ projectId, kind, label, hint }: BrandAssetSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const asset = useBrandAsset(projectId, kind);
  const upload = useUploadBrandAsset(projectId, kind);
  const preview = asset.data;
  const busy = asset.isFetching || upload.isPending;
  const error = upload.error ? getApiErrorMessage(upload.error) : asset.isError ? getApiErrorMessage(asset.error) : null;
  const theme = THEMES[kind];

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await upload.mutateAsync(file);
  };

  return (
    <Box
      component="button"
      type="button"
      onClick={() => inputRef.current?.click()}
      sx={{
        minHeight: 168,
        borderRadius: "18px",
        border: `1px solid ${SURFACE.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        pt: 0,
        pb: 1.5,
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        textAlign: "center",
        background: theme.wash,
        boxShadow: "0 8px 20px rgba(74, 52, 44, 0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: theme.accent,
          boxShadow: `0 14px 28px ${theme.accent}33`,
        },
      }}
    >
      <Box sx={{ alignSelf: "stretch", height: 6, background: theme.accent }} />
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(event) => void onPick(event)} />
      <Box
        sx={{
          width: 72,
          height: 72,
          mt: 1.25,
          borderRadius: "20px",
          display: "grid",
          placeItems: "center",
          background: theme.well,
          border: kind === "icon-dark" ? `1px solid ${SURFACE.border}` : "1px solid rgba(255,255,255,0.45)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), 0 8px 16px rgba(74,52,44,0.06)",
          overflow: "hidden",
        }}
      >
        {busy ? (
          <CircularProgress size={22} sx={{ color: theme.accent }} />
        ) : preview ? (
          <Box component="img" src={preview} alt={label} sx={{ width: "78%", height: "78%", objectFit: "contain" }} />
        ) : (
          <AddPhotoAlternateOutlined sx={{ color: kind === "icon-light" ? "#FFF9F5" : theme.accent, fontSize: 28 }} />
        )}
      </Box>
      <Box>
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 13, color: "#4A342C", lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 500, fontSize: 11, color: "#8A6F64", mt: 0.35 }}>
          {hint}
        </Typography>
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 10, color: theme.accent, mt: 0.45, letterSpacing: 0.3 }}>
          {theme.sample}
        </Typography>
      </Box>
      {error ? (
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 10, color: "#E25030" }}>{error}</Typography>
      ) : null}
    </Box>
  );
}
