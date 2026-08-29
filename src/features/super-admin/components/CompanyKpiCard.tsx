import { AutoAwesome, Campaign, ExpandLess, ExpandMore, Group, Share } from "@mui/icons-material";
import { Box, Chip, Collapse, Typography } from "@mui/material";

import { AnimatedCount } from "../../../components/ui/AnimatedCount";
import { TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { CompanyKpiExpand } from "./CompanyKpiExpand";

type CompanyKpiCardProps = {
  name: string;
  slug: string;
  status: string;
  members: number;
  activeUsers: number;
  connectedAccounts: number;
  aiGenerations: number;
  postsPublished: number;
  open: boolean;
  onToggle: () => void;
  companyId: string;
};

const mini = [
  { key: "members", label: "Members", icon: <Group sx={{ fontSize: 16 }} />, accent: "#FF6B45" },
  { key: "activeUsers", label: "Active users", icon: <Group sx={{ fontSize: 16 }} />, accent: "#1F8A80" },
  { key: "connectedAccounts", label: "Connected accounts", icon: <Share sx={{ fontSize: 16 }} />, accent: "#E8A838" },
  { key: "aiGenerations", label: "AI generations", icon: <AutoAwesome sx={{ fontSize: 16 }} />, accent: "#FF6B45" },
  { key: "postsPublished", label: "Posts published", icon: <Campaign sx={{ fontSize: 16 }} />, accent: "#1F8A80" },
] as const;

export function CompanyKpiCard({
  name,
  slug,
  status,
  members,
  activeUsers,
  connectedAccounts,
  aiGenerations,
  postsPublished,
  open,
  onToggle,
  companyId,
}: CompanyKpiCardProps) {
  const values = { members, activeUsers, connectedAccounts, aiGenerations, postsPublished };

  return (
    <Box
      sx={{
        ...GLASS_SX,
        borderRadius: 1,
        overflow: "hidden",
        borderColor: open ? "secondary.main" : SURFACE.border,
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 24px rgba(74, 52, 44, 0.08)",
        },
      }}
    >
      <Box onClick={onToggle} sx={{ p: 2, cursor: "pointer" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.75 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #FF6B45, #1F8A80)",
              color: "#FFF9F5",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ ...TYPE.section }} noWrap>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {slug}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={status.replace("_", " ")}
            color={status === "active" ? "success" : status === "pending_approval" ? "warning" : "default"}
          />
          {open ? <ExpandLess /> : <ExpandMore />}
        </Box>

        {!open ? (
          <Box
            sx={{
              display: "grid",
              gap: 1,
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" },
            }}
          >
            {mini.map((item) => (
              <Box
                key={item.key}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: SURFACE.well,
                  border: `1px solid ${SURFACE.border}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: item.accent, mb: 0.4 }}>
                  {item.icon}
                  <Typography sx={{ ...TYPE.label, fontSize: 10, color: "text.secondary" }} noWrap>
                    {item.label}
                  </Typography>
                </Box>
                <AnimatedCount value={values[item.key]} fontSize={18} color={item.accent} />
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: 2, pb: 2, pt: 0.5, borderTop: `1px solid ${SURFACE.border}` }}>
          <CompanyKpiExpand companyId={companyId} />
        </Box>
      </Collapse>
    </Box>
  );
}
