import type { Project, SocialAccount, SocialPlatform } from "../../types/organization";
import {
  REPORT_NETWORKS,
  currentPeriod,
  filterAccounts,
  networkLabel,
  type SourceFilter,
} from "./profilePerformanceData";

export const POST_TYPES = ["Organic Post", "Paid Post", "Reply", "Story"] as const;
export const CONTENT_TYPES = ["Image", "Video", "Carousel", "Reel", "Story", "Text"] as const;
export const PUBLISHED_STATUSES = ["Published", "Scheduled", "Draft"] as const;
export const POST_TAGS = ["launch", "product", "community", "seasonal", "tips"] as const;
export const POST_AUTHORS = ["Alex Rivera", "Jordan Lee", "Sam Patel"] as const;

export type PostType = (typeof POST_TYPES)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];
export type PublishedStatus = (typeof PUBLISHED_STATUSES)[number];
export type PostTag = (typeof POST_TAGS)[number];

export type PostMetricKind = "count" | "rate" | "duration";

export const POST_METRICS = [
  { key: "impressions", label: "Impressions", kind: "count" },
  { key: "avgReach", label: "Average Reach per Post", kind: "count" },
  { key: "potentialReach", label: "Potential Reach per Post", kind: "count" },
  { key: "engagementRate", label: "Engagement Rate (per Impression)", kind: "rate" },
  { key: "engagements", label: "Engagements", kind: "count" },
  { key: "reactions", label: "Reactions", kind: "count" },
  { key: "comments", label: "Comments", kind: "count" },
  { key: "shares", label: "Shares", kind: "count" },
  { key: "saves", label: "Saves", kind: "count" },
  { key: "postLinkClicks", label: "Post Link Clicks", kind: "count" },
  { key: "platformLinkClicks", label: "Platform Link Clicks", kind: "count" },
  { key: "otherPostClicks", label: "Other Post Clicks", kind: "count" },
  { key: "otherEngagements", label: "Other Engagements", kind: "count" },
  { key: "videoViews", label: "Video Views", kind: "count" },
  { key: "skipRate", label: "Skip Rate", kind: "rate" },
  { key: "crosspostedReelsViews", label: "Crossposted Reels Views", kind: "count" },
  { key: "reelsViews", label: "Reels Views", kind: "count" },
  { key: "tapsBack", label: "Taps Back", kind: "count" },
  { key: "tapsForward", label: "Taps Forward", kind: "count" },
  { key: "storyExits", label: "Story Exits", kind: "count" },
  { key: "storyReplies", label: "Story Replies", kind: "count" },
  { key: "pollVotes", label: "Poll Votes", kind: "count" },
  { key: "videoTimeWatched", label: "Video Time Watched", kind: "duration" },
  { key: "viewRate", label: "View Rate", kind: "rate" },
] as const;

export type PostMetricKey = (typeof POST_METRICS)[number]["key"];
export type PostMetrics = Record<PostMetricKey, number | null>;

export type PerformancePost = {
  id: string;
  accountId: string;
  projectId: string;
  platform: SocialPlatform;
  platformLabel: string;
  handle: string;
  caption: string;
  thumbnail: string;
  postType: PostType;
  contentType: ContentType;
  tags: PostTag[];
  author: string;
  status: PublishedStatus;
  publishedAt: Date;
  metrics: PostMetrics;
};

export type MetricTotals = Record<PostMetricKey, number | null>;
export type MetricChanges = Record<PostMetricKey, number | null>;

export type PostPerformanceFilters = {
  source: SourceFilter;
  postTypes: PostType[];
  contentTypes: ContentType[];
  tags: PostTag[];
  statuses: PublishedStatus[];
  authors: string[];
  query: string;
};

const CAPTIONS = [
  "Myth: health cover is only for hospital stays. Fact: the right plan also helps with diagnostics and daycare procedures.",
  "If you only save one reel this week, make it this checklist for a calmer claims day.",
  "Waiting periods explained without the jargon — save this for your next policy review.",
  "Three questions to ask before you renew. Start with coverage that actually matches how your family uses care.",
  "A quiet reminder: preventative visits often cost less than waiting. Share this with someone who needs it.",
  "Carousel: what is in a typical claim pack, what is optional, and what to keep on your phone.",
  "Story poll — would you rather a higher deductible or a lower monthly premium?",
  "New drop: summer wellness tips in 15 seconds. Watch to the end for the offer code.",
  "Behind the scenes of this week’s shoot. Which frame should we post next?",
  "Reply: thanks for asking — here is the short version of how waiting periods work.",
  "Team recap from the weekend market stall. Community first, always.",
  "Product spotlight: the family plan most people skip, and why it is worth a second look.",
];

