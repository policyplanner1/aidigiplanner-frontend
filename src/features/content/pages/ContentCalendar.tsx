import {
  Add,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  FileUploadOutlined,
  FilterList,
  GridView,
  Inbox,
  KeyboardArrowDown,
  LocalOfferOutlined,
  MoreHoriz,
  MoreVert,
  PlayArrow,
  ViewList,
  Whatshot,
  AutoAwesome,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useMemo, useState, type MouseEvent } from "react";

import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { getContentFormat } from "../../../constants/contentFormats";
import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { getSocialPosts, type SocialPost } from "../../../services/social/publishingService";
import { handleFromName, mediaTone, PlatformMark } from "../../social/components/PlatformMark";
import { PostComposerDialog } from "../components/PostComposerDialog";

const VIEWS = [
  { id: "list" as const, label: "List" },
  { id: "week" as const, label: "Week" },
  { id: "month" as const, label: "Month" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TAG_TONES = ["#F4C7C3", "#F8D4B0", "#CDE6DC", "#D5D4F5", "#F3E2A8"];

function startOfWeek(date: Date) {
  const next = new Date(date);
  next.setDate(next.getDate() - next.getDay());
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function prettyTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const hour = Number.isFinite(hours) ? hours : 9;
  const minute = Number.isFinite(minutes) ? minutes : 0;
  const suffix = hour >= 12 ? "pm" : "am";
  const twelve = hour % 12 || 12;
  return `${twelve}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function monthCells(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  return Array.from({ length: 42 }, (_, index) => addDays(startOfWeek(first), index));
}

function placePosts(posts: SocialPost[], cells: Date[], month: number) {
  const map = new Map<string, SocialPost[]>();
  cells.forEach((cell) => map.set(isoDate(cell), []));
  WEEKDAYS.forEach((weekday, weekdayIndex) => {
    const inMonth = cells.filter((cell) => cell.getDay() === weekdayIndex && cell.getMonth() === month);
    const fallback = cells.filter((cell) => cell.getDay() === weekdayIndex);
    const dates = inMonth.length ? inMonth : fallback;
    const list = posts
      .filter((post) => post.day === weekday)
      .sort((a, b) => a.time.localeCompare(b.time));
    list.forEach((post, index) => {
      const date = dates[index % dates.length];
      if (!date) return;
      map.get(isoDate(date))?.push(post);
    });
  });
  return map;
}

function dateLabel(date: Date, month: number) {
  if (date.getMonth() === month) return String(date.getDate());
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ContentCalendarPage() {
  const { currentProject } = useWorkspace();
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [compact, setCompact] = useState(false);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [postTypes, setPostTypes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ key: string; el: HTMLElement } | null>(null);
  const [tick, setTick] = useState(0);
  const [composer, setComposer] = useState<{ post: SocialPost | null; date: Date } | null>(null);
  const posts = getSocialPosts(currentProject?.id ?? "none");
  void tick;

  const platforms = useMemo(() => Array.from(new Set(posts.map((post) => post.platform))), [posts]);
  const types = useMemo(() => Array.from(new Set(posts.map((post) => getContentFormat(post.format).label))), [posts]);
  const tagOptions = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.hashtags.split(" ").map((item) => item.replace("#", "")).filter(Boolean)))),
    [posts],
  );

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (profiles.length && !profiles.includes(post.platform)) return false;
      if (postTypes.length && !postTypes.includes(getContentFormat(post.format).label)) return false;
      const postTags = post.hashtags.split(" ").map((item) => item.replace("#", ""));
      if (tags.length && !tags.some((tag) => postTags.includes(tag))) return false;
      return true;
    });
  }, [posts, postTypes, profiles, tags]);

  const weekStart = startOfWeek(cursor);
  const weekDates = WEEKDAYS.map((_, index) => addDays(weekStart, index));
  const cells = monthCells(cursor);
  const byDate = useMemo(() => placePosts(filtered, cells, cursor.getMonth()), [cells, cursor, filtered]);
  const filtersActive = profiles.length + postTypes.length + tags.length > 0;

  const shift = (direction: -1 | 1) => {
    if (view === "month") setCursor(addMonths(cursor, direction));
    else setCursor(addDays(cursor, direction * 7));
  };

  if (!currentProject) {
    return <NeedProject feature="Calendar" />;
  }

  const title =
    view === "month"
      ? formatMonth(cursor)
      : `Week of ${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  const openPost = (post: SocialPost, date: Date) => setComposer({ post, date });
  const openNew = (date: Date) => setComposer({ post: null, date });

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 1.5, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <IconButton size="small" onClick={() => shift(-1)}>
            <ChevronLeft />
          </IconButton>
          <Button size="small" onClick={() => setCursor(new Date())} sx={{ borderRadius: "8px", fontWeight: 700, color: "#3D2F2A" }}>
            Today
          </Button>
          <IconButton size="small" onClick={() => shift(1)}>
            <ChevronRight />
          </IconButton>
          <Typography sx={{ ...TYPE.title, fontSize: { xs: "1.2rem", md: "1.45rem" }, flex: 1, minWidth: 140 }}>
            {title}
          </Typography>
          <Button variant="contained" startIcon={<FilterList />} sx={{ backgroundColor: "#3D2F2A" }}>
            Filters
          </Button>
          <IconButton size="small">
            <Whatshot fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setCompact(true)} sx={{ color: compact ? "#3D2F2A" : "text.secondary" }}>
            <ViewList fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setCompact(false)} sx={{ color: !compact ? "#3D2F2A" : "text.secondary" }}>
            <GridView fontSize="small" />
          </IconButton>
          <ViewSwitch value={view} onChange={setView} />
          <Button startIcon={<AutoAwesome />} sx={{ borderRadius: "10px", fontWeight: 700, color: "#1F8A80" }}>
            AI Assist
          </Button>
          <IconButton size="small">
            <FileUploadOutlined fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            ...GLASS_SX,
            px: 2,
            py: 1.15,
            borderRadius: 1,
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, minmax(0, 1fr)) auto" },
            gap: 2,
            alignItems: "end",
          }}
        >
          <FilterTrigger label="Profiles" value={labelFor(profiles)} onClick={(event) => setMenu({ key: "profiles", el: event.currentTarget })} />
          <FilterTrigger label="Post Types" value={labelFor(postTypes)} onClick={(event) => setMenu({ key: "types", el: event.currentTarget })} />
          <FilterTrigger label="Tags" value={labelFor(tags)} onClick={(event) => setMenu({ key: "tags", el: event.currentTarget })} />
          <Button
            size="small"
            disabled={!filtersActive}
            onClick={() => {
              setProfiles([]);
              setPostTypes([]);
              setTags([]);
            }}
            sx={{ color: "#1F8A80", fontWeight: 400, justifySelf: { md: "end" }, "&.Mui-disabled": { color: "#B7A59B" } }}
          >
            Clear all
          </Button>
        </Box>

        {view === "list" ? (
          <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", md: compact ? "1fr 1fr" : "1fr" } }}>
            {filtered.map((post) => {
              const date = dateForPost(post, byDate) ?? cursor;
              return (
                <CalendarPostCard
                  key={post.id}
                  post={post}
                  projectName={currentProject.name}
                  handle={handleFromName(currentProject.name)}
                  variant="week"
                  onSelect={() => openPost(post, date)}
                />
              );
            })}
          </Box>
        ) : view === "week" ? (
          <WeekGrid
            dates={weekDates}
            posts={filtered}
            projectName={currentProject.name}
            handle={handleFromName(currentProject.name)}
            compact={compact}
            onSelect={openPost}
            onAdd={openNew}
          />
        ) : (
          <MonthGrid
            cells={cells}
            month={cursor.getMonth()}
            byDate={byDate}
            projectName={currentProject.name}
            handle={handleFromName(currentProject.name)}
            onSelect={openPost}
            onAdd={openNew}
          />
        )}
      </Box>

      <PostComposerDialog
        open={Boolean(composer)}
        project={currentProject}
        post={composer?.post ?? null}
        date={composer?.date ?? null}
        onClose={() => setComposer(null)}
        onSaved={() => setTick((value) => value + 1)}
      />

      <MultiMenu open={menu?.key === "profiles"} anchorEl={menu?.el} options={platforms} selected={profiles} onToggle={(value) => setProfiles((current) => toggleItem(current, value))} onClose={() => setMenu(null)} />
      <MultiMenu open={menu?.key === "types"} anchorEl={menu?.el} options={types} selected={postTypes} onToggle={(value) => setPostTypes((current) => toggleItem(current, value))} onClose={() => setMenu(null)} />
      <MultiMenu open={menu?.key === "tags"} anchorEl={menu?.el} options={tagOptions} selected={tags} onToggle={(value) => setTags((current) => toggleItem(current, value))} onClose={() => setMenu(null)} />
    </ScreenFrame>
  );
}

