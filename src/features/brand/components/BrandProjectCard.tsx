import { ArrowForward } from "@mui/icons-material";
import { Box, Button, Chip, LinearProgress, Typography } from "@mui/material";

import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { SOCIAL_PLATFORMS } from "../../../constants/platforms";
import type { Project, SocialAccount } from "../../../types/organization";
import { displayHost, type BrandProfileForm } from "../../../services/brand/brandProfileService";
import { ProjectMark } from "./ProjectMark";

type BrandProjectCardProps = {
  project: Project;
  profile: BrandProfileForm;
  accounts: SocialAccount[];
  score: number;
  onManage: () => void;
};

export function BrandProjectCard({ project, profile, accounts, score, onManage }: BrandProjectCardProps) {
  const host = displayHost(profile);
  const connected = accounts.filter((item) => item.status === "connected");
  const from = /^#[0-9A-Fa-f]{6}$/.test(profile.primaryColor) ? profile.primaryColor : "#FF6B45";
  const active = project.status === "active";

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "hidden",
        borderRadius: "16px",
        backgroundColor: "#FFFEFC",
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "0 1px 2px rgba(74, 52, 44, 0.04)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: `${from}55`,
          boxShadow: `0 14px 28px ${from}1f`,
        },
      }}
    >
      <Box sx={{ height: 5, background: "linear-gradient(90deg, #FF6B45, #1F8A80)" }} />

      <Box sx={{ px: 2.25, pt: 2, display: "flex", gap: 1.25, alignItems: "flex-start" }}>
        <ProjectMark projectId={project.id} name={project.name} surface="light" size={48} radius={14} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontWeight: 800,
                fontSize: "1.05rem",
                letterSpacing: -0.4,
                color: "#4A342C",
                lineHeight: 1.2,
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
                height: 20,
                fontWeight: 700,
                fontSize: 11,
                backgroundColor: active ? "#1F8A8014" : SURFACE.well,
                color: active ? "#1F8A80" : "#8A6F64",
                border: `1px solid ${active ? "#1F8A8033" : SURFACE.border}`,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.3 }}>
            <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 500, fontSize: 12.5, color: "#8A6F64" }} noWrap>
              {host || "Add a domain"}
            </Typography>
            {project.industry ? (
              <>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#D8C7BC", flexShrink: 0 }} />
                <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 500, fontSize: 12.5, color: "#8A6F64" }} noWrap>
                  {project.industry}
                </Typography>
              </>
            ) : null}
          </Box>
        </Box>
      </Box>

      <Box sx={{ mx: 2.25, mt: 1.75, borderTop: `1px solid ${SURFACE.border}` }} />

      <Box sx={{ px: 2.25, pb: 2.25, pt: 1.75, display: "flex", flexDirection: "column", gap: 1.35, flex: 1 }}>
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
          {project.description || "Add a description in this brand profile."}
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
                    backgroundColor: "#1F8A8018",
                    color: "#1F8A80",
                    border: "1px solid #1F8A8033",
                  }}
                />
              );
            })}
          {connected.length === 0 ? (
            <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 500, fontSize: 12.5, color: "#B8A89D", fontStyle: "italic" }}>
              No accounts connected yet
            </Typography>
          ) : null}
        </Box>

        <Box>
          <Typography sx={{ ...TYPE.eyebrow, color: "#8A6F64", mb: 0.4 }}>Brand voice</Typography>
          <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 13.5, color: "#4A342C" }}>
            {profile.voice.split(".")[0] || "Not set"}
          </Typography>
        </Box>

        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 12, color: "#8A6F64" }}>
              Profile complete
            </Typography>
            <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 12, color: "#FF6B45" }}>{score}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 99,
              backgroundColor: SURFACE.well,
              "& .MuiLinearProgress-bar": { borderRadius: 99, background: "linear-gradient(90deg, #FF6B45, #1F8A80)" },
            }}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForward />}
          onClick={onManage}
          sx={{
            mt: "auto",
            alignSelf: "flex-end",
            borderRadius: "999px",
            px: 2,
            fontWeight: 700,
          }}
        >
          Manage Brand Profile
        </Button>
      </Box>
    </Box>
  );
}
