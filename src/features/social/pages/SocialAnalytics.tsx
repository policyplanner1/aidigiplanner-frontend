import { Alert, Box, Chip, Typography } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader, StatCard } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { getContentFormat } from "../../../constants/contentFormats";
import { useWorkspace } from "../../../hooks/useWorkspace";
import {
  getAnalytics,
  getSocialPosts,
  statusChipColor,
} from "../../../services/social/publishingService";

export function SocialAnalyticsPage() {
  const { currentProject } = useWorkspace();
  const stats = getAnalytics(currentProject?.id ?? "none");
  const posts = getSocialPosts(currentProject?.id ?? "none");

  if (!currentProject) {
    return <NeedProject feature="Analytics" />;
  }

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Performance"
          title="Analytics"
          description={`What is landing for ${currentProject.name} across posts, video, and articles.`}
        />
        <Alert severity="info">
          Sample data — aidigiplanner-backend doesn't have a real analytics/insights
          module yet, so these numbers are illustrative, not live performance data.
        </Alert>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          }}
        >
          <StatCard label="Impressions" value={stats.impressions} hint="This week" />
          <StatCard label="Engagement" value={stats.engagement} hint="Across channels" />
          <StatCard label="Video views" value={stats.videoViews} hint="Reels, shorts, videos" />
          <StatCard label="Published" value={String(stats.published)} hint={`${stats.scheduled} scheduled`} />
        </Box>
        <Box
          sx={{
            ...GLASS_SX,
            p: 2.5,
            borderRadius: 1,
          }}
        >
          <Typography sx={{ fontWeight: 800, mb: 2 }}>Reach this week</Typography>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reach" stroke="#FF6B45" strokeWidth={2} />
                <Line type="monotone" dataKey="engagement" stroke="#1F8A80" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        <Box
          sx={{
            ...GLASS_SX,
            p: 2.5,
            borderRadius: 1,
          }}
        >
          <Typography sx={{ fontWeight: 800, mb: 2 }}>Content performance</Typography>
          {posts.map((post) => (
            <Box
              key={post.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                py: 1.25,
                borderBottom: "1px solid",
                borderColor: "divider",
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{post.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {getContentFormat(post.format).label} · {post.platform}
                </Typography>
              </Box>
              <Chip size="small" color={statusChipColor(post.status)} label={post.status.replace("_", " ")} />
            </Box>
          ))}
        </Box>
      </Box>
    </ScreenFrame>
  );
}
