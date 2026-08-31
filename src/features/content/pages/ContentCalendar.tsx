import {
  Add,
  ChevronLeft,
  ChevronRight,
  GridView,
  KeyboardArrowDown,
  MoreHoriz,
  PlayArrow,
  ViewList,
} from "@mui/icons-material";
import { Alert, Box, Button, Checkbox, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useMemo, useState, type DragEvent, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import {
  listCreativeConcepts,
  scheduleConcept,
  type CreativeConcept,
} from "../../../services/content/creativesApi";
import { mediaTone } from "../../social/components/PlatformMark";

const VIEWS = [
  { id: "list" as const, label: "List" },
  { id: "week" as const, label: "Week" },
  { id: "month" as const, label: "Month" },
];

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

function prettyTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function monthCells(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  return Array.from({ length: 42 }, (_, index) => addDays(startOfWeek(first), index));
}

function dateLabel(date: Date, month: number) {
  if (date.getMonth() === month) return String(date.getDate());
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Real concepts carry an actual ISO scheduled_at/published_at, not a mock
// recurring weekday — this is the one real date a concept has to show on a
// calendar. Drafts / in-review / approved-but-unscheduled concepts have
// neither, and show in the "Not yet scheduled" strip instead.
function conceptDate(concept: CreativeConcept): Date | null {
  const raw = concept.scheduled_at || concept.published_at;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

// CreativeConcept has no stored "format" field (platforms/format are chosen at
// generation time, not persisted per concept) — infer a display format from
// what was actually generated, rather than fabricating one.
function inferFormat(concept: CreativeConcept): "carousel" | "reel" | "post" {
  if (concept.carousel_slides?.length) return "carousel";
  if (concept.reel_script) return "reel";
  return "post";
}

function placeByDate(concepts: CreativeConcept[], cells: Date[]) {
  const map = new Map<string, CreativeConcept[]>();
  cells.forEach((cell) => map.set(isoDate(cell), []));
  concepts.forEach((concept) => {
    const date = conceptDate(concept);
    if (!date) return;
    const key = isoDate(date);
    if (map.has(key)) map.get(key)?.push(concept);
  });
  for (const list of map.values()) {
    list.sort((a, b) => (conceptDate(a)?.getTime() ?? 0) - (conceptDate(b)?.getTime() ?? 0));
  }
  return map;
}

const STATUS_OPTIONS = ["draft", "in_review", "approved", "scheduled", "published", "rejected"];

export function ContentCalendarPage() {
  const navigate = useNavigate();
  const { currentProject } = useWorkspace();
  const { can } = usePermissions();
  const canReschedule = can(PERMISSIONS.CONTENT_PUBLISH);
  const queryClient = useQueryClient();

  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [compact, setCompact] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ key: string; el: HTMLElement } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["creative-concepts", currentProject?.id, "calendar"],
    queryFn: () => listCreativeConcepts(currentProject!.id).then((res) => res.data ?? []),
    enabled: Boolean(currentProject?.id),
  });

  const reschedule = useMutation({
    mutationFn: ({ conceptId, isoAt }: { conceptId: string; isoAt: string }) =>
      scheduleConcept(currentProject!.id, conceptId, isoAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creative-concepts", currentProject?.id] });
    },
    onError: (error) => setRescheduleError(getApiErrorMessage(error)),
  });

  const concepts = useMemo(() => query.data ?? [], [query.data]);

  const tagOptions = useMemo(
    () => Array.from(new Set(concepts.flatMap((concept) => concept.hashtags ?? []).map((tag) => tag.replace("#", "")))),
    [concepts],
  );

  const filtered = useMemo(() => {
    return concepts.filter((concept) => {
      if (statusFilter.length && !statusFilter.includes(concept.status ?? "draft")) return false;
      if (tagFilter.length) {
        const tags = (concept.hashtags ?? []).map((tag) => tag.replace("#", ""));
        if (!tagFilter.some((tag) => tags.includes(tag))) return false;
      }
      return true;
    });
  }, [concepts, statusFilter, tagFilter]);

  const dated = filtered.filter((concept) => conceptDate(concept));
  const unscheduled = filtered.filter((concept) => !conceptDate(concept));

  const weekStart = startOfWeek(cursor);
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const cells = monthCells(cursor);
  const byDate = useMemo(() => placeByDate(dated, cells), [dated, cells]);
  const filtersActive = statusFilter.length + tagFilter.length > 0;

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

  const openConcept = (concept: CreativeConcept) => navigate(`/app/content/${concept.id}`);
  const openNew = () => navigate("/app/create");

  const dropOnDate = (date: Date) => {
    if (!dragId) return;
    const existing = concepts.find((item) => item.id === dragId);
    const previous = existing ? conceptDate(existing) : null;
    const next = new Date(date);
    // Keep the original time of day when one exists; otherwise default to 9am.
    next.setHours(previous?.getHours() ?? 9, previous?.getMinutes() ?? 0, 0, 0);
    setRescheduleError(null);
    reschedule.mutate({ conceptId: dragId, isoAt: next.toISOString() });
    setDragId(null);
  };

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
          <IconButton size="small" onClick={() => setCompact(true)} sx={{ color: compact ? "#3D2F2A" : "text.secondary" }}>
            <ViewList fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setCompact(false)} sx={{ color: !compact ? "#3D2F2A" : "text.secondary" }}>
            <GridView fontSize="small" />
          </IconButton>
          <ViewSwitch value={view} onChange={setView} />
          <Button variant="contained" startIcon={<Add />} onClick={openNew}>
            Create
          </Button>
        </Box>

        <Box
          sx={{
            ...GLASS_SX,
            px: 2,
            py: 1.15,
            borderRadius: 1,
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(2, minmax(0, 1fr)) auto" },
            gap: 2,
            alignItems: "end",
          }}
        >
          <FilterTrigger label="Status" value={labelFor(statusFilter)} onClick={(event) => setMenu({ key: "status", el: event.currentTarget })} />
          <FilterTrigger label="Tags" value={labelFor(tagFilter)} onClick={(event) => setMenu({ key: "tags", el: event.currentTarget })} />
          <Button
            size="small"
            disabled={!filtersActive}
            onClick={() => {
              setStatusFilter([]);
              setTagFilter([]);
            }}
            sx={{ color: "#1F8A80", fontWeight: 400, justifySelf: { md: "end" }, "&.Mui-disabled": { color: "#B7A59B" } }}
          >
            Clear all
          </Button>
        </Box>

        {query.isError ? <Alert severity="error">{getApiErrorMessage(query.error)}</Alert> : null}
        {rescheduleError ? (
          <Alert severity="error" onClose={() => setRescheduleError(null)}>
            {rescheduleError}
          </Alert>
        ) : null}

        {canReschedule && !query.isLoading ? (
          <Typography variant="caption" color="text.secondary">
            Drag a card to a different day to reschedule it.
          </Typography>
        ) : null}

        {unscheduled.length > 0 ? (
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 13.5 }}>
              Not yet scheduled ({unscheduled.length})
            </Typography>
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 0.5 }}>
              {unscheduled.map((concept) => (
                <Box key={concept.id} sx={{ minWidth: 220, flexShrink: 0 }}>
                  <CalendarConceptCard
                    concept={concept}
                    projectName={currentProject.name}
                    variant="month"
                    draggable={canReschedule}
                    onDragStart={() => setDragId(concept.id)}
                    onSelect={() => openConcept(concept)}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}

        {query.isLoading ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : view === "list" ? (
          <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: { xs: "1fr", md: compact ? "1fr 1fr" : "1fr" } }}>
            {dated.map((concept) => (
              <CalendarConceptCard
                key={concept.id}
                concept={concept}
                projectName={currentProject.name}
                variant="week"
                draggable={canReschedule}
                onDragStart={() => setDragId(concept.id)}
                onSelect={() => openConcept(concept)}
              />
            ))}
          </Box>
        ) : view === "week" ? (
          <WeekGrid
            dates={weekDates}
            byDate={byDate}
            projectName={currentProject.name}
            compact={compact}
            canReschedule={canReschedule}
            onDragStart={setDragId}
            onDrop={dropOnDate}
            onSelect={openConcept}
          />
        ) : (
          <MonthGrid
            cells={cells}
            month={cursor.getMonth()}
            byDate={byDate}
            projectName={currentProject.name}
            canReschedule={canReschedule}
            onDragStart={setDragId}
            onDrop={dropOnDate}
            onSelect={openConcept}
          />
        )}
      </Box>

      <MultiMenu open={menu?.key === "status"} anchorEl={menu?.el} options={STATUS_OPTIONS} selected={statusFilter} onToggle={(value) => setStatusFilter((current) => toggleItem(current, value))} onClose={() => setMenu(null)} />
      <MultiMenu open={menu?.key === "tags"} anchorEl={menu?.el} options={tagOptions} selected={tagFilter} onToggle={(value) => setTagFilter((current) => toggleItem(current, value))} onClose={() => setMenu(null)} />
    </ScreenFrame>
  );
}

