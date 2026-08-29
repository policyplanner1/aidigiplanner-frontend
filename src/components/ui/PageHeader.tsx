import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { TYPE } from "../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../constants/layout";
import { MiniSparkline, type SparkPoint } from "./MiniSparkline";

export type HeaderStat = {
  label: string;
  value: ReactNode;
  onClick?: () => void;
  active?: boolean;
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  stats?: HeaderStat[];
  sparkline?: SparkPoint[];
  sparkLabel?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  stats,
  sparkline,
  sparkLabel = "Activity",
}: PageHeaderProps) {
  const showAside = Boolean((stats && stats.length > 0) || (sparkline && sparkline.length > 0));

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 1,
        p: { xs: 2.25, md: 3 },
        mb: 2.5,
        color: "text.primary",
        background: `linear-gradient(135deg, ${SURFACE.heroFrom} 0%, ${SURFACE.heroMid} 48%, ${SURFACE.heroTo} 100%)`,
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 220,
          height: 220,
          right: -48,
          top: -80,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,69,0.28), transparent 68%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 160,
          height: 160,
          left: -36,
          bottom: -64,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(31,138,128,0.2), transparent 70%)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: showAside
            ? {
                xs: "1fr",
                lg: stats && stats.length >= 5 ? "minmax(220px, 0.75fr) minmax(0, 1.45fr)" : "1.4fr 0.85fr",
              }
            : "1fr",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", md: showAside ? "column" : "row" },
            alignItems: { xs: "stretch", md: showAside ? "stretch" : "center" },
          }}
        >
          <Box>
            {eyebrow ? (
              <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>
                {eyebrow}
              </Typography>
            ) : null}
            <Typography
              variant="h4"
              sx={{ ...TYPE.title, mt: eyebrow ? 0.75 : 0, fontSize: { xs: "1.35rem", md: "1.55rem" } }}
            >
              {title}
            </Typography>
            {description ? (
              <Typography sx={{ ...TYPE.body, mt: 0.85, color: "text.secondary", maxWidth: 520 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
          {action ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1, flexShrink: 0 }}>
              {action}
            </Stack>
          ) : null}
        </Box>

        {showAside ? (
          <Box sx={{ ...GLASS_SX, p: { xs: 1.25, md: 1.5 }, borderRadius: 1, minWidth: 0 }}>
            {stats && stats.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: stats.length >= 5 ? "repeat(2, minmax(0, 1fr))" : `repeat(${Math.min(stats.length, 2)}, minmax(0, 1fr))`,
                    sm: `repeat(${Math.min(stats.length, 5)}, minmax(0, 1fr))`,
                  },
                  gap: 1.25,
                }}
              >
                {stats.slice(0, 5).map((stat) => (
                  <Box
                    key={stat.label}
                    onClick={stat.onClick}
                    sx={{
                      px: 1.25,
                      py: 1.15,
                      minWidth: 0,
                      borderRadius: 1,
                      backgroundColor: stat.active ? "rgba(31,138,128,0.14)" : SURFACE.well,
                      border: "1px solid",
                      borderColor: stat.active ? "secondary.main" : SURFACE.border,
                      cursor: stat.onClick ? "pointer" : "default",
                    }}
                  >
                    <Box sx={{ ...TYPE.metric, fontSize: 20, color: "primary.main", lineHeight: 1.1 }}>
                      {stat.value}
                    </Box>
                    <Typography
                      sx={{
                        ...TYPE.label,
                        mt: 0.45,
                        color: "text.secondary",
                        fontSize: 10,
                        lineHeight: 1.25,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : null}
            {sparkline && sparkline.length > 0 ? (
              <>
                <Box
                  sx={{
                    height: 72,
                    mt: stats && stats.length > 0 ? 1.25 : 0,
                    borderRadius: 1,
                    px: 0.5,
                    backgroundColor: SURFACE.well,
                  }}
                >
                  <MiniSparkline data={sparkline} height={72} />
                </Box>
                <Typography sx={{ ...TYPE.label, mt: 1, color: "text.secondary", fontSize: 12 }}>
                  {sparkLabel}
                </Typography>
              </>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: string;
  onClick?: () => void;
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "#FF6B45",
  onClick,
}: StatCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        ...GLASS_SX,
        position: "relative",
        overflow: "hidden",
        p: 2,
        borderRadius: 1,
        minHeight: 88,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 10px 22px ${accent}18`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: accent,
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon ? (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              backgroundColor: `${accent}14`,
              color: accent,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ ...TYPE.label, color: "text.secondary" }}>{label}</Typography>
          <Typography sx={{ ...TYPE.metric, fontSize: 22, mt: 0.25 }}>{value}</Typography>
          {hint ? (
            <Typography variant="caption" color="text.secondary" noWrap>
              {hint}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
