import {
  BarChart,
  FileUploadOutlined,
  FilterList,
  GridView,
  Inbox,
  InfoOutlined,
  KeyboardArrowDown,
  Link as LinkIcon,
  LocalOfferOutlined,
  MoreHoriz,
  MoreVert,
  Search,
  StarBorder,
  ViewList,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Navigate } from "react-router-dom";

import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { listSocialAccounts } from "../../../services/social/socialAccountsService";
import { PlatformMark } from "../../social/components/PlatformMark";
import {
  comparisonLabel,
  networkLabel,
  periodLabel,
  type SourceFilter,
} from "../profilePerformanceData";
import {
  CONTENT_TYPES,
  POST_AUTHORS,
  POST_METRICS,
  POST_TAGS,
  POST_TYPES,
  PUBLISHED_STATUSES,
  buildPostPerformance,
  formatMetric,
  formatPublishedAt,
  viewingLabel,
  type ContentType,
  type PerformancePost,
  type PostMetricKey,
  type PostTag,
  type PostType,
  type PublishedStatus,
} from "../postPerformanceData";

export function PostPerformancePage() {
  const { can } = usePermissions();
  const { projects } = useWorkspace();
  const [view, setView] = useState<"list" | "grid">("list");
  const [source, setSource] = useState<SourceFilter>({ kind: "all" });
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [tags, setTags] = useState<PostTag[]>([]);
  const [statuses, setStatuses] = useState<PublishedStatus[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<PostMetricKey | "publishedAt">("publishedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [menu, setMenu] = useState<{ key: string; el: HTMLElement } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const listed = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["social-accounts", project.id],
      queryFn: () => listSocialAccounts(project.id),
      enabled: Boolean(project.id),
    })),
  });

  const accounts = useMemo(
    () =>
      listed
        .flatMap((item) => item.data ?? [])
        .filter((item) => item.status === "connected"),
    [listed],
  );

  const report = useMemo(
    () =>
      buildPostPerformance(projects, accounts, source, {
        postTypes,
        contentTypes,
        tags,
        statuses,
        authors,
        query,
      }),
    [accounts, authors, contentTypes, postTypes, projects, query, source, statuses, tags],
  );

  const sortedPosts = useMemo(() => {
    const copy = [...report.posts];
    copy.sort((a, b) => {
      const direction = sortDir === "asc" ? 1 : -1;
      if (sortKey === "publishedAt") {
        return (a.publishedAt.getTime() - b.publishedAt.getTime()) * direction;
      }
      const left = a.metrics[sortKey] ?? -1;
      const right = b.metrics[sortKey] ?? -1;
      return (left - right) * direction;
    });
    return copy;
  }, [report.posts, sortDir, sortKey]);

  useEffect(() => {
    if (sortedPosts.length === 0) {
      if (activeId) setActiveId(null);
      return;
    }
    if (!sortedPosts.some((post) => post.id === activeId)) {
      setActiveId(sortedPosts[0].id);
    }
  }, [activeId, sortedPosts]);

  if (!can(PERMISSIONS.CROSS_NETWORK_VIEW)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const sourceLabel =
    source.kind === "all"
      ? "Viewing all"
      : source.kind === "project"
        ? (projects.find((item) => item.id === source.projectId)?.name ?? "Project")
        : (() => {
            const account = accounts.find((item) => item.id === source.accountId);
            return account
              ? `${networkLabel(account.platform)} ${account.handle ?? account.accountName}`
              : "Account";
          })();

  const filtersActive =
    source.kind !== "all" ||
    postTypes.length > 0 ||
    contentTypes.length > 0 ||
    tags.length > 0 ||
    statuses.length > 0 ||
    authors.length > 0;

  const clearFilters = () => {
    setSource({ kind: "all" });
    setPostTypes([]);
    setContentTypes([]);
    setTags([]);
    setStatuses([]);
    setAuthors([]);
    setQuery("");
  };

  const toggleSort = (key: PostMetricKey | "publishedAt") => {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("desc");
  };

  const activePost = sortedPosts.find((post) => post.id === activeId) ?? null;
  const canClear = filtersActive || query.trim().length > 0;

  return (
    <ScreenFrame>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", flexShrink: 0 }}>
            <Box>
              <Typography sx={{ ...TYPE.title, fontSize: { xs: "1.35rem", md: "1.55rem" } }}>
                Post Performance
              </Typography>
              <Typography sx={{ ...TYPE.body, fontWeight: 400, color: "secondary.dark", mt: 0.5 }}>
                Lifetime activity on posts published from {periodLabel(report.period.from, report.period.to)} (
                {report.timezone})
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
              <Button variant="contained" startIcon={<FilterList />} sx={{ backgroundColor: "#3D2F2A" }}>
                Filters
              </Button>
              <IconButton
                size="small"
                onClick={() => setView("list")}
                sx={{ color: view === "list" ? "#3D2F2A" : "text.secondary" }}
              >
                <ViewList fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setView("grid")}
                sx={{ color: view === "grid" ? "#3D2F2A" : "text.secondary" }}
              >
                <GridView fontSize="small" />
              </IconButton>
              <Box sx={{ ...GLASS_SX, px: 1.25, py: 0.85, borderRadius: 1, fontSize: 12, fontWeight: 400 }}>
                {comparisonLabel(report.period.from, report.period.to, report.period.prevFrom, report.period.prevTo)}
              </Box>
              <IconButton size="small">
                <StarBorder fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <FileUploadOutlined fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ ...GLASS_SX, borderRadius: 1, px: 2, py: 1.5, flexShrink: 0 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(6, minmax(0, 1fr)) auto",
                },
                columnGap: 3,
                rowGap: 1.5,
                alignItems: "end",
              }}
            >
              <FilterTrigger label="Sources" value={sourceLabel} onClick={(event) => setMenu({ key: "source", el: event.currentTarget })} />
              <FilterTrigger
                label="Post Types"
                value={viewingLabel(postTypes)}
                onClick={(event) => setMenu({ key: "postTypes", el: event.currentTarget })}
              />
              <FilterTrigger
                label="Content Types"
                value={viewingLabel(contentTypes)}
                onClick={(event) => setMenu({ key: "contentTypes", el: event.currentTarget })}
              />
              <FilterTrigger
                label="Tags"
                value={viewingLabel(tags)}
                onClick={(event) => setMenu({ key: "tags", el: event.currentTarget })}
              />
              <FilterTrigger
                label="Published Status"
                value={viewingLabel(statuses)}
                onClick={(event) => setMenu({ key: "statuses", el: event.currentTarget })}
              />
              <FilterTrigger
                label="Authors"
                value={viewingLabel(authors)}
                onClick={(event) => setMenu({ key: "authors", el: event.currentTarget })}
              />
              <Button
                size="small"
                onClick={clearFilters}
                disabled={!canClear}
                sx={{
                  justifySelf: { lg: "end" },
                  alignSelf: "end",
                  color: "#1F8A80",
                  fontWeight: 400,
                  minWidth: 88,
                  mb: 0.25,
                  "&.Mui-disabled": { color: "#B7A59B" },
                }}
              >
                Clear all
              </Button>
            </Box>

            <TextField
              size="small"
              fullWidth
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mt: 1.75,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  backgroundColor: "#FFFDFB",
                  fontFamily: FONT_FAMILY,
                  height: 42,
                },
              }}
            />
          </Box>

          <Alert
            icon={<InfoOutlined fontSize="small" />}
            severity="info"
            sx={{
              flexShrink: 0,
              backgroundColor: "#E8F4FB",
              color: "#3D2F2A",
              border: "1px solid #C9E2F2",
              py: 0.5,
              "& .MuiAlert-icon": { color: "#3D7EA6" },
              fontFamily: FONT_FAMILY,
              fontWeight: 400,
            }}
          >
            Facebook Video Views now match native reporting. This metric now records intentional views of at least 3 seconds.
          </Alert>

          <Box
            sx={{
              ...GLASS_SX,
              borderRadius: 1,
              overflow: "hidden",
              backgroundColor: "#FFFDFB",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ px: 2.25, pt: 1.75, pb: 1.25, flexShrink: 0 }}>
              <Typography sx={{ ...TYPE.title, fontSize: "1.05rem", fontWeight: 700 }}>Published Posts</Typography>
              <Typography sx={{ ...TYPE.body, fontWeight: 400, color: "text.secondary" }}>
                Review the lifetime performance of the posts you published during the publishing period.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: view === "grid" ? "1fr" : "320px minmax(0, 1fr)" },
                minHeight: 560,
                height: { xs: "auto", md: "68vh" },
                borderTop: `1px solid ${SURFACE.border}`,
              }}
            >
              <Box
                sx={{
                  borderRight: { md: view === "grid" ? 0 : `1px solid ${SURFACE.border}` },
                  overflowY: "auto",
                  minHeight: { xs: 280, md: 0 },
                  maxHeight: { xs: 360, md: "none" },
                  height: { md: "100%" },
                  backgroundColor: "#FFFBF8",
                }}
              >
                {sortedPosts.length === 0 ? (
                  <Box sx={{ px: 2, py: 5 }}>
                    <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, color: "text.secondary" }}>
                      No published posts match these filters.
                    </Typography>
                  </Box>
                ) : view === "grid" ? (
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      p: 1.5,
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
                    }}
                  >
                    {sortedPosts.map((post) => (
                      <GridPostCard
                        key={post.id}
                        post={post}
                        active={activeId === post.id}
                        onClick={() => setActiveId(post.id)}
                      />
                    ))}
                  </Box>
                ) : (
                  sortedPosts.map((post) => (
                    <PostListItem
                      key={post.id}
                      post={post}
                      active={activeId === post.id}
                      checked={selected.includes(post.id)}
                      onCheck={() =>
                        setSelected((current) =>
                          current.includes(post.id)
                            ? current.filter((id) => id !== post.id)
                            : [...current, post.id],
                        )
                      }
                      onSelect={() => setActiveId(post.id)}
                    />
                  ))
                )}
              </Box>

              {view === "grid" ? null : (
                <Box sx={{ minWidth: 0, minHeight: 0, overflow: "auto", backgroundColor: "#FFFDFB", height: { md: "100%" } }}>
                  <MetricsTable post={activePost} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                </Box>
              )}
            </Box>

            {view === "grid" && activePost ? (
              <Box sx={{ borderTop: `1px solid ${SURFACE.border}`, overflow: "auto" }}>
                <MetricsTable post={activePost} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              </Box>
            ) : null}
          </Box>
      </Box>

      <Menu open={menu?.key === "source"} anchorEl={menu?.el} onClose={() => setMenu(null)}>
        <MenuItem
          selected={source.kind === "all"}
          onClick={() => {
            setSource({ kind: "all" });
            setMenu(null);
          }}
        >
          Viewing all
        </MenuItem>
        {projects.map((project) => (
          <MenuItem
            key={project.id}
            selected={source.kind === "project" && source.projectId === project.id}
            onClick={() => {
              setSource({ kind: "project", projectId: project.id });
              setMenu(null);
            }}
          >
            Project · {project.name}
          </MenuItem>
        ))}
        {accounts.map((account) => (
          <MenuItem
            key={account.id}
            selected={source.kind === "account" && source.accountId === account.id}
            onClick={() => {
              setSource({ kind: "account", accountId: account.id });
              setMenu(null);
            }}
          >
            {networkLabel(account.platform)} {account.handle ?? account.accountName}
          </MenuItem>
        ))}
      </Menu>
      <MultiMenu
        open={menu?.key === "postTypes"}
        anchorEl={menu?.el}
        options={POST_TYPES}
        selected={postTypes}
        onToggle={(value) => setPostTypes((current) => toggleItem(current, value))}
        onClose={() => setMenu(null)}
      />
      <MultiMenu
        open={menu?.key === "contentTypes"}
        anchorEl={menu?.el}
        options={CONTENT_TYPES}
        selected={contentTypes}
        onToggle={(value) => setContentTypes((current) => toggleItem(current, value))}
        onClose={() => setMenu(null)}
      />
      <MultiMenu
        open={menu?.key === "tags"}
        anchorEl={menu?.el}
        options={POST_TAGS}
        selected={tags}
        onToggle={(value) => setTags((current) => toggleItem(current, value))}
        onClose={() => setMenu(null)}
      />
      <MultiMenu
        open={menu?.key === "statuses"}
        anchorEl={menu?.el}
        options={PUBLISHED_STATUSES}
        selected={statuses}
        onToggle={(value) => setStatuses((current) => toggleItem(current, value))}
        onClose={() => setMenu(null)}
      />
      <MultiMenu
        open={menu?.key === "authors"}
        anchorEl={menu?.el}
        options={POST_AUTHORS}
        selected={authors}
        onToggle={(value) => setAuthors((current) => toggleItem(current, value))}
        onClose={() => setMenu(null)}
      />
    </ScreenFrame>
  );
}

