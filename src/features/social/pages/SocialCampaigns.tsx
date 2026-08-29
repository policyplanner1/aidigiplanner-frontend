import { Box, Chip, Typography } from "@mui/material";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { getContentFormat } from "../../../constants/contentFormats";
import { useWorkspace } from "../../../hooks/useWorkspace";
import {
  getSocialCampaigns,
  getSocialPosts,
} from "../../../services/social/publishingService";

export function SocialCampaignsPage() {
  const { currentProject } = useWorkspace();
  const campaigns = getSocialCampaigns(currentProject?.id ?? "none");
  const posts = getSocialPosts(currentProject?.id ?? "none");

  if (!currentProject) {
    return <NeedProject feature="Campaigns" />;
  }

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Mixed formats"
          title="Campaigns"
          description={`Group posts, reels, shorts, videos, and blogs for ${currentProject.name}.`}
        />
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {campaigns.map((campaign) => {
            const items = posts.filter((post) => post.campaignId === campaign.id);
            const formats = [...new Set(items.map((item) => getContentFormat(item.format).label))];
            return (
              <Box
                key={campaign.id}
                sx={{
                  ...GLASS_SX,
                  overflow: "hidden",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ height: 10, background: "linear-gradient(90deg, #FF6B45, #1F8A80)" }} />
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="h6">{campaign.name}</Typography>
                    <Chip
                      size="small"
                      color={campaign.status === "active" ? "success" : "default"}
                      label={campaign.status}
                    />
                  </Box>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {campaign.goal}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    {campaign.start} → {campaign.end} · {items.length} pieces
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.75, mt: 1.5, flexWrap: "wrap" }}>
                    {formats.map((label) => (
                      <Chip key={label} size="small" label={label} />
                    ))}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {items.map((item) => (
                      <Typography key={item.id} variant="body2" sx={{ mb: 0.75 }}>
                        {getContentFormat(item.format).label} · {item.platform} — {item.title}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </ScreenFrame>
  );
}
