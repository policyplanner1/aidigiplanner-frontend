import { Add, AutoAwesome, Inbox, KeyboardArrowRight } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { useCountUp } from "../useCountUp";

type DashboardHeroProps = {
  greeting: string;
  name: string;
  organization: string;
  projectName: string;
  dateLabel: string;
  scheduled: number;
  openInbox: number;
  inReview: number;
  trend: Array<{ day: string; reach: number }>;
  canCreateProject: boolean;
  showInbox: boolean;
  showStudio: boolean;
  onCreateProject: () => void;
  onCreateContent: () => void;
  onOpenInbox: () => void;
  onOpenAnalytics: () => void;
};

const ARROW_PATH =
  "M12 1.6 H196 L218.4 23 L196 44.4 H12 C6.2 44.4 1.6 39.8 1.6 34 V12 C1.6 6.2 6.2 1.6 12 1.6 Z";

function ChevronAction({
  tone,
  icon,
  label,
  onClick,
}: {
  tone: "primary" | "secondary" | "accent";
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  const styles = {
    primary: { color: "#FFF9F5", fill: "#FF6B45", stroke: "#FF6B45", shadow: "0 10px 20px rgba(255,107,69,0.24)" },
    secondary: { color: "#1F8A80", fill: "#FFFFFF", stroke: "#1F8A80", shadow: "0 8px 18px rgba(31,138,128,0.12)" },
    accent: { color: "#FFF9F5", fill: "#1F8A80", stroke: "#1F8A80", shadow: "0 10px 20px rgba(31,138,128,0.22)" },
  }[tone];

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        appearance: "none",
        border: 0,
        background: "transparent",
        cursor: "pointer",
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        height: 46,
        pl: 2.25,
        pr: 4.25,
        color: styles.color,
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: -0.1,
        filter: `drop-shadow(${styles.shadow})`,
        transition: "transform 0.2s ease, filter 0.2s ease",
        "&:hover": {
          transform: "translateX(4px)",
        },
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 220 46"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <path d={ARROW_PATH} fill={styles.fill} stroke={styles.stroke} strokeWidth="1.8" strokeLinejoin="round" />
      </Box>
      <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 1 }}>
        {icon}
        {label}
      </Box>
    </Box>
  );
}

export function DashboardHero({
  greeting,
  name,
  organization,
  projectName,
  dateLabel,
  scheduled,
  openInbox,
  inReview,
  trend,
  canCreateProject,
  showInbox,
  showStudio,
  onCreateProject,
  onCreateContent,
  onOpenInbox,
  onOpenAnalytics,
}: DashboardHeroProps) {
  const scheduledCount = useCountUp(scheduled);
  const inboxCount = useCountUp(openInbox);
  const reviewCount = useCountUp(inReview);

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        p: { xs: 2.5, md: 3.25 },
        color: "text.primary",
        background: `linear-gradient(135deg, ${SURFACE.heroFrom} 0%, ${SURFACE.heroMid} 48%, ${SURFACE.heroTo} 100%)`,
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
        animation: "dashIn 0.55s ease both",
        "@keyframes dashIn": {
          from: { opacity: 0, transform: "translateY(14px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 260,
          height: 260,
          right: -50,
          top: -90,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,69,0.32), transparent 68%)",
          animation: "floatBlob 8s ease-in-out infinite",
          "@keyframes floatBlob": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(10px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 180,
          height: 180,
          left: -40,
          bottom: -70,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(31,138,128,0.22), transparent 70%)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 0.9fr" },
          alignItems: "center",
        }}
      >
        <Box>
          <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>
            {dateLabel}
          </Typography>
          <Typography variant="h4" sx={{ ...TYPE.title, mt: 0.85, fontSize: { xs: "1.45rem", md: "1.7rem" } }}>
            {greeting}, {name}
          </Typography>
          <Typography sx={{ ...TYPE.body, mt: 1, color: "text.secondary", maxWidth: 500 }}>
            {organization} · {projectName}. Switch product in the top bar to keep branding, social accounts, and content separate.
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mt: 2.75,
              flexWrap: "wrap",
              pr: 1,
            }}
          >
            {showStudio ? (
              <ChevronAction
                tone="primary"
                icon={<AutoAwesome sx={{ fontSize: 18 }} />}
                label="+ Create with AI"
                onClick={onCreateContent}
              />
            ) : null}
            {showInbox ? (
              <ChevronAction
                tone="secondary"
                icon={<Inbox sx={{ fontSize: 18 }} />}
                label="Open inbox"
                onClick={onOpenInbox}
              />
            ) : null}
            {canCreateProject ? (
              <ChevronAction
                tone="accent"
                icon={<Add sx={{ fontSize: 18 }} />}
                label="Add product"
                onClick={onCreateProject}
              />
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            ...GLASS_SX,
            p: 2.1,
            borderRadius: "16px",
          }}
        >
          <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>
            This week
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              mt: 1.5,
            }}
          >
            <MiniStat label="Scheduled" value={scheduledCount} />
            <MiniStat label="Inbox" value={inboxCount} />
            <MiniStat label="Approvals" value={reviewCount} />
          </Box>
          <Box
            onClick={onOpenAnalytics}
            sx={{
              height: 78,
              mt: 1.5,
              cursor: "pointer",
              borderRadius: 1,
              px: 0.5,
              backgroundColor: SURFACE.well,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 4, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="dashReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F8A80" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#1F8A80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="#1F8A80"
                  fill="url(#dashReach)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
          <Box
            onClick={onOpenAnalytics}
            sx={{
              mt: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              color: "text.secondary",
            }}
          >
            <Typography sx={{ ...TYPE.label, color: "text.secondary" }}>
              Reach trend
            </Typography>
            <KeyboardArrowRight fontSize="small" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Box
      sx={{
        px: 1,
        py: 1,
        borderRadius: 1,
        backgroundColor: SURFACE.well,
      }}
    >
      <Typography sx={{ ...TYPE.metric, fontSize: 22, color: "primary.main" }}>
        {value}
      </Typography>
      <Typography sx={{ ...TYPE.label, mt: 0.2, color: "text.secondary", fontSize: 11 }}>
        {label}
      </Typography>
    </Box>
  );
}