function MonthGrid({
  cells,
  month,
  byDate,
  projectName,
  canReschedule,
  onDragStart,
  onDrop,
  onSelect,
}: {
  cells: Date[];
  month: number;
  byDate: Map<string, CreativeConcept[]>;
  projectName: string;
  canReschedule: boolean;
  onDragStart: (id: string) => void;
  onDrop: (date: Date) => void;
  onSelect: (concept: CreativeConcept) => void;
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
          const dayConcepts = byDate.get(key) ?? [];
          const outside = date.getMonth() !== month;
          return (
            <Box
              key={key}
              onDragOver={(event) => canReschedule && event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onDrop(date);
              }}
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
                {dayConcepts.length ? (
                  <Box sx={{ px: 0.7, py: 0.05, borderRadius: "999px", backgroundColor: "#1F8A80", color: "#FFF9F5", fontSize: 10, fontWeight: 800 }}>
                    {dayConcepts.length}
                  </Box>
                ) : null}
              </Box>
              {dayConcepts.map((concept) => (
                <CalendarConceptCard
                  key={concept.id}
                  concept={concept}
                  projectName={projectName}
                  variant="month"
                  draggable={canReschedule}
                  onDragStart={() => onDragStart(concept.id)}
                  onSelect={() => onSelect(concept)}
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
  byDate,
  projectName,
  compact,
  canReschedule,
  onDragStart,
  onDrop,
  onSelect,
}: {
  dates: Date[];
  byDate: Map<string, CreativeConcept[]>;
  projectName: string;
  compact: boolean;
  canReschedule: boolean;
  onDragStart: (id: string) => void;
  onDrop: (date: Date) => void;
  onSelect: (concept: CreativeConcept) => void;
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
        const dayConcepts = byDate.get(isoDate(date)) ?? [];
        return (
          <Box
            key={isoDate(date)}
            onDragOver={(event) => canReschedule && event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onDrop(date);
            }}
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
            </Box>
            {dayConcepts.map((concept) => (
              <CalendarConceptCard
                key={concept.id}
                concept={concept}
                projectName={projectName}
                variant={compact ? "month" : "week"}
                draggable={canReschedule}
                onDragStart={() => onDragStart(concept.id)}
                onSelect={() => onSelect(concept)}
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

function CalendarConceptCard({
  concept,
  projectName,
  variant,
  draggable,
  onDragStart,
  onSelect,
}: {
  concept: CreativeConcept;
  projectName: string;
  variant: "month" | "week";
  draggable: boolean;
  onDragStart: () => void;
  onSelect: () => void;
}) {
  const format = inferFormat(concept);
  const date = conceptDate(concept);
  const video = format === "reel";
  const title = concept.on_image_headline || concept.angle || concept.hook || "Untitled";
  const tagColor = TAG_TONES[title.length % TAG_TONES.length] ?? TAG_TONES[0];
  const compact = variant === "month";

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = "move";
    onDragStart();
  };

  return (
    <Box
      onClick={onSelect}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      sx={{
        mb: 1,
        p: compact ? 1 : 1.2,
        borderRadius: "12px",
        backgroundColor: concept.status === "draft" || concept.status === "in_review" ? "#FFF6D8" : "#FFFDFB",
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "0 6px 14px rgba(74, 52, 44, 0.04)",
        cursor: draggable ? "grab" : "pointer",
        "&:hover": { borderColor: "#D9CBBE", boxShadow: "0 10px 18px rgba(74, 52, 44, 0.07)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.7 }}>
        <StatusBadge status={concept.status} />
        {date ? (
          <Typography sx={{ ml: "auto", fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 11, color: "#8A6F64" }}>
            {prettyTime(date)}
          </Typography>
        ) : null}
      </Box>
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
          {title}
        </Typography>
        {compact ? (
          <Box
            sx={{
              position: "relative",
              width: 44,
              height: 44,
              borderRadius: "8px",
              flexShrink: 0,
              background: `linear-gradient(135deg, ${mediaTone(format)}, ${mediaTone(format)}88)`,
            }}
          >
            {video ? <PlayArrow sx={{ position: "absolute", inset: 0, m: "auto", color: "#FFF9F5", fontSize: 18 }} /> : null}
          </Box>
        ) : null}
      </Box>
      {compact ? null : (
        <Box sx={{ position: "relative", mt: 1, height: 110, borderRadius: "10px", background: `linear-gradient(135deg, ${mediaTone(format)}, ${mediaTone(format)}88)` }}>
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
        {format} · {projectName}
      </Box>
      {concept.compliance_notes?.length ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.7, color: "#C45C4A" }}>
          <MoreHoriz sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: 10.5, fontFamily: FONT_FAMILY }} noWrap>
            {concept.compliance_notes[0]}
          </Typography>
        </Box>
      ) : null}
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
