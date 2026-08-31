import { Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useState } from "react";

import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { NeedProject } from "../../../components/ui/NeedProject";
import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getInboxItems, replyToInbox, type InboxItem } from "../../../services/social/publishingService";
import { PlatformMark } from "../components/PlatformMark";

const filters = [
  { id: "all" as const, label: "All" },
  { id: "comment" as const, label: "Comments" },
  { id: "mention" as const, label: "Mentions" },
  { id: "message" as const, label: "Messages" },
];

export function SocialInboxPage() {
  const { currentProject } = useWorkspace();
  const { can } = usePermissions();
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const items = getInboxItems(currentProject?.id ?? "none").filter(
    (item) => filter === "all" || item.type === filter,
  );
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  if (!currentProject) {
    return <NeedProject feature="Inbox" />;
  }

  const canReply = can(PERMISSIONS.SOCIAL_MANAGE) || can(PERMISSIONS.CONTENT_CREATE);

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2 }}>
        <PageHeader
          eyebrow="Conversations"
          title="Inbox"
          description={`Comments, mentions, and replies for ${currentProject.name}.`}
        />
        <CapsuleFilter items={filters} value={filter} onChange={setFilter} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px 1fr" }, gap: 2, alignItems: "start" }}>
          <Box sx={{ display: "grid", gap: 1 }}>
            {items.map((item) => (
              <Box
                key={item.id}
                onClick={() => { setSelectedId(item.id); setDraft(""); }}
                sx={{
                  ...GLASS_SX,
                  p: 1.25,
                  borderRadius: "10px",
                  cursor: "pointer",
                  borderColor: selected?.id === item.id ? "secondary.main" : SURFACE.border,
                  backgroundColor: selected?.id === item.id ? SURFACE.heroTo : undefined,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <PlatformMark platform={item.platform} size={16} />
                  <Typography sx={{ ...TYPE.label, fontSize: 12 }} noWrap>
                    {item.author}
                  </Typography>
                  <Chip size="small" label={item.type} sx={{ ml: "auto" }} />
                </Box>
                <Typography variant="body2" noWrap sx={{ mt: 0.5 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          {selected ? (
            <ThreadPanel
              item={selected}
              canReply={canReply}
              draft={draft}
              onDraft={setDraft}
              onSend={() => {
                if (!draft.trim()) return;
                replyToInbox(selected.id, draft.trim());
                setDraft("");
              }}
            />
          ) : null}
        </Box>
      </Box>
    </ScreenFrame>
  );
}

function ThreadPanel({
  item,
  canReply,
  draft,
  onDraft,
  onSend,
}: {
  item: InboxItem;
  canReply: boolean;
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <Box sx={{ ...GLASS_SX, p: 2, borderRadius: "12px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#1F8A80", color: "#FFF9F5", display: "grid", placeItems: "center", fontWeight: 800 }}>
          {item.author.charAt(0).toUpperCase()}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800 }}>{item.author}</Typography>
          <Typography variant="caption" color="text.secondary">
            {item.platform} · {item.type} · {item.time}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          p: 1.5,
          borderRadius: "4px 14px 14px 14px",
          border: `1px solid ${SURFACE.border}`,
          backgroundColor: "#FFFBF8",
          maxWidth: 520,
        }}
      >
        <Typography variant="body2">{item.text}</Typography>
      </Box>

      <Typography sx={{ ...TYPE.label, mt: 2.5, mb: 1 }}>Replies</Typography>
      <Box sx={{ display: "grid", gap: 1, mb: 2 }}>
        {item.replies.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No replies yet.
          </Typography>
        ) : (
          item.replies.map((reply) => (
            <Box
              key={reply.id}
              sx={{
                justifySelf: reply.fromBrand ? "end" : "start",
                maxWidth: "80%",
                p: 1.25,
                borderRadius: reply.fromBrand ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                backgroundColor: reply.fromBrand ? "rgba(31,138,128,0.12)" : "#FFFBF8",
                border: `1px solid ${SURFACE.border}`,
              }}
            >
              <Typography sx={{ ...TYPE.label, fontSize: 11 }}>{reply.author}</Typography>
              <Typography variant="body2">{reply.text}</Typography>
              <Typography variant="caption" color="text.secondary">
                {reply.time}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {canReply ? (
        <Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box sx={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#FF6B45", color: "#FFF9F5", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
              W
            </Box>
            <TextField
              size="small"
              fullWidth
              placeholder="Continue the conversation..."
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
            <Typography variant="caption" color="text.secondary">
              {draft.length}/500
            </Typography>
          </Box>
          <Button variant="contained" sx={{ mt: 1.25, borderRadius: "999px" }} disabled={!draft.trim()} onClick={onSend}>
            Reply
          </Button>
        </Box>
      ) : (
        <Chip label={item.status === "replied" ? "Replied" : "Open"} />
      )}
    </Box>
  );
}
