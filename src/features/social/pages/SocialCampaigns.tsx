import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { getContentFormat } from "../../../constants/contentFormats";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import {
  getSocialCampaigns,
  getSocialPosts,
  saveSocialCampaign,
} from "../../../services/social/publishingService";

export function SocialCampaignsPage() {
  const navigate = useNavigate();
  const { currentProject } = useWorkspace();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.CAMPAIGN_MANAGE);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const campaigns = getSocialCampaigns(currentProject?.id ?? "none");
  const posts = getSocialPosts(currentProject?.id ?? "none");

  if (!currentProject) {
    return <NeedProject feature="Campaigns" />;
  }

  const create = () => {
    if (!name.trim() || !objective.trim() || !start || !end) {
      setError("Name, objective, start date, and end date are required.");
      return;
    }
    const campaign = saveSocialCampaign({
      projectId: currentProject.id,
      name: name.trim(),
      goal: objective.trim(),
      objective: objective.trim(),
      status: "active",
      start,
      end,
    });
    setOpen(false);
    setName("");
    setObjective("");
    setStart("");
    setEnd("");
    setError(null);
    navigate(`/app/campaigns/${campaign.id}`);
  };

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Mixed formats"
          title="Campaigns"
          description={`Group posts, reels, shorts, videos, and blogs for ${currentProject.name}.`}
          action={
            canManage ? (
              <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
                New Campaign
              </Button>
            ) : null
          }
        />

        {campaigns.length === 0 ? (
          <Box sx={{ ...GLASS_SX, p: 3, borderRadius: 1, maxWidth: 480 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No campaigns yet.</Typography>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>
              Group related content around one goal and timeline.
            </Typography>
            {canManage ? (
              <Button variant="contained" onClick={() => setOpen(true)}>
                New Campaign
              </Button>
            ) : null}
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            {campaigns.map((campaign) => {
              const items = posts.filter((post) => post.campaignId === campaign.id);
              const formats = [...new Set(items.map((item) => getContentFormat(item.format).label))];
              return (
                <Box
                  key={campaign.id}
                  onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                  sx={{ ...GLASS_SX, overflow: "hidden", borderRadius: 1, cursor: "pointer" }}
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
                      {campaign.objective || campaign.goal}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      {campaign.start} → {campaign.end} · {items.length} pieces
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.75, mt: 1.5, flexWrap: "wrap" }}>
                      {formats.map((label) => (
                        <Chip key={label} size="small" label={label} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New campaign</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 0.5 }}>
          {error ? <Typography color="error" variant="body2" sx={{ mb: 1 }}>{error}</Typography> : null}
          <TextField label="Campaign name" fullWidth margin="normal" value={name} onChange={(event) => setName(event.target.value)} />
          <TextField
            label="Objective"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            placeholder="Explain myths, claims, and product fit with posts and reels."
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Start date"
              type="date"
              fullWidth
              margin="normal"
              slotProps={{ inputLabel: { shrink: true } }}
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
            <TextField
              label="End date"
              type="date"
              fullWidth
              margin="normal"
              slotProps={{ inputLabel: { shrink: true } }}
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create}>
            Create campaign
          </Button>
        </DialogActions>
      </Dialog>
    </ScreenFrame>
  );
}

