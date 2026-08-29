import {
  AutoAwesome,
  CalendarMonthOutlined,
  CampaignOutlined,
  FactCheckOutlined,
  FolderOutlined,
  InboxOutlined,
  InsightsOutlined,
  LeaderboardOutlined,
  PaletteOutlined,
  PermMediaOutlined,
  ShareOutlined,
  SmartToyOutlined,
  TimelineOutlined,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import type { ReactNode } from "react";

import type { SnapshotItem } from "../dashboardData";
import { KpiTile } from "./KpiTile";

type FeatureSnapshotGridProps = {
  items: SnapshotItem[];
  onOpen: (path: string) => void;
};

const ICONS: Record<string, ReactNode> = {
  brand: <PaletteOutlined sx={{ fontSize: 18 }} />,
  studio: <AutoAwesome sx={{ fontSize: 18 }} />,
  calendar: <CalendarMonthOutlined sx={{ fontSize: 18 }} />,
  inbox: <InboxOutlined sx={{ fontSize: 18 }} />,
  approvals: <FactCheckOutlined sx={{ fontSize: 18 }} />,
  campaigns: <CampaignOutlined sx={{ fontSize: 18 }} />,
  analytics: <InsightsOutlined sx={{ fontSize: 18 }} />,
  media: <PermMediaOutlined sx={{ fontSize: 18 }} />,
  agents: <SmartToyOutlined sx={{ fontSize: 18 }} />,
  leads: <LeaderboardOutlined sx={{ fontSize: 18 }} />,
  crm: <TimelineOutlined sx={{ fontSize: 18 }} />,
  accounts: <ShareOutlined sx={{ fontSize: 18 }} />,
};

export function FeatureSnapshotGrid({ items, onOpen }: FeatureSnapshotGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
      }}
    >
      {items.map((item, index) => (
        <KpiTile
          key={item.id}
          label={item.label}
          value={item.value}
          hint={item.hint}
          accent={item.accent}
          delay={80 + index * 40}
          icon={ICONS[item.id] ?? <FolderOutlined sx={{ fontSize: 18 }} />}
          onClick={() => onOpen(item.path)}
        />
      ))}
    </Box>
  );
}