function toggleItem<T>(current: T[], value: T) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

const headerCellSx = {
  fontFamily: FONT_FAMILY,
  fontWeight: 400,
  fontSize: 11,
  color: "#8A6F64",
  lineHeight: 1.25,
  whiteSpace: "normal",
  verticalAlign: "bottom",
  borderBottom: `1px solid ${SURFACE.border}`,
  backgroundColor: SURFACE.well,
  px: 1.25,
  py: 1.25,
} as const;

function PostListItem({
  post,
  active,
  checked,
  onCheck,
  onSelect,
}: {
  post: PerformancePost;
  active: boolean;
  checked: boolean;
  onCheck: () => void;
  onSelect: () => void;
}) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        display: "flex",
        gap: 1,
        px: 1.25,
        py: 1.25,
        cursor: "pointer",
        borderBottom: `1px solid ${SURFACE.border}`,
        backgroundColor: active ? "#F3F8F7" : "#FFFBF8",
        borderLeft: active ? "3px solid #1F8A80" : "3px solid transparent",
        "&:hover": { backgroundColor: active ? "#EAF4F2" : SURFACE.well },
      }}
    >
      <Box onClick={(event) => event.stopPropagation()} sx={{ pt: 0.25 }}>
        <Checkbox size="small" checked={checked} onChange={onCheck} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <PostPreview post={post} />
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 11, color: "#8A6F64", mt: 0.5 }}>
          {post.contentType}
        </Typography>
      </Box>
    </Box>
  );
}

