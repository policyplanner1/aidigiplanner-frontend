import { Box, Paper, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

import { TYPE } from "../constants/fonts";
import { CANVAS_BG, GLASS_SX, SURFACE } from "../constants/layout";
import { AuthBrandMark } from "../features/auth/components/AuthBrandMark";
import { AuthOrbit } from "../features/auth/components/AuthOrbit";

function Glow() {
  return (
    <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <Box sx={{ position: "absolute", width: 280, height: 280, right: -90, top: -110, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,69,0.28), transparent 68%)" }} />
      <Box sx={{ position: "absolute", width: 220, height: 220, left: -80, bottom: -70, borderRadius: "50%", background: "radial-gradient(circle, rgba(31,138,128,0.2), transparent 70%)" }} />
    </Box>
  );
}

export function AuthLayout() {
  return (
    <Box sx={{ height: "100vh", overflow: "hidden", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" }, background: CANVAS_BG }}>
      <Box sx={{ display: { xs: "none", md: "flex" }, position: "relative", overflow: "hidden", flexDirection: "column", minHeight: 0, p: { md: 3, lg: 3.5 }, background: `linear-gradient(145deg, ${SURFACE.heroFrom} 0%, ${SURFACE.heroMid} 48%, ${SURFACE.heroTo} 100%)`, borderRight: `1px solid ${SURFACE.border}`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)" }}>
        <Glow />
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <AuthBrandMark size="hero" />
        </Box>
        <Box sx={{ position: "relative", flex: 1, minHeight: 0, display: "grid", placeItems: "center", py: 0.5 }}>
          <AuthOrbit />
        </Box>
        <Typography sx={{ ...TYPE.label, position: "relative", flexShrink: 0, color: "text.secondary", fontSize: 12, pt: 0.5 }}>
          Multi-tenant · Brand-safe · Built for agencies
        </Typography>
      </Box>
      <Box sx={{ position: "relative", display: "grid", placeItems: "center", minHeight: 0, overflowX: "hidden", overflowY: "auto", px: 2, py: 3, background: `linear-gradient(145deg, ${SURFACE.heroFrom} 0%, ${SURFACE.heroMid} 48%, ${SURFACE.heroTo} 100%)` }}>
        <Glow />
        <Box sx={{ width: "100%", maxWidth: 440, position: "relative" }}>
          <Box sx={{ mb: 2, display: { xs: "block", md: "none" } }}>
            <AuthBrandMark size="compact" />
          </Box>
          <Paper sx={{ ...GLASS_SX, p: { xs: 3, sm: 3.5 }, borderRadius: "20px", backgroundColor: "rgba(255,248,243,0.62)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 18px 40px rgba(255,107,69,0.08)", "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "rgba(255,248,243,0.7)", "& fieldset": { borderColor: SURFACE.border }, "&:hover fieldset": { borderColor: "rgba(255,107,69,0.45)" }, "&.Mui-focused fieldset": { borderColor: "#FF6B45" } } }}>
            <Outlet />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
