import { SOCIAL_PLATFORMS } from "../../constants/platforms";
import type { Project, SocialAccount, SocialPlatform } from "../../types/organization";

export const REPORT_NETWORKS: SocialPlatform[] = [
  "instagram",
  "facebook",
  "linkedin",
  "youtube",
  "x",
  "threads",
  "tiktok",
];

export const NETWORK_COLORS: Record<SocialPlatform, string> = {
  instagram: "#E2507A",
  facebook: "#7C5CFC",
  youtube: "#E25030",
  linkedin: "#E8A838",
  google_business: "#2A9D6A",
  whatsapp: "#176E66",
  tiktok: "#5B6CFF",
  x: "#1F8A80",
  threads: "#C9A227",
};

export const NETWORK_CHART_STYLE: Record<SocialPlatform, "area" | "line"> = {
  instagram: "area",
  facebook: "area",
  youtube: "line",
  linkedin: "line",
  google_business: "line",
  whatsapp: "line",
  tiktok: "area",
  x: "line",
  threads: "area",
};

export type SourceFilter =
  | { kind: "all" }
  | { kind: "project"; projectId: string }
  | { kind: "account"; accountId: string };

export type MetricRow = {
  id: string;
  label: string;
  total: number;
  change: number;
};

export type DayPoint = {
  day: number;
  label: string;
  sent: number;
  received: number;
  [key: string]: number | string;
};

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

export function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

export function formatChange(value: number) {
  const abs = Math.abs(value).toFixed(1).replace(/\.0$/, "");
  if (value > 0) return `${abs}%`;
  if (value < 0) return `${abs}%`;
  return "0%";
}

export function periodLabel(from: Date, to: Date) {
  const fmt = (date: Date) =>
    date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(from)} – ${fmt(to)}`;
}

export function comparisonLabel(from: Date, to: Date, prevFrom: Date, prevTo: Date) {
  const short = (date: Date) =>
    `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  return `${short(from)} – ${short(to)} vs ${short(prevFrom)} – ${short(prevTo)}`;
}

export function currentPeriod() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = now;
  const prevTo = new Date(from);
  prevTo.setDate(0);
  const prevFrom = new Date(prevTo.getFullYear(), prevTo.getMonth(), 1);
  return { from, to, prevFrom, prevTo, days: to.getDate() };
}

export function networkLabel(platform: SocialPlatform) {
  return SOCIAL_PLATFORMS.find((item) => item.id === platform)?.label ?? platform;
}

export function filterAccounts(accounts: SocialAccount[], source: SourceFilter) {
  if (source.kind === "all") return accounts;
  if (source.kind === "project") return accounts.filter((item) => item.projectId === source.projectId);
  return accounts.filter((item) => item.id === source.accountId);
}

