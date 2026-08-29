import { ArrowForward } from "@mui/icons-material";
import { Box, Button, Chip, LinearProgress, Typography } from "@mui/material";

import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { SOCIAL_PLATFORMS } from "../../../constants/platforms";
import type { Project, SocialAccount } from "../../../types/organization";
import { displayHost, type BrandKit } from "../../../services/brand/brandKitService";
import { ProjectMark } from "./ProjectMark";

type BrandProjectCardProps = {
  project: Project;
  kit: BrandKit;
  accounts: SocialAccount[];
  score: number;
  onManage: () => void;
};

export function BrandProjectCard({ project, kit, accounts, score, onManage }: BrandProjectCardProps) {
  const host = displayHost(kit);
  const connected = accounts.filter((item) => item.status === "connected");
  const from = /^#[0-9A-Fa-f]{6}$/.test(kit.primaryColor) ? kit.primaryColor : "#FF6B45";
  const to = /^#[0-9A-Fa-f]{6}$/.test(kit.secondaryColor) ? kit.secondaryColor : "#1F8A80";
  const active = project.status === "active";

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "hidden",
        borderRadius: "18px",
        backgroundColor: "#FFFDFB",
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "0 10px 24px rgba(74, 52, 44, 0.05)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: from,
          boxShadow: `0 18px 36px ${from}33`,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          px: 2.25,
          pt: 2.1,
          pb: 2.35,
          background: `linear-gradient(135deg, ${from} 0%, ${to} 78%)`,
        }}
      >
        <Box sx={{ position: "absolute", width: 150, height: 150, right: -40, top: -52, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
        <Box sx={{ position: "absolute", width: 90, height: 90, left: -24, bottom: -36, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
        <Box sx={{ position: "relative", display: "flex", gap: 1.25, alignItems: "flex-start" }}>
          <ProjectMark projectId={project.id} name={project.name} surface="dark" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  letterSpacing: -0.5,
                  color: "#FFF9F5",
                  lineHeight: 1.15,
                }}
                noWrap
              >
                {project.name}
              </Typography>
              <Chip
                size="small"
                label={active ? "Active" : "Inactive"}
                sx={{
                  ml: "auto",
                  height: 22,
                  fontWeight: 700,
                  backgroundColor: "rgba(255,249,245,0.22)",
                  color: "#FFF9F5",
                  border: "1px solid rgba(255,249,245,0.35)",
                }}
              />
            </Box>
            <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 500, fontSize: 13, color: "rgba(255,249,245,0.88)", mt: 0.45 }} noWrap>
              {host || "Add a domain"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 2.25, display: "flex", flexDirection: "column", gap: 1.35, flex: 1 }}>
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            fontSize: 13.5,
            color: "#6B5E57",
            lineHeight: 1.5,
            minHeight: 40,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description || "Add a description in this brand kit."}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7 }}>
          {connected
            .filter((account) => account.platform !== "tiktok" && account.platform !== "whatsapp")
            .map((account) => {
              const label = SOCIAL_PLATFORMS.find((item) => item.id === account.platform)?.label ?? account.platform;
              return (
                <Chip
                  key={account.id}
                  size="small"
                  label={label}
                  sx={{
                    height: 24,
                    fontFamily: FONT_FAMILY,
                    fontWeight: 600,
                    backgroundColor: `${to}18`,
                    color: to,
                    border: `1px solid ${to}33`,
                  }}
                />
              );
            })}
        </Box>

        <Box>
          <Typography sx={{ ...TYPE.eyebrow, color: "#8A6F64", mb: 0.4 }}>Brand voice</Typography>
          <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 13.5, color: "#4A342C" }}>
            {kit.voice.split(".")[0] || "Not set"}
          </Typography>
        </Box>

        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 12, color: "#8A6F64" }}>
              Kit complete
            </Typography>
            <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 12, color: from }}>{score}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 99,
              backgroundColor: SURFACE.well,
              "& .MuiLinearProgress-bar": { borderRadius: 99, background: `linear-gradient(90deg, ${from}, ${to})` },
            }}
          />
        </Box>

        <Button
          variant="contained"
          endIcon={<ArrowForward />}
          onClick={onManage}
          sx={{
            mt: "auto",
            alignSelf: "flex-end",
            borderRadius: "999px",
            px: 2,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${from}, ${to})`,
            "&:hover": { background: to },
          }}
        >
          Manage Brand Kit
        </Button>
      </Box>
    </Box>
  );
}
