import { ArrowForward, DeleteOutlined } from "@mui/icons-material";
import { Box, Button, Chip, IconButton, Typography } from "@mui/material";

import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { ProjectMark } from "../../brand/components/ProjectMark";
import type { Project, SocialAccount } from "../../../types/organization";
import type { ProjectPulse } from "../projectPulse";

const PALETTES = [
  { from: "#FF6B45", to: "#FFB08A", glow: "rgba(255,107,69,0.32)", ink: "#E25030" },
  { from: "#1F8A80", to: "#7ED3C8", glow: "rgba(31,138,128,0.32)", ink: "#176E66" },
  { from: "#E8A838", to: "#F6D48A", glow: "rgba(232,168,56,0.3)", ink: "#C48920" },
  { from: "#7C5CFC", to: "#C4B5FD", glow: "rgba(124,92,252,0.26)", ink: "#5B3FD6" },
] as const;

function paletteFor(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash + id.charCodeAt(index) * (index + 1)) % PALETTES.length;
  return PALETTES[hash] ?? PALETTES[0];
}

type ProjectCardProps = {
  project: Project;
  accounts: SocialAccount[];
  onOpen: () => void;
  onDelete?: () => void;
  active?: boolean;
  pulse?: ProjectPulse;
  delay?: number;
};

export function ProjectCard({
  project,
  accounts,
  onOpen,
  onDelete,
  active = false,
  pulse,
  delay = 0,
}: ProjectCardProps) {
  const connectedCount =
    pulse?.connected ??
    accounts.filter((account) => account.status === "connected").length;

  const modules = [
    project.modules.social ? "Social" : null,
    project.modules.marketing ? "Marketing" : null,
    project.modules.leads ? "Leads" : null,
    project.modules.crm ? "CRM" : null,
  ].filter(Boolean) as string[];

  const palette = paletteFor(project.id);

  return (
    <Box
      onClick={onOpen}
      sx={{
        height: "100%",
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: "18px",
        backgroundColor: "#FFFDFB",
        border: `1px solid ${active ? palette.from : SURFACE.border}`,
        boxShadow: active
          ? `0 16px 32px ${palette.glow}`
          : "0 10px 24px rgba(74, 52, 44, 0.05)",
        animation: "dashIn 0.45s ease both",
        animationDelay: `${delay}ms`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "@keyframes dashIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: palette.from,
          boxShadow: `0 18px 36px ${palette.glow}`,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          px: 2.25,
          pt: 2.1,
          pb: 2.4,
          background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 72%)`,
        }}
      >
        <Box sx={{ position: "absolute", width: 140, height: 140, right: -36, top: -48, borderRadius: "50%", background: "rgba(255,255,255,0.22)" }} />
        <Box sx={{ position: "absolute", width: 88, height: 88, left: -22, bottom: -34, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
        <Box sx={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 1.25 }}>
          <ProjectMark projectId={project.id} name={project.name} surface="dark" />
          <Box sx={{ minWidth: 0, flex: 1, pt: 0.2 }}>
            <Typography sx={{ ...TYPE.eyebrow, color: "rgba(255,249,245,0.82)", letterSpacing: 1.1 }}>
              {project.industry || "Workspace"}
            </Typography>
            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontWeight: 800,
                fontSize: "1.2rem",
                letterSpacing: -0.5,
                lineHeight: 1.15,
                color: "#FFF9F5",
                mt: 0.35,
              }}
              noWrap
            >
              {project.name}
            </Typography>
          </Box>
          {onDelete ? (
            <IconButton
              size="small"
              aria-label={`Delete ${project.name}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              sx={{ color: "rgba(255,249,245,0.88)", ml: "auto" }}
            >
              <DeleteOutlined fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ p: 2.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
          {active ? (
            <Chip
              size="small"
              label="Current"
              sx={{ height: 22, fontWeight: 700, backgroundColor: `${palette.from}1A`, color: palette.ink }}
            />
          ) : null}
          <Chip
            size="small"
            label={project.status === "active" ? "Active" : "Inactive"}
            sx={{
              height: 22,
              fontWeight: 700,
              backgroundColor: project.status === "active" ? "rgba(31,138,128,0.14)" : SURFACE.well,
              color: project.status === "active" ? "#176E66" : "#8A6F64",
            }}
          />
        </Box>
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
          {project.description || "A dedicated brand workspace for social, content, and campaigns."}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mt: 1.5 }}>
          {modules.map((moduleName) => (
            <Chip
              key={moduleName}
              size="small"
              label={moduleName}
              sx={{
                height: 24,
                fontFamily: FONT_FAMILY,
                fontWeight: 600,
                backgroundColor: SURFACE.well,
                color: "#4A342C",
              }}
            />
          ))}
        </Box>

        {pulse ? (
          <Box sx={{ mt: 1.75, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.85 }}>
            <MiniStat label="Scheduled" value={pulse.scheduled} tint={palette.from} />
            <MiniStat label="Inbox" value={pulse.inbox} tint="#1F8A80" />
            <MiniStat label="Leads" value={pulse.leads} tint="#E8A838" />
          </Box>
        ) : null}

        <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 12, color: "#8A6F64" }}>
            {connectedCount} channel{connectedCount === 1 ? "" : "s"}
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForward fontSize="small" />}
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            sx={{
              borderRadius: "999px",
              px: 1.5,
              fontWeight: 700,
              color: "#FFF9F5",
              background: `linear-gradient(135deg, ${palette.from}, ${palette.ink})`,
              "&:hover": { background: palette.ink },
            }}
          >
            Open
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function MiniStat({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <Box sx={{ p: 1.05, borderRadius: "12px", backgroundColor: `${tint}12`, border: `1px solid ${tint}22` }}>
      <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 18, letterSpacing: -0.4, color: tint, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 500, fontSize: 10.5, color: "#8A6F64", mt: 0.4 }}>
        {label}
      </Typography>
    </Box>
  );
}
