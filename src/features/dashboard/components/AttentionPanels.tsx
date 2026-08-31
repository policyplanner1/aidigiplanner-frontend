import {
  AutoAwesomeOutlined,
  CalendarMonthOutlined,
  ChatBubbleOutlined,
  EmojiEventsOutlined,
  FactCheckOutlined,
  InboxOutlined,
  KeyboardArrowRight,
  NotificationsActiveOutlined,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { getContentFormat } from "../../../constants/contentFormats";
import type { AttentionItem } from "../dashboardData";
import type { PublishStatus, SocialPost } from "../../../services/social/publishingService";
import { PlatformMark } from "../../social/components/PlatformMark";

type AttentionPanelsProps = {
  attention: AttentionItem[];
  weekPosts: SocialPost[];
  onOpen: (path: string) => void;
};

const STATUS_TONE: Record<PublishStatus, { bg: string; color: string }> = {
  published: { bg: "#1F8A80", color: "#FFF9F5" },
  scheduled: { bg: "#FF6B45", color: "#FFF9F5" },
  in_review: { bg: "#E8A838", color: "#3D2F2A" },
  approved: { bg: "#2A9D6A", color: "#FFF9F5" },
  rejected: { bg: "#E25030", color: "#FFF9F5" },
  draft: { bg: "#E8DDD2", color: "#6B5E57" },
};

export function AttentionPanels({ attention, weekPosts, onOpen }: AttentionPanelsProps) {
  const uniqueAttention = uniqueBy(attention, (item) => `${item.label}|${item.detail}`);
  const uniquePosts = uniqueBy(weekPosts, (post) => `${post.title}|${post.day}|${post.time}|${post.platform}`);

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
      }}
    >
      <Panel
        title="Needs attention"
        subtitle="Reply or approve these first."
        accent="#FF6B45"
        icon={<NotificationsActiveOutlined sx={{ fontSize: 18 }} />}
      >
        {uniqueAttention.length === 0 ? (
          <Empty text="You are caught up." />
        ) : (
          uniqueAttention.map((item) => (
            <Row key={item.id} onClick={() => onOpen(item.path)}>
              <Glyph accent={item.tone === "warn" ? "#E25030" : "#1F8A80"}>{attentionIcon(item.label)}</Glyph>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ ...TYPE.section, fontWeight: 700 }}>{item.label}</Typography>
                <Typography noWrap sx={{ fontFamily: FONT_FAMILY, fontSize: 12.5, color: "text.secondary", mt: 0.2 }}>
                  {item.detail}
                </Typography>
              </Box>
              <ArrowChip accent={item.tone === "warn" ? "#E25030" : "#1F8A80"} />
            </Row>
          ))
        )}
      </Panel>

      <Panel
        title="On the calendar"
        subtitle="Going out today and this week."
        accent="#1F8A80"
        icon={<CalendarMonthOutlined sx={{ fontSize: 18 }} />}
      >
        {uniquePosts.length === 0 ? (
          <Empty text="No posts slotted yet. Create one in Studio." />
        ) : (
          uniquePosts.map((post) => {
            const tone = STATUS_TONE[post.status];
            return (
              <Row key={post.id} onClick={() => onOpen("/app/calendar")}>
                <PlatformMark platform={post.platform} size={28} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ ...TYPE.section, fontWeight: 700 }} noWrap>
                    {post.title}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: 12.5, color: "text.secondary", mt: 0.2 }}>
                    {post.day} {post.time} · {post.platform} · {getContentFormat(post.format).label}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: "999px",
                    backgroundColor: tone.bg,
                    color: tone.color,
                    fontFamily: FONT_FAMILY,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "capitalize",
                    flexShrink: 0,
                  }}
                >
                  {post.status.replace("_", " ")}
                </Box>
              </Row>
            );
          })
        )}
      </Panel>
    </Box>
  );
}