function dateForPost(post: SocialPost, byDate: Map<string, SocialPost[]>) {
  for (const [key, list] of byDate.entries()) {
    if (list.some((item) => item.id === post.id)) {
      const [year, month, day] = key.split("-").map(Number);
      return new Date(year, (month ?? 1) - 1, day ?? 1);
    }
  }
  return null;
}

function MonthGrid({
  cells,
  month,
  byDate,
  projectName,
  handle,
  onSelect,
  onAdd,
}: {
  cells: Date[];
  month: number;
  byDate: Map<string, SocialPost[]>;
  projectName: string;
  handle: string;
  onSelect: (post: SocialPost, date: Date) => void;
  onAdd: (date: Date) => void;
}) {
  return (
    <Box sx={{ border: `1px solid ${SURFACE.border}`, borderRadius: "12px", overflow: "hidden", backgroundColor: "#FFFDFB" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderBottom: `1px solid ${SURFACE.border}` }}>
        {WEEKDAY_LABELS.map((label) => (
          <Typography key={label} sx={{ ...TYPE.label, fontSize: 12, color: "#6B5E57", px: 1.25, py: 1 }}>
            {label}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(7, minmax(0, 1fr))" } }}>
        {cells.map((date) => {
          const key = isoDate(date);
          const dayPosts = byDate.get(key) ?? [];
          const outside = date.getMonth() !== month;
          return (
            <Box
              key={key}
              sx={{
                minHeight: { xs: 180, lg: 210 },
                maxHeight: { lg: 260 },
                overflowY: "auto",
                p: 0.85,
                borderRight: `1px solid ${SURFACE.border}`,
                borderBottom: `1px solid ${SURFACE.border}`,
                backgroundColor: outside ? "#F7F2EC" : "#FFFDFB",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.75, px: 0.25 }}>
                <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: 12, fontWeight: 700, color: outside ? "#B7A59B" : "#6B5E57" }}>
                  {dateLabel(date, month)}
                </Typography>
                {dayPosts.length ? (
                  <Box sx={{ px: 0.7, py: 0.05, borderRadius: "999px", backgroundColor: "#1F8A80", color: "#FFF9F5", fontSize: 10, fontWeight: 800 }}>
                    {dayPosts.length}
                  </Box>
                ) : null}
                <IconButton size="small" onClick={() => onAdd(date)} sx={{ ml: "auto", p: 0.2 }}>
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              {dayPosts.map((post) => (
                <CalendarPostCard
                  key={post.id}
                  post={post}
                  projectName={projectName}
                  handle={handle}
                  variant="month"
                  onSelect={() => onSelect(post, date)}
                />
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function WeekGrid({
  dates,
  posts,
  projectName,
  handle,
  compact,
  onSelect,
  onAdd,
}: {
  dates: Date[];
  posts: SocialPost[];
  projectName: string;
  handle: string;
  compact: boolean;
  onSelect: (post: SocialPost, date: Date) => void;
  onAdd: (date: Date) => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(7, minmax(0, 1fr))" },
        gap: 0,
        border: `1px solid ${SURFACE.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#F3EEE8",
      }}
    >
      {dates.map((date, index) => {
        const dayPosts = posts.filter((post) => post.day === WEEKDAYS[index]);
        return (
          <Box
            key={isoDate(date)}
            sx={{
              minHeight: { xs: 280, lg: "68vh" },
              maxHeight: { lg: "68vh" },
              overflowY: "auto",
              p: 1,
              borderRight: index < 6 ? `1px solid ${SURFACE.border}` : 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1, px: 0.4 }}>
              <Typography sx={{ ...TYPE.label, fontSize: 13, color: "#4A342C" }}>
                {WEEKDAY_LABELS[index]} {date.getDate()}
              </Typography>
              <IconButton size="small" onClick={() => onAdd(date)} sx={{ ml: "auto", p: 0.25 }}>
                <Add sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            {dayPosts.map((post) => (
              <CalendarPostCard
                key={post.id}
                post={post}
                projectName={projectName}
                handle={handle}
                variant={compact ? "month" : "week"}
                onSelect={() => onSelect(post, date)}
              />
            ))}
          </Box>
        );
      })}
    </Box>
  );
}

function toggleItem<T>(current: T[], value: T) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

function labelFor(selected: string[]) {
  if (selected.length === 0) return "Viewing all";
  if (selected.length === 1) return selected[0];
  return `${selected.length} selected`;
}

function ViewSwitch({
  value,
  onChange,
}: {
  value: (typeof VIEWS)[number]["id"];
  onChange: (value: (typeof VIEWS)[number]["id"]) => void;
}) {
  return (
    <Box sx={{ display: "inline-flex", p: "4px", borderRadius: "10px", backgroundColor: SURFACE.well, border: `1px solid ${SURFACE.border}` }}>
      {VIEWS.map((item) => {
        const active = item.id === value;
        return (
          <Box
            key={item.id}
            component="button"
            type="button"
            onClick={() => onChange(item.id)}
            sx={{
              appearance: "none",
              border: 0,
              cursor: "pointer",
              px: 1.6,
              py: 0.7,
              borderRadius: "8px",
              fontFamily: FONT_FAMILY,
              fontWeight: 700,
              fontSize: 13,
              backgroundColor: active ? "#3D2F2A" : "transparent",
              color: active ? "#FFF9F5" : "#4A342C",
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
}

function FilterTrigger({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Box component="button" type="button" onClick={onClick} sx={{ appearance: "none", border: 0, background: "transparent", textAlign: "left", cursor: "pointer", minWidth: 0 }}>
      <Typography sx={{ ...TYPE.label, fontSize: 11, fontWeight: 700, color: "text.secondary" }}>{label}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
        <Typography sx={{ fontWeight: 400, fontSize: 13 }} noWrap>
          {value}
        </Typography>
        <KeyboardArrowDown fontSize="small" />
      </Box>
    </Box>
  );
}

function CalendarPostCard({
  post,
  projectName,
  handle,
  variant,
  onSelect,
}: {
  post: SocialPost;
  projectName: string;
  handle: string;
  variant: "month" | "week";
  onSelect: () => void;
}) {
  const format = getContentFormat(post.format);
  const video = post.format === "reel" || post.format === "short" || post.format === "video";
  const tagColor = TAG_TONES[post.title.length % TAG_TONES.length] ?? TAG_TONES[0];
  const metric = post.status === "published" ? "12%" : post.status === "scheduled" ? "N/A" : "0%";
  const pending = post.status === "draft" || post.status === "in_review";
  const compact = variant === "month";

  return (
    <Box
      onClick={onSelect}
      sx={{
        mb: 1,
        p: compact ? 1 : 1.2,
        borderRadius: "12px",
        backgroundColor: pending ? "#FFF6D8" : "#FFFDFB",
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "0 6px 14px rgba(74, 52, 44, 0.04)",
        cursor: "pointer",
        "&:hover": { borderColor: "#D9CBBE", boxShadow: "0 10px 18px rgba(74, 52, 44, 0.07)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.7 }}>
        {compact ? <PlatformMark platform={post.platform} size={16} /> : <CloudUpload sx={{ fontSize: 16, color: "#8A6F64" }} />}
        <Typography sx={{ ml: "auto", fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 11, color: "#8A6F64" }}>
          {prettyTime(post.time)}
        </Typography>
      </Box>
      {compact ? null : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 0.7 }}>
          <PlatformMark platform={post.platform} size={16} />
          <Typography sx={{ fontFamily: FONT_FAMILY, fontSize: 12, color: "#6B5E57" }}>{handle}</Typography>
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Typography
          sx={{
            flex: 1,
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            fontSize: compact ? 12 : 13.5,
            color: "#3D2F2A",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: compact ? 2 : 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.caption}
        </Typography>
        {compact ? (
          <Box
            sx={{
              position: "relative",
              width: 44,
              height: 44,
              borderRadius: "8px",
              flexShrink: 0,
              background: `linear-gradient(135deg, ${mediaTone(post.format)}, ${mediaTone(post.format)}88)`,
            }}
          >
            {video ? <PlayArrow sx={{ position: "absolute", inset: 0, m: "auto", color: "#FFF9F5", fontSize: 18 }} /> : null}
          </Box>
        ) : null}
      </Box>
      {compact ? null : (
        <Box sx={{ position: "relative", mt: 1, height: 110, borderRadius: "10px", background: `linear-gradient(135deg, ${mediaTone(post.format)}, ${mediaTone(post.format)}88)` }}>
          {video ? <PlayArrow sx={{ position: "absolute", inset: 0, m: "auto", color: "#FFF9F5", fontSize: 28 }} /> : null}
        </Box>
      )}
      <Box
        sx={{
          display: "inline-block",
          mt: 0.85,
          px: 0.85,
          py: 0.2,
          borderRadius: "999px",
          backgroundColor: tagColor,
          fontFamily: FONT_FAMILY,
          fontWeight: 600,
          fontSize: 10.5,
          color: "#4A342C",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {format.label} · {projectName}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mt: 0.7, color: "#8A6F64" }}>
        <MoreHoriz sx={{ fontSize: 16 }} />
        <LocalOfferOutlined sx={{ fontSize: 15, color: "#3D7EA6" }} />
        <Inbox sx={{ fontSize: 15 }} />
        {compact ? (
          <Typography sx={{ ml: "auto", fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: 11, color: "#8A6F64" }}>
            {metric}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function MultiMenu({
  open,
  anchorEl,
  options,
  selected,
  onToggle,
  onClose,
}: {
  open: boolean;
  anchorEl?: HTMLElement;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Menu open={open} anchorEl={anchorEl} onClose={onClose}>
      {options.map((option) => (
        <MenuItem key={option} onClick={() => onToggle(option)}>
          <Checkbox size="small" checked={selected.includes(option)} />
          {option}
        </MenuItem>
      ))}
    </Menu>
  );
}
