import { AutoAwesome, Delete } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { CONTENT_FORMATS, getContentFormat, type ContentFormatId } from "../../../constants/contentFormats";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import {
  deleteSocialCampaign,
  generateContentDraft,
  getBestTimes,
  getSocialCampaign,
  getSocialPosts,
  saveSocialCampaign,
  saveSocialPost,
} from "../../../services/social/publishingService";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CampaignDetailPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useWorkspace();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.CAMPAIGN_MANAGE);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [format, setFormat] = useState<ContentFormatId>("post");
  const [postCount, setPostCount] = useState(4);

  const campaign = campaignId ? getSocialCampaign(campaignId) : null;

  if (!currentProject || !campaign || campaign.projectId !== currentProject.id) {
    return <Navigate to="/app/campaigns" replace />;
  }

  const posts = getSocialPosts(currentProject.id).filter((post) => post.campaignId === campaign.id);

  const setStatus = (status: "active" | "paused" | "completed") => {
    saveSocialCampaign({ ...campaign, status });
  };

  const generatePlan = () => {
    const contentFormat = getContentFormat(format);
    const platform = contentFormat.platforms[0] ?? "Instagram";
    const times = getBestTimes(platform);
    for (let index = 0; index < postCount; index += 1) {
      const draft = generateContentDraft({
        brief: `${campaign.objective || campaign.goal} — piece ${index + 1} of ${postCount}`,
        format,
        platform,
        voice: "Professional",
        audience: campaign.audience || "the target audience",
      });
      saveSocialPost({
        projectId: currentProject.id,
        campaignId: campaign.id,
        format,
        platform,
        title: draft.title,
        caption: draft.caption,
        hashtags: draft.hashtags,
        hook: draft.hook,
        script: draft.script,
        cta: draft.cta,
        day: WEEKDAYS[index % WEEKDAYS.length],
        time: times[index % times.length],
        status: "draft",
      });
    }
  };

  const removeCampaign = () => {
    deleteSocialCampaign(campaign.id);
    navigate("/app/campaigns");
  };

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5, maxWidth: 900 }}>
        <PageHeader
          eyebrow={currentProject.name}
          title={campaign.name}
          description={campaign.objective || campaign.goal}
          action={
            canManage ? (
              <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            ) : null
          }
        />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Chip label={`${campaign.start} → ${campaign.end}`} />
          {canManage ? (
            <TextField
              select
              size="small"
              label="Status"
              value={campaign.status}
              onChange={(event) => setStatus(event.target.value as "active" | "paused" | "completed")}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          ) : (
            <Chip color={campaign.status === "active" ? "success" : "default"} label={campaign.status} />
          )}
        </Box>

        {canManage ? (
          <Box sx={{ ...GLASS_SX, p: 2.25, borderRadius: 1, display: "grid", gap: 1.25 }}>
            <Typography sx={{ fontWeight: 700 }}>Generate a content plan</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
              Drafts topics, captions, hashtags, and a suggested schedule for this campaign as
              draft posts you can review and refine.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              <TextField
                select
                size="small"
                label="Format"
                value={format}
                onChange={(event) => setFormat(event.target.value as ContentFormatId)}
                sx={{ minWidth: 160 }}
              >
                {CONTENT_FORMATS.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="How many"
                value={postCount}
                onChange={(event) => setPostCount(Number(event.target.value))}
                sx={{ minWidth: 120 }}
              >
                {[3, 4, 5, 6, 8].map((count) => (
                  <MenuItem key={count} value={count}>
                    {count} pieces
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="contained" startIcon={<AutoAwesome />} onClick={generatePlan}>
                Generate
              </Button>
            </Box>
          </Box>
        ) : null}

        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1.25 }}>Content in this campaign ({posts.length})</Typography>
          {posts.length === 0 ? (
            <Alert severity="info">No content yet. Generate a plan above, or add existing posts to this campaign.</Alert>
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {posts.map((post) => (
                <Box
                  key={post.id}
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    border: `1px solid ${SURFACE.border}`,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{post.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getContentFormat(post.format).label} · {post.platform} · {post.day} {post.time}
                    </Typography>
                  </Box>
                  <Chip size="small" label={post.status.replace("_", " ")} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete campaign</DialogTitle>
        <DialogContent>
          <Typography>
            Delete "{campaign.name}"? Its posts stay in Content but won't be grouped under this campaign anymore.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={removeCampaign}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </ScreenFrame>
  );
}
