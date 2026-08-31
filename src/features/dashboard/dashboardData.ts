// Leads/CRM/Campaigns/Media are not backed by aidigiplanner-backend yet, so their static
// mock data sources are disabled here too (see constants/navigation.ts, app/routes.tsx).
// import { getDeals, getLeads } from "../../services/growth/mockGrowthData";
import { PERMISSIONS } from "../../permissions/permissions";
import { getSocialAccounts } from "../../services/projects/projectService";
import {
  getAnalytics,
  getInboxItems,
  // getMediaAssets,
  // getSocialCampaigns,
  getSocialPosts,
} from "../../services/social/publishingService";
import type { Project } from "../../types/organization";

export type AttentionItem = {
  id: string;
  label: string;
  detail: string;
  path: string;
  tone: "warn" | "info" | "ok";
};

export type SnapshotItem = {
  id: string;
  label: string;
  value: string;
  hint: string;
  path: string;
  permission: string;
  accent: string;
};

export function getDashboardSnapshot(projects: Project[], currentProjectId: string | null) {
  const posts = projects.flatMap((project) => getSocialPosts(project.id));
  const inbox = projects.flatMap((project) => getInboxItems(project.id));
  // const campaigns = projects.flatMap((project) => getSocialCampaigns(project.id));
  // const media = projects.flatMap((project) => getMediaAssets(project.id));
  // const leads = projects.flatMap((project) => getLeads(project.id));
  // const deals = projects.flatMap((project) => getDeals(project.id));
  const accounts = projects.flatMap((project) => getSocialAccounts(project.id));

  const connected = accounts.filter((item) => item.status === "connected").length;
  const scheduled = posts.filter((item) => item.status === "scheduled").length;
  const inReview = posts.filter((item) => item.status === "in_review").length;
  const published = posts.filter((item) => item.status === "published").length;
  const openInbox = inbox.filter((item) => item.status === "open").length;
  // const activeCampaigns = campaigns.filter((item) => item.status === "active").length;
  // const hotLeads = leads.filter(
  //   (item) => item.status === "new" || item.status === "qualified",
  // ).length;
  // const openDeals = deals.filter((item) => item.stage !== "won").length;
  const analytics = getAnalytics(currentProjectId ?? projects[0]?.id ?? "none");
  const weekOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekPosts = [...posts]
    .sort(
      (a, b) =>
        weekOrder.indexOf(a.day) - weekOrder.indexOf(b.day) || a.time.localeCompare(b.time),
    )
    .slice(0, 5);

  const attention: AttentionItem[] = [
    // No inbox module in aidigiplanner-backend yet — see constants/navigation.ts.
    // ...inbox
    //   .filter((item) => item.status === "open")
    //   .slice(0, 3)
    //   .map((item) => ({
    //     id: item.id,
    //     label: `${item.platform} ${item.type}`,
    //     detail: `${item.author}: ${item.text}`,
    //     path: "/app/social/inbox",
    //     tone: "warn" as const,
    //   })),
    ...posts
      .filter((item) => item.status === "in_review")
      .slice(0, 2)
      .map((item) => ({
        id: item.id,
        label: "Waiting approval",
        detail: item.title,
        path: "/app/approvals",
        tone: "info" as const,
      })),
  ].slice(0, 5);

  const snapshots: SnapshotItem[] = [
    {
      id: "brand",
      label: "Brand Profile",
      value: "Ready",
      hint: "Voice, colors, and rules",
      path: "/app/brand-profile",
      permission: PERMISSIONS.PRODUCT_VIEW,
      accent: "#7C3AED",
    },
    {
      id: "studio",
      label: "Create with AI",
      value: String(posts.length),
      hint: "Posts, reels, shorts, blogs",
      path: "/app/create",
      permission: PERMISSIONS.CONTENT_CREATE,
      accent: "#FF6B45",
    },
    {
      id: "calendar",
      label: "Calendar",
      value: String(scheduled),
      hint: "Scheduled this week",
      path: "/app/calendar",
      permission: PERMISSIONS.CONTENT_EDIT,
      accent: "#2563EB",
    },
    // No inbox, campaigns, analytics, media, AI agents, leads, or CRM module in
    // aidigiplanner-backend yet — tiles disabled so the dashboard matches the backend journey.
    // {
    //   id: "inbox",
    //   label: "Inbox",
    //   value: String(openInbox),
    //   hint: "Open comments and DMs",
    //   path: "/app/social/inbox",
    //   permission: "social.view",
    //   accent: "#0F766E",
    // },
    {
      id: "approvals",
      label: "Approvals",
      value: String(inReview),
      hint: "Drafts waiting review",
      path: "/app/approvals",
      permission: PERMISSIONS.CONTENT_APPROVE,
      accent: "#C2410C",
    },
    // {
    //   id: "campaigns",
    //   label: "Campaigns",
    //   value: String(activeCampaigns),
    //   hint: "Active social campaigns",
    //   path: "/app/social/campaigns",
    //   permission: "campaign.view",
    //   accent: "#DB2777",
    // },
    // {
    //   id: "analytics",
    //   label: "Analytics",
    //   value: analytics.impressions,
    //   hint: `${analytics.engagement} engagement`,
    //   path: "/app/social/analytics",
    //   permission: "analytics.view",
    //   accent: "#1D4ED8",
    // },
    // {
    //   id: "media",
    //   label: "Media",
    //   value: String(media.length),
    //   hint: "Images, video, outlines",
    //   path: "/app/social/media",
    //   permission: "content.view",
    //   accent: "#0E7490",
    // },
    // {
    //   id: "agents",
    //   label: "AI Agents",
    //   value: "3 live",
    //   hint: "1 queued for leads",
    //   path: "/app/ai-agents",
    //   permission: "agents.view",
    //   accent: "#7C3AED",
    // },
    // {
    //   id: "leads",
    //   label: "Leads",
    //   value: String(hotLeads),
    //   hint: `${leads.length} in the inbox`,
    //   path: "/app/leads",
    //   permission: "leads.view",
    //   accent: "#15803D",
    // },
    // {
    //   id: "crm",
    //   label: "CRM",
    //   value: String(openDeals),
    //   hint: "Open deals in pipeline",
    //   path: "/app/crm",
    //   permission: "crm.view",
    //   accent: "#1E40AF",
    // },
    {
      id: "accounts",
      label: "Social Accounts",
      value: String(connected),
      hint: "Connected social channels",
      path: "/app/social-accounts",
      permission: PERMISSIONS.SOCIAL_MANAGE,
      accent: "#EA580C",
    },
  ];

  return {
    connected,
    scheduled,
    inReview,
    published,
    openInbox,
    // hotLeads, openDeals: no Leads/CRM module in aidigiplanner-backend yet.
    analytics,
    attention,
    snapshots,
    weekPosts,
  };
}

export function buildAiRecommendations(counts: {
  drafts: number;
  pending: number;
  published: number;
  socials: number;
}): string[] {
  const recommendations: string[] = [];
  if (counts.drafts) {
    recommendations.push(`${counts.drafts} draft${counts.drafts === 1 ? "" : "s"} waiting to be submitted.`);
  }
  if (counts.pending) {
    recommendations.push(`${counts.pending} approval${counts.pending === 1 ? "" : "s"} need your review.`);
  }
  if (counts.socials === 0) {
    recommendations.push("Connect a social account to start publishing.");
  }
  if (counts.published === 0) {
    recommendations.push("Nothing published yet -- schedule your first post.");
  }
  return recommendations;
}

export function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatDashboardDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
