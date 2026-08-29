import { KeyboardArrowRight } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";

type KpiTileProps = {
  label: string;
  value: ReactNode;
  hint: string;
  delay: number;
  accent?: string;
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean;
};

export function KpiTile({
  label,
  value,
  hint,
  delay,
  accent = "#FF6B45",
  icon,
  onClick,
  active,
}: KpiTileProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: 128,
        p: 1.9,
        cursor: onClick ? "pointer" : "default",
        borderRadius: "18px",
        background: `linear-gradient(180deg, #FFFDFB 0%, ${accent}12 100%)`,
        border: `1px solid ${active ? accent : SURFACE.border}`,
        boxShadow: active
          ? `0 14px 28px ${accent}22`
          : "0 10px 24px rgba(74,52,44,0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        animation: `kpiIn 0.45s ease ${delay}ms both`,
        "@keyframes kpiIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              borderColor: accent,
              boxShadow: `0 16px 30px ${accent}22`,
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120px 80px at 100% 0%, ${accent}26, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography sx={{ ...TYPE.label, color: "text.secondary", letterSpacing: 0.3 }}>{label}</Typography>
        {icon ? (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              color: "#FFF9F5",
              background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
              boxShadow: `0 8px 16px ${accent}33`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Box>
      <Typography sx={{ ...TYPE.metric, position: "relative", fontSize: 28, mt: 1.15, letterSpacing: -0.6 }}>
        {value}
      </Typography>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.85 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
          {hint}
        </Typography>
        {onClick ? (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              backgroundColor: `${accent}18`,
              color: accent,
            }}
          >
            <KeyboardArrowRight sx={{ fontSize: 18 }} />
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