export function buildProfilePerformance(
  projects: Project[],
  accounts: SocialAccount[],
  source: SourceFilter,
  platforms: SocialPlatform[],
) {
  const visibleAccounts = filterAccounts(accounts, source);
  const selected = (platforms.length ? platforms : REPORT_NETWORKS).filter((item) =>
    REPORT_NETWORKS.includes(item),
  );
  const period = currentPeriod();
  const seedBase = `${source.kind}:${"projectId" in source ? source.projectId : "accountId" in source ? source.accountId : "all"}:${selected.join("|")}:${visibleAccounts.map((item) => item.id).join("|")}`;

  const networkMetrics = selected.map((platform) => {
    const seed = hash(`${seedBase}:${platform}`);
    const sent = range(seed, 8, 92);
    const received = range(seed >> 3, 4, 86);
    const impressions = range(seed >> 5, 180, 4200);
    const videoViews = range(seed >> 6, 4, 140);
    const engagements = range(seed >> 7, 12, 96);
    const clicks = range(seed >> 9, 6, 48);
    const rate = range(seed >> 8, 18, 86) / 10;
    const followers = range(seed >> 2, -18, 420);
    return {
      platform,
      label: networkLabel(platform),
      color: NETWORK_COLORS[platform],
      chart: NETWORK_CHART_STYLE[platform],
      sent,
      sentChange: range(seed >> 4, -56, 28) / 10,
      received,
      receivedChange: range(seed >> 6, -22, 18) / 10,
      impressions,
      impressionsChange: range(seed >> 8, -34, 16) / 10,
      videoViews,
      videoChange: range(seed >> 5, -48, 22) / 10,
      engagements,
      engagementsChange: range(seed >> 3, -28, 24) / 10,
      rate,
      rateChange: range(seed >> 9, -22, 18) / 10,
      clicks,
      followers,
      followersChange: range(seed >> 1, -62, 24) / 10,
    };
  });

  const sum = (key: "sent" | "received" | "impressions" | "videoViews" | "engagements" | "clicks" | "followers") =>
    networkMetrics.reduce((total, item) => total + item[key], 0);

  const daily: DayPoint[] = Array.from({ length: period.days }, (_, index) => {
    const day = index + 1;
    const point: DayPoint = { day, label: String(day), sent: 0, received: 0 };
    for (const network of networkMetrics) {
      const seed = hash(`${seedBase}:${network.platform}:${day}`);
      const sent = range(seed, 0, Math.max(2, Math.round(network.sent / 6)));
      const received = range(seed >> 2, 0, Math.max(3, Math.round(network.received / 5)));
      point.sent += sent;
      point.received += received;
      point[network.platform] = range(seed >> 3, 0, Math.max(8, Math.round(network.impressions / 10)));
      point[`${network.platform}Video`] = range(seed >> 4, 0, Math.max(4, Math.round(network.videoViews / 4)));
      point[`${network.platform}Engage`] = range(seed >> 5, 0, Math.max(3, Math.round(network.engagements / 5)));
      point[`${network.platform}Rate`] = range(seed >> 6, 4, 48) / 10;
      point[`${network.platform}Audience`] = range(seed >> 7, -8, 42);
    }
    return point;
  });

  const scopedProfiles = visibleAccounts.filter((account) => selected.includes(account.platform));
  const profiles = (scopedProfiles.length ? scopedProfiles : visibleAccounts).map((account) => {
    const seed = hash(`${seedBase}:profile:${account.id}`);
    const project = projects.find((item) => item.id === account.projectId);
    return {
      id: account.id,
      name: account.accountName,
      handle: account.handle ?? account.accountName,
      platform: account.platform,
      platformLabel: networkLabel(account.platform),
      projectName: project?.name ?? "Workspace",
      impressions: range(seed, 180, 2800),
      engagements: range(seed >> 2, 12, 420),
      sent: range(seed >> 3, 2, 48),
      received: range(seed >> 4, 1, 36),
      followers: range(seed >> 1, -12, 260),
    };
  });

  const impressionTotal = sum("impressions");
  const engagementTotal = sum("engagements");

  return {
    period,
    networks: networkMetrics,
    daily,
    summary: {
      impressions: impressionTotal,
      impressionsChange: average(networkMetrics.map((item) => item.impressionsChange)),
      engagements: engagementTotal,
      engagementsChange: average(networkMetrics.map((item) => item.engagementsChange)),
      clicks: sum("clicks"),
      clicksChange: average(networkMetrics.map((item) => item.rateChange)),
      rate: impressionTotal ? Math.round((engagementTotal / impressionTotal) * 1000) / 10 : 0,
      rateChange: average(networkMetrics.map((item) => item.rateChange)),
    },
    sent: pack("sent messages", networkMetrics, "sent", "sentChange"),
    received: pack("received messages", networkMetrics, "received", "receivedChange"),
    impressions: pack("impressions", networkMetrics, "impressions", "impressionsChange"),
    video: pack("video views", networkMetrics, "videoViews", "videoChange"),
    engagements: pack("engagements", networkMetrics, "engagements", "engagementsChange"),
    rate: {
      total: average(networkMetrics.map((item) => item.rate)),
      change: average(networkMetrics.map((item) => item.rateChange)),
      rows: networkMetrics.map((item) => ({
        id: item.platform,
        label: `${item.label} engagement rate`,
        total: item.rate,
        change: item.rateChange,
      })),
    },
    audience: pack("net follower growth", networkMetrics, "followers", "followersChange"),
    profiles,
  };
}

function pack(
  suffix: string,
  networks: { platform: SocialPlatform; label: string; [key: string]: unknown }[],
  totalKey: string,
  changeKey: string,
) {
  const rows = networks.map((item) => ({
    id: item.platform,
    label: `${item.label} ${suffix}`,
    total: Number(item[totalKey] ?? 0),
    change: Number(item[changeKey] ?? 0),
  }));
  return {
    total: rows.reduce((sum, row) => sum + row.total, 0),
    change: average(rows.map((row) => row.change)),
    rows,
  };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