const THUMB_TONES = ["#FF6B45", "#1F8A80", "#E2507A", "#7C5CFC", "#E8A838", "#5B6CFF", "#C9A227"];

function hash(value: string) {
  let next = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    next ^= value.charCodeAt(index);
    next = Math.imul(next, 16777619);
  }
  return next >>> 0;
}

function range(seed: number, min: number, max: number) {
  return min + (seed % (max - min + 1));
}

function pick<T>(seed: number, items: readonly T[]) {
  return items[seed % items.length] as T;
}

function storyMetrics(contentType: ContentType) {
  return contentType === "Story";
}

function videoMetrics(contentType: ContentType) {
  return contentType === "Video" || contentType === "Reel";
}

function emptyMetrics(): PostMetrics {
  return Object.fromEntries(POST_METRICS.map((item) => [item.key, null])) as PostMetrics;
}

function metricsFor(seed: number, contentType: ContentType): PostMetrics {
  const next = emptyMetrics();
  const isStory = storyMetrics(contentType);
  const isVideo = videoMetrics(contentType);

  if (!isStory) {
    next.impressions = range(seed, 40, 18200);
    next.avgReach = range(seed >> 1, 28, 9400);
    next.potentialReach = range(seed >> 2, 80, 22000);
    next.engagements = range(seed >> 3, 2, 860);
    next.reactions = range(seed >> 4, 1, 420);
    next.comments = range(seed >> 5, 0, 86);
    next.shares = range(seed >> 6, 0, 64);
    next.saves = range(seed >> 7, 0, 120);
    next.postLinkClicks = range(seed >> 8, 0, 94);
    next.platformLinkClicks = range(seed >> 9, 0, 38);
    next.otherPostClicks = range(seed >> 10, 0, 52);
    next.otherEngagements = range(seed >> 11, 0, 28);
    next.engagementRate = next.impressions
      ? Math.round((next.engagements / next.impressions) * 1000) / 10
      : 0;
  }

  if (isVideo) {
    next.videoViews = range(seed >> 2, 80, 24600);
    next.skipRate = range(seed >> 4, 4, 38) / 10;
    next.reelsViews = contentType === "Reel" ? range(seed >> 3, 60, 18400) : null;
    next.crosspostedReelsViews = contentType === "Reel" ? range(seed >> 5, 0, 3200) : null;
    next.videoTimeWatched = range(seed >> 6, 40, 5400);
    next.viewRate = range(seed >> 7, 12, 86) / 10;
  }

  if (isStory) {
    next.impressions = range(seed, 20, 2400);
    next.engagements = range(seed >> 3, 1, 180);
    next.tapsBack = range(seed >> 4, 2, 86);
    next.tapsForward = range(seed >> 5, 8, 240);
    next.storyExits = range(seed >> 6, 1, 64);
    next.storyReplies = range(seed >> 7, 0, 22);
    next.pollVotes = range(seed >> 8, 0, 48);
    next.engagementRate = next.impressions
      ? Math.round((next.engagements / next.impressions) * 1000) / 10
      : 0;
  }

  return next;
}

function contentTypeFor(platform: SocialPlatform, seed: number): ContentType {
  if (platform === "youtube") return pick(seed, ["Video", "Video", "Text"] as const);
  if (platform === "tiktok") return pick(seed, ["Reel", "Video"] as const);
  if (platform === "instagram") return pick(seed, ["Image", "Carousel", "Reel", "Story"] as const);
  if (platform === "facebook") return pick(seed, ["Image", "Video", "Carousel", "Story"] as const);
  if (platform === "threads" || platform === "x") return pick(seed, ["Text", "Image"] as const);
  return pick(seed, CONTENT_TYPES);
}

function postTypeFor(contentType: ContentType, seed: number): PostType {
  if (contentType === "Story") return "Story";
  return pick(seed, ["Organic Post", "Organic Post", "Paid Post", "Reply"] as const);
}

