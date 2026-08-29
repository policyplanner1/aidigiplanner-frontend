import {
  CalendarMonth,
  Campaign,
  Close,
  ChatBubbleOutlined,
  FavoriteBorder,
  KeyboardArrowDown,
  PlayArrow,
  SendOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";

import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { getContentFormat } from "../../../constants/contentFormats";
import { getSocialAccounts } from "../../../services/projects/projectService";
import { getSocialCampaigns, saveSocialPost, type SocialPost } from "../../../services/social/publishingService";
import { handleFromName, mediaTone, PlatformMark } from "../../social/components/PlatformMark";
import type { Project } from "../../../types/organization";

const SUGGESTED_LABELS = ["blog", "webinar", "announcement"];

type PostComposerDialogProps = {
  open: boolean;
  project: Project;
  post: SocialPost | null;
  date: Date | null;
  onClose: () => void;
  onSaved: () => void;
};

export function PostComposerDialog({ open, project, post, date, onClose, onSaved }: PostComposerDialogProps) {
  const handle = handleFromName(project.name);
  const accounts = getSocialAccounts(project.id).filter((item) => item.status === "connected");
  const campaigns = getSocialCampaigns(project.id);
  const [tab, setTab] = useState<"preview" | "assist">("preview");
  const [caption, setCaption] = useState("");
  const [story, setStory] = useState(false);
  const [draft, setDraft] = useState(false);
  const [firstComment, setFirstComment] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [labelDraft, setLabelDraft] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [when, setWhen] = useState<"immediately" | "scheduled">("scheduled");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [networks, setNetworks] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    const nextNetworks = post ? [post.platform] : accounts.slice(0, 3).map((item) => item.platform === "x" ? "X" : item.platform[0].toUpperCase() + item.platform.slice(1));
    setCaption(post ? `${post.caption}${post.hashtags ? `\n\n${post.hashtags}` : ""}` : "");
    setStory(post?.format === "story");
    setDraft(post?.status === "draft");
    setFirstComment("");
    setLabels(post ? [getContentFormat(post.format).label, project.name] : []);
    setCampaignId(post?.campaignId ?? campaigns[0]?.id ?? "");
    setWhen(post?.status === "published" ? "immediately" : "scheduled");
    setScheduleDate(date ? isoDate(date) : isoDate(new Date()));
    setScheduleTime(post?.time ?? "09:00");
    setNetworks(nextNetworks.length ? nextNetworks : ["Instagram"]);
    setTab("preview");
    setSaved(false);
  }, [accounts, campaigns, date, open, post, project.name]);

  const missingSchedule = when === "scheduled" && (!scheduleDate || !scheduleTime);
  const title =
    post?.status === "in_review" || post?.status === "approved"
      ? "Needs approval post"
      : post
        ? "Edit post"
        : "New post";

  const previewDate = scheduleDate
    ? new Date(`${scheduleDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Apr 15";

  const save = () => {
    if (missingSchedule) return;
    const weekday = scheduleDate
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(`${scheduleDate}T00:00:00`).getDay()]
      : post?.day ?? "Mon";
    saveSocialPost({
      id: post?.id,
      projectId: project.id,
      campaignId: campaignId || null,
      format: story ? "story" : post?.format ?? "post",
      platform: networks[0] ?? post?.platform ?? "Instagram",
      title: post?.title ?? caption.slice(0, 42),
      caption: caption.split("\n")[0] ?? caption,
      hashtags: caption.match(/#[\w]+/g)?.join(" ") ?? post?.hashtags ?? "",
      hook: post?.hook ?? "",
      script: post?.script ?? "",
      cta: post?.cta ?? "",
      day: weekday ?? "Mon",
      time: scheduleTime,
      status: draft ? "draft" : post?.status === "published" ? "published" : "scheduled",
    });
    setSaved(true);
    onSaved();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" slotProps={{ paper: { sx: { height: "90vh", display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden" } } }}>
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.25, backgroundColor: SURFACE.heroMid, borderBottom: `1px solid ${SURFACE.border}`, flexShrink: 0 }}>
        <Typography sx={{ ...TYPE.section, fontWeight: 800, flex: 1 }}>{title}</Typography>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" }, minHeight: 0, flex: 1 }}>
        <Box sx={{ overflow: "auto", p: 2.25, borderRight: `1px solid ${SURFACE.border}`, backgroundColor: "#FFFDFB" }}>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1.5 }}>
            {networks.map((network) => (
              <Chip key={network} size="small" label={network} onDelete={() => setNetworks((current) => current.filter((item) => item !== network))} />
            ))}
          </Box>
          <FormControlLabel control={<Switch checked={story} onChange={(_, checked) => setStory(checked)} />} label="This is a story" />
          <TextField
            fullWidth
            multiline
            minRows={7}
            placeholder="Write the caption for this post..."
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <Box sx={{ mt: 1.25, display: "flex", gap: 1.25, alignItems: "flex-end" }}>
            <Box sx={{ position: "relative", width: 72, height: 72, borderRadius: "10px", background: `linear-gradient(135deg, ${mediaTone(post?.format ?? "post")}, #FFD7C8)` }}>
              {(post?.format === "reel" || post?.format === "video" || post?.format === "short") ? <PlayArrow sx={{ position: "absolute", inset: 0, m: "auto", color: "#FFF9F5" }} /> : null}
            </Box>
            <Button size="small">Add alt text</Button>
            <Typography sx={{ ml: "auto", fontFamily: FONT_FAMILY, fontSize: 12, color: "#8A6F64" }}>{caption.length}</Typography>
          </Box>
          <Button sx={{ mt: 1.5 }} size="small">Customize post per network</Button>
          <FormControlLabel control={<Switch checked={draft} onChange={(_, checked) => setDraft(checked)} />} label="This is a draft" />
          <TextField fullWidth size="small" label="First comment" placeholder="Add a first comment..." value={firstComment} onChange={(event) => setFirstComment(event.target.value)} sx={{ mt: 1 }} />

          <Button size="small" sx={{ mt: 1.5 }}>Invite collaborators</Button>
          <Section title="Publishing workflow">
            <FormControl fullWidth size="small">
              <InputLabel>Approval workflow</InputLabel>
              <Select label="Approval workflow" defaultValue="agency">
                <MenuItem value="agency">Agency approval workflow</MenuItem>
                <MenuItem value="none">No approval required</MenuItem>
              </Select>
            </FormControl>
          </Section>

          <Section title="Labels" action={<Button size="small" onClick={() => setLabels([])}>Remove all</Button>}>
            <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: 12, color: "#8A6F64", mb: 1 }}>
              Use labels to organize, filter, and report on your content.
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1 }}>
              {labels.map((label) => (
                <Chip key={label} size="small" label={label} onDelete={() => setLabels((current) => current.filter((item) => item !== label))} />
              ))}
            </Box>
            <TextField
              size="small"
              fullWidth
              placeholder="Add labels"
              value={labelDraft}
              onChange={(event) => setLabelDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && labelDraft.trim()) {
                  event.preventDefault();
                  setLabels((current) => Array.from(new Set([...current, labelDraft.trim()])));
                  setLabelDraft("");
                }
              }}
            />
            <Box sx={{ display: "flex", gap: 0.75, mt: 1, flexWrap: "wrap" }}>
              {SUGGESTED_LABELS.map((label) => (
                <Chip key={label} size="small" label={`${label} +`} onClick={() => setLabels((current) => Array.from(new Set([...current, label])))} />
              ))}
            </Box>
          </Section>

          <Section title="Campaign">
            <FormControl fullWidth size="small">
              <InputLabel>Add a campaign</InputLabel>
              <Select label="Add a campaign" value={campaignId} onChange={(event) => setCampaignId(event.target.value)} startAdornment={<Campaign sx={{ mr: 1, color: "text.secondary" }} fontSize="small" />}>
                <MenuItem value="">None</MenuItem>
                {campaigns.map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Section>

          <Section title="Promote">
            <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: 12, color: "#8A6F64", mb: 1 }}>
              Select only one Facebook Page or Instagram Business profile to promote this post.
            </Typography>
            <Button disabled variant="outlined" size="small">
              Boost post
            </Button>
          </Section>

          <Section title="When to post">
            <FormControl fullWidth size="small" sx={{ mb: 1.25 }}>
              <InputLabel>When to post</InputLabel>
              <Select label="When to post" value={when} onChange={(event) => setWhen(event.target.value as "immediately" | "scheduled")}>
                <MenuItem value="immediately">Immediately</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <TextField size="small" type="date" label="Date" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField size="small" type="time" label="Time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <Button size="small" sx={{ mt: 1 }} startIcon={<CalendarMonth fontSize="small" />}>
              Use optimal times
            </Button>
          </Section>

          <Box sx={{ mt: 1.5, p: 1.25, borderRadius: "10px", border: `1px solid ${SURFACE.border}` }}>
            <Typography sx={{ fontWeight: 700, mb: 0.75 }}>{missingSchedule ? "1 error" : "Ready to submit"}</Typography>
            {missingSchedule ? (
              <Alert severity="error">Please choose a day or time to schedule this post.</Alert>
            ) : (
              <Alert severity="success">This post has a schedule and at least one network.</Alert>
            )}
          </Box>

          {saved ? <Alert sx={{ mt: 1.5 }} severity="success">Saved for {project.name}.</Alert> : null}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" disabled={missingSchedule} onClick={save}>
              Submit
            </Button>
          </Box>
        </Box>

        <Box sx={{ overflow: "auto", p: 2, backgroundColor: "#F3EEE8" }}>
          <Tabs value={tab} onChange={(_event, value: "preview" | "assist") => setTab(value)} sx={{ mb: 1.5, minHeight: 40, "& .MuiTab-root": { textTransform: "none", minHeight: 40, fontWeight: 700 } }}>
            <Tab value="preview" label="Network preview" />
            <Tab value="assist" label="AI Assist" />
          </Tabs>
          {tab === "assist" ? (
            <Alert severity="info">AI Assist uses this project’s brand kit only — voice, pillars, and banned claims stay inside {project.name}.</Alert>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Alert severity="info">Preview is an approximation of how this post may appear on each network.</Alert>
              {networks.map((network) => (
                <NetworkPreview key={network} network={network} projectName={project.name} handle={handle} caption={caption} date={previewDate} format={post?.format ?? "post"} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${SURFACE.border}` }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography sx={{ ...TYPE.label, flex: 1 }}>{title}</Typography>
        {action}
        <IconButton size="small" onClick={() => setOpen((current) => !current)}>
          <KeyboardArrowDown sx={{ transform: open ? "rotate(180deg)" : "none" }} />
        </IconButton>
      </Box>
      <Collapse in={open}>{children}</Collapse>
    </Box>
  );
}

function NetworkPreview({
  network,
  projectName,
  handle,
  caption,
  date,
  format,
}: {
  network: string;
  projectName: string;
  handle: string;
  caption: string;
  date: string;
  format: string;
}) {
  const instagram = network.toLowerCase().includes("instagram");
  return (
    <Box sx={{ backgroundColor: "#FFFDFB", borderRadius: "12px", border: `1px solid ${SURFACE.border}`, overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.5, py: 1, borderBottom: `1px solid ${SURFACE.border}` }}>
        <PlatformMark platform={network} size={16} />
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{network}</Typography>
      </Box>
      {instagram ? (
        <Box>
          <Box sx={{ position: "relative", height: 240, background: `linear-gradient(135deg, ${mediaTone(format)}, #1F8A80)` }}>
            {(format === "reel" || format === "video" || format === "short") ? <PlayArrow sx={{ position: "absolute", inset: 0, m: "auto", color: "#FFF9F5", fontSize: 42 }} /> : null}
          </Box>
          <Box sx={{ px: 1.5, py: 1.25 }}>
            <Box sx={{ display: "flex", gap: 1.25, color: "#4A342C", mb: 1 }}>
              <FavoriteBorder fontSize="small" />
              <ChatBubbleOutlined fontSize="small" />
              <SendOutlined fontSize="small" />
            </Box>
            <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: 13, lineHeight: 1.55 }}>
              <Box component="span" sx={{ fontWeight: 800 }}>{handle.replace("@", "")}</Box> {caption || "Write a caption to preview this post."}
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 11, color: "#8A6F64", letterSpacing: 0.6 }}>{date.toUpperCase()}</Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#1F8A80", color: "#FFF9F5", display: "grid", placeItems: "center", fontWeight: 800 }}>
              {projectName.charAt(0)}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{projectName}</Typography>
              <Typography sx={{ fontSize: 11, color: "#8A6F64" }}>{date}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: 13, lineHeight: 1.55, mb: 1.25 }}>{caption || "Write a caption to preview this post."}</Typography>
          <Box sx={{ height: 160, borderRadius: "10px", background: `linear-gradient(135deg, ${mediaTone(format)}, #FFD7C8)` }} />
          <Box sx={{ display: "flex", gap: 2, mt: 1.25, color: "#6B5E57", fontSize: 12, fontWeight: 700 }}>
            <span>Like</span>
            <span>Comment</span>
            <span>Share</span>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
