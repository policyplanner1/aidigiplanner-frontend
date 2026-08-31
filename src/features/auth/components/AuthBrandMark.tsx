import { Box, Typography } from "@mui/material";

import { TYPE } from "../../../constants/fonts";

type AuthBrandMarkProps = {
  size?: "compact" | "default" | "hero";
};

export function AuthBrandMark({ size = "default" }: AuthBrandMarkProps) {
  const hero = size === "hero";
  const compact = size === "compact";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: hero ? 1.75 : 1.25 }}>
      <Box
        sx={{
          width: hero ? 52 : compact ? 36 : 44,
          height: hero ? 52 : compact ? 36 : 44,
          borderRadius: hero ? "14px" : 1,
          backgroundColor: "#FF6B45",
          color: "#FFF9F5",
          display: "grid",
          placeItems: "center",
          ...TYPE.metric,
          fontSize: hero ? 18 : compact ? 13 : 15,
          letterSpacing: -0.4,
          flexShrink: 0,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 22px rgba(255,107,69,0.22)",
        }}
      >
        AI
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            ...TYPE.eyebrow,
            color: "secondary.dark",
            fontSize: hero ? 12 : compact ? 10 : 11,
            letterSpacing: hero ? 1.4 : 0.8,
          }}
        >
          Workspace OS
        </Typography>
        <Typography
          sx={{
            ...TYPE.title,
            mt: 0.15,
            fontSize: hero ? { md: "1.55rem", lg: "1.75rem" } : compact ? "1.15rem" : "1.45rem",
            letterSpacing: hero ? -0.8 : -0.4,
            lineHeight: 1.05,
            fontWeight: 800,
          }}
        >
          AI{" "}
          <Box
            component="span"
            sx={{
              color: "primary.main",
              background: "linear-gradient(90deg, #FF6B45 0%, #E25030 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Social
          </Box>{" "}
          Planner
        </Typography>
      </Box>
    </Box>
  );
}