export function formatMetric(value: number | null, kind: PostMetricKind) {
  if (value == null) return "N/A";
  if (kind === "rate") return `${value.toFixed(1).replace(/\.0$/, "")}%`;
  if (kind === "duration") {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${Math.floor(value % 60)}s`;
  }
  return value.toLocaleString();
}

export function formatPublishedAt(date: Date) {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

export function timezoneLabel() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function sumMetrics(posts: PerformancePost[]): MetricTotals {
  const totals = emptyMetrics();
  for (const metric of POST_METRICS) {
    const values = posts.map((post) => post.metrics[metric.key]).filter((value): value is number => value != null);
    if (values.length === 0) {
      totals[metric.key] = null;
      continue;
    }
    if (metric.kind === "rate") {
      totals[metric.key] = Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
    } else {
      totals[metric.key] = values.reduce((sum, value) => sum + value, 0);
    }
  }
  return totals;
}

function changeVs(current: MetricTotals, previous: MetricTotals): MetricChanges {
  const next = emptyMetrics();
  for (const metric of POST_METRICS) {
    const now = current[metric.key];
    const before = previous[metric.key];
    if (now == null || before == null || before === 0) {
      next[metric.key] = now == null ? null : 0;
      continue;
    }
    next[metric.key] = Math.round(((now - before) / Math.abs(before)) * 1000) / 10;
  }
  return next;
}

function seedPosts(
  accounts: SocialAccount[],
  projects: Project[],
  period: { from: Date; to: Date; days: number },
  previous: boolean,
  allowDemo: boolean,
): PerformancePost[] {
  const sources =
    accounts.length > 0
      ? accounts
      : allowDemo
        ? projects.map((project) => ({
            id: `${project.id}-demo`,
            projectId: project.id,
            organizationId: "",
            platform: "instagram" as SocialPlatform,
            accountName: project.name,
            status: "connected" as const,
            handle: `@${project.name.replace(/\s+/g, "").slice(0, 16).toLowerCase()}`,
          }))
        : [];

  const posts: PerformancePost[] = [];
  sources.forEach((account, accountIndex) => {
    const count = 2 + (hash(account.id) % 3);
    for (let index = 0; index < count; index += 1) {
      const seed = hash(`${account.id}:${index}:${previous ? "prev" : "now"}`);
      const contentType = contentTypeFor(account.platform, seed);
      const day = 1 + (seed % Math.max(1, period.days));
      const hour = 8 + (seed % 12);
      const minute = (seed >> 3) % 60;
      const publishedAt = new Date(period.from);
      publishedAt.setDate(day);
      publishedAt.setHours(hour, minute, 0, 0);
      posts.push({
        id: `${account.id}-${previous ? "p" : "c"}-${index}`,
        accountId: account.id,
        projectId: account.projectId,
        platform: account.platform,
        platformLabel: networkLabel(account.platform),
        handle: account.handle ?? `@${account.accountName.replace(/\s+/g, "")}`,
        caption: pick(seed, CAPTIONS),
        thumbnail: pick(seed + accountIndex, THUMB_TONES),
        postType: postTypeFor(contentType, seed >> 2),
        contentType,
        tags: [pick(seed >> 4, POST_TAGS), pick(seed >> 6, POST_TAGS)].filter(
          (tag, tagIndex, list) => list.indexOf(tag) === tagIndex,
        ),
        author: pick(seed >> 5, POST_AUTHORS),
        status: "Published",
        publishedAt,
        metrics: metricsFor(seed, contentType),
      });
    }
  });

  return posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function applyPostFilters(posts: PerformancePost[], filters: PostPerformanceFilters) {
  const query = filters.query.trim().toLowerCase();
  return posts.filter((post) => {
    if (query && !`${post.caption} ${post.handle} ${post.platformLabel}`.toLowerCase().includes(query)) {
      return false;
    }
    if (filters.postTypes.length && !filters.postTypes.includes(post.postType)) return false;
    if (filters.contentTypes.length && !filters.contentTypes.includes(post.contentType)) return false;
    if (filters.tags.length && !post.tags.some((tag) => filters.tags.includes(tag))) return false;
    if (filters.statuses.length && !filters.statuses.includes(post.status)) return false;
    if (filters.authors.length && !filters.authors.includes(post.author)) return false;
    return true;
  });
}

export function viewingLabel(selected: string[], allLabel = "Viewing all") {
  if (selected.length === 0) return allLabel;
  if (selected.length === 1) return selected[0];
  return `${selected.length} selected`;
}

export function buildPostPerformance(
  projects: Project[],
  accounts: SocialAccount[],
  source: SourceFilter,
  filters: Omit<PostPerformanceFilters, "source">,
) {
  const visibleAccounts = filterAccounts(accounts, source).filter((account) =>
    REPORT_NETWORKS.includes(account.platform),
  );
  const period = currentPeriod();
  const allowDemo = accounts.length === 0;
  const currentPosts = seedPosts(visibleAccounts, projects, period, false, allowDemo);
  const previousPosts = seedPosts(
    visibleAccounts,
    projects,
    { from: period.prevFrom, to: period.prevTo, days: period.prevTo.getDate() },
    true,
    allowDemo,
  );

  const filtered = applyPostFilters(currentPosts, { ...filters, source });
  const currentTotals = sumMetrics(filtered);
  const previousTotals = sumMetrics(previousPosts);

  return {
    period,
    timezone: timezoneLabel(),
    posts: filtered,
    allPosts: currentPosts,
    previousCount: previousPosts.length,
    currentTotals,
    previousTotals,
    changes: changeVs(currentTotals, previousTotals),
    authors: POST_AUTHORS.slice(),
  };
}