function MetricsTable({
  post,
  sortKey,
  sortDir,
  onSort,
}: {
  post: PerformancePost | null;
  sortKey: PostMetricKey | "publishedAt";
  sortDir: "asc" | "desc";
  onSort: (key: PostMetricKey | "publishedAt") => void;
}) {
  if (!post) {
    return (
      <Box sx={{ px: 3, py: 6 }}>
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, color: "text.secondary" }}>
          Select a post to see its performance metrics.
        </Typography>
      </Box>
    );
  }

  const rotate = sortDir === "asc" ? "rotate(180deg)" : "none";

  return (
    <Box component="table" sx={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
      <Box component="thead">
        <Box component="tr">
          <Box
            component="th"
            onClick={() => onSort("publishedAt")}
            sx={{
              ...headerCellSx,
              textAlign: "left",
              minWidth: 188,
              position: "sticky",
              top: 0,
              zIndex: 1,
              cursor: "pointer",
            }}
          >
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
              Published Date
              <KeyboardArrowDown sx={{ fontSize: 14, transform: sortKey === "publishedAt" ? rotate : "none" }} />
            </Box>
          </Box>
          {POST_METRICS.map((metric) => (
            <Box
              key={metric.key}
              component="th"
              onClick={() => onSort(metric.key)}
              sx={{
                ...headerCellSx,
                textAlign: "right",
                minWidth: 128,
                maxWidth: 148,
                position: "sticky",
                top: 0,
                zIndex: 1,
                cursor: "pointer",
              }}
            >
              <Box sx={{ display: "inline-flex", alignItems: "flex-start", justifyContent: "flex-end", gap: 0.35 }}>
                {metric.label}
                <KeyboardArrowDown sx={{ fontSize: 14, mt: "1px", flexShrink: 0, transform: sortKey === metric.key ? rotate : "none" }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Box component="tbody">
        <Box component="tr" sx={{ backgroundColor: "#F3F8F7" }}>
          <Box
            component="td"
            sx={{
              fontFamily: FONT_FAMILY,
              fontWeight: 400,
              fontSize: 12,
              color: "#1F8A80",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              textAlign: "left",
              px: 1.25,
              py: 1.5,
              borderBottom: `1px solid ${SURFACE.border}`,
              whiteSpace: "nowrap",
              verticalAlign: "top",
            }}
          >
            {formatPublishedAt(post.publishedAt)}
          </Box>
          {POST_METRICS.map((metric) => {
            const value = formatMetric(post.metrics[metric.key], metric.kind);
            return (
              <Box
                key={metric.key}
                component="td"
                sx={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: 400,
                  fontSize: 13,
                  color: value === "N/A" ? "#8A6F64" : "#3D2F2A",
                  textAlign: "right",
                  px: 1.25,
                  py: 1.5,
                  borderBottom: `1px solid ${SURFACE.border}`,
                  whiteSpace: "nowrap",
                  verticalAlign: "top",
                }}
              >
                {value}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function PostPreview({ post }: { post: PerformancePost }) {
  return (
    <Box sx={{ display: "grid", gap: 0.6, py: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <PlatformMark platform={post.platformLabel} size={16} />
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 12, color: "#6B5E57" }} noWrap>
          {post.handle}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "6px",
            flexShrink: 0,
            background: `linear-gradient(135deg, ${post.thumbnail} 0%, ${post.thumbnail}99 100%)`,
          }}
        />
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontWeight: 400,
            fontSize: 12,
            color: "#3D2F2A",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.caption}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#8A6F64" }}>
        <MoreHoriz sx={{ fontSize: 16 }} />
        <LocalOfferOutlined sx={{ fontSize: 15 }} />
        <Inbox sx={{ fontSize: 15 }} />
        <BarChart sx={{ fontSize: 15 }} />
        <LinkIcon sx={{ fontSize: 15 }} />
      </Box>
    </Box>
  );
}

function GridPostCard({
  post,
  active,
  onClick,
}: {
  post: PerformancePost;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: `1px solid ${active ? "#1F8A80" : SURFACE.border}`,
        borderRadius: 1,
        p: 1.5,
        backgroundColor: active ? "#F3F8F7" : "#FFFBF8",
        cursor: "pointer",
      }}
    >
      <PostPreview post={post} />
      <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 11, color: "#8A6F64", mt: 1 }}>
        {formatPublishedAt(post.publishedAt)}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mt: 1.25 }}>
        <MiniStat label="Impressions" value={formatMetric(post.metrics.impressions, "count")} />
        <MiniStat label="Engagements" value={formatMetric(post.metrics.engagements, "count")} />
        <MiniStat label="Rate" value={formatMetric(post.metrics.engagementRate, "rate")} />
      </Box>
    </Box>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 11, color: "#8A6F64" }}>{label}</Typography>
      <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 14, color: "#3D2F2A" }}>{value}</Typography>
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
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        appearance: "none",
        border: 0,
        background: "transparent",
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        minWidth: 0,
        pr: 0.5,
      }}
    >
      <Typography sx={{ ...TYPE.label, fontSize: 11, fontWeight: 700, color: "text.secondary" }}>{label}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ fontWeight: 400, fontSize: 13 }} noWrap>
          {value}
        </Typography>
        <KeyboardArrowDown fontSize="small" />
      </Box>
    </Box>
  );
}

function MultiMenu<T extends string>({
  open,
  anchorEl,
  options,
  selected,
  onToggle,
  onClose,
}: {
  open: boolean;
  anchorEl?: HTMLElement;
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
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
