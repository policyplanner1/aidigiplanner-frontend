import { Box, Typography } from "@mui/material";

import { FONT_FAMILY } from "../../../constants/fonts";
import { useBrandAsset } from "../hooks/useBrandAssets";

type ProjectMarkProps = {
  projectId: string;
  name: string;
  surface?: "dark" | "light";
  size?: number;
  radius?: number;
};

export function ProjectMark({ projectId, name, surface = "dark", size = 56, radius = 16 }: ProjectMarkProps) {
  const icon = useBrandAsset(projectId, surface === "dark" ? "icon-light" : "icon-dark");
  const logo = useBrandAsset(projectId, "logo");
  const src = icon.data || logo.data;
  const initial = name.trim().charAt(0).toUpperCase() || "B";

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${radius}px`,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        overflow: "hidden",
        color: surface === "dark" ? "#FFF9F5" : "#4A342C",
        fontFamily: FONT_FAMILY,
        fontWeight: 800,
        fontSize: size * 0.46,
        letterSpacing: -0.8,
        background:
          surface === "dark"
            ? "linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08))"
            : "#FFF8F3",
        border: surface === "dark" ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(74,52,44,0.12)",
        boxShadow: surface === "dark" ? "inset 0 1px 0 rgba(255,255,255,0.55)" : "none",
      }}
    >
      {src ? (
        <Box component="img" src={src} alt="" sx={{ width: "78%", height: "78%", objectFit: "contain" }} />
      ) : (
        <Typography component="span" sx={{ font: "inherit", color: "inherit", lineHeight: 1 }}>
          {initial}
        </Typography>
      )}
    </Box>
  );
}