function Panel({
  title,
  subtitle,
  accent,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 2.25,
        borderRadius: "18px",
        background: `linear-gradient(180deg, #FFFDFB 0%, ${accent}10 100%)`,
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "0 10px 24px rgba(74,52,44,0.06)",
        animation: "dashIn 0.5s ease both",
        "@keyframes dashIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(180px 100px at 100% 0%, ${accent}22, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.25, mb: 0.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            color: "#FFF9F5",
            background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
            boxShadow: `0 8px 16px ${accent}33`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography sx={{ ...TYPE.title, fontSize: "1.08rem" }}>{title}</Typography>
          <Typography sx={{ ...TYPE.body, color: "text.secondary", fontSize: 13 }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ position: "relative", mt: 1.5, display: "grid", gap: 0.75 }}>{children}</Box>
    </Box>
  );
}

function Row({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.15,
        px: 1.15,
        py: 1.1,
        borderRadius: "14px",
        backgroundColor: "rgba(255,253,251,0.72)",
        border: `1px solid ${SURFACE.border}`,
        cursor: "pointer",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "#D9CBBE",
          boxShadow: "0 10px 18px rgba(74,52,44,0.08)",
        },
      }}
    >
      {children}
    </Box>
  );
}

function Glyph({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "12px",
        display: "grid",
        placeItems: "center",
        backgroundColor: `${accent}18`,
        color: accent,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

function ArrowChip({ accent }: { accent: string }) {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: "8px",
        display: "grid",
        placeItems: "center",
        backgroundColor: `${accent}18`,
        color: accent,
        flexShrink: 0,
      }}
    >
      <KeyboardArrowRight sx={{ fontSize: 18 }} />
    </Box>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Typography sx={{ ...TYPE.body, color: "text.secondary", py: 1.5, px: 0.5 }}>
      {text}
    </Typography>
  );
}

export type TopPerformingItem = { id: string; label: string; detail: string };

export function TopPerformingPanel({
  items,
  onOpen,
}: {
  items: TopPerformingItem[];
  onOpen: (path: string) => void;
}) {
  const uniqueItems = uniqueBy(items, (item) => item.id);
  return (
    <Panel
      title="Top-performing content"
      subtitle="Your most recently published posts."
      accent="#7C5CFC"
      icon={<EmojiEventsOutlined sx={{ fontSize: 18 }} />}
    >
      {uniqueItems.length === 0 ? (
        <Empty text="Nothing published yet." />
      ) : (
        uniqueItems.map((item) => (
          <Row key={item.id} onClick={() => onOpen("/app/calendar")}>
            <Glyph accent="#7C5CFC">
              <EmojiEventsOutlined sx={{ fontSize: 18 }} />
            </Glyph>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ ...TYPE.section, fontWeight: 700 }} noWrap>
                {item.label}
              </Typography>
              <Typography noWrap sx={{ fontFamily: FONT_FAMILY, fontSize: 12.5, color: "text.secondary", mt: 0.2 }}>
                {item.detail}
              </Typography>
            </Box>
            <ArrowChip accent="#7C5CFC" />
          </Row>
        ))
      )}
    </Panel>
  );
}

export function AiRecommendationsPanel({ items }: { items: string[] }) {
  return (
    <Panel
      title="AI recommendations"
      subtitle="Suggested next steps for this product."
      accent="#1F8A80"
      icon={<AutoAwesomeOutlined sx={{ fontSize: 18 }} />}
    >
      {items.length === 0 ? (
        <Empty text="You are all caught up." />
      ) : (
        items.map((text, index) => (
          <Row key={`${index}_${text}`} onClick={() => undefined}>
            <Glyph accent="#1F8A80">
              <AutoAwesomeOutlined sx={{ fontSize: 18 }} />
            </Glyph>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: 600 }}>{text}</Typography>
            </Box>
          </Row>
        ))
      )}
    </Panel>
  );
}

function attentionIcon(label: string) {
  const text = label.toLowerCase();
  if (text.includes("message")) return <InboxOutlined sx={{ fontSize: 18 }} />;
  if (text.includes("approval")) return <FactCheckOutlined sx={{ fontSize: 18 }} />;
  return <ChatBubbleOutlined sx={{ fontSize: 18 }} />;
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const next = key(item);
    if (seen.has(next)) return false;
    seen.add(next);
    return true;
  });
}
