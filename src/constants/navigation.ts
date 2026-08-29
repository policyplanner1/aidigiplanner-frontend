import { PERMISSIONS } from "../permissions/permissions";

export type NavIconName =
  | "dashboard"
  | "organizations"
  | "users"
  | "subscriptions"
  | "plans"
  | "billing"
  | "aiUsage"
  | "apiUsage"
  | "integrations"
  | "settings"
  | "audit"
  | "brands"
  | "products"
  | "accounts"
  | "content"
  | "calendar"
  | "inbox"
  | "approvals"
  | "media"
  | "campaigns"
  | "analytics"
  | "agents"
  | "agentRuns"
  | "discover"
  | "leads"
  | "crm"
  | "team"
  | "brandKit"
  | "crossNetwork";

export type NavItem = {
  type: "item";
  label: string;
  path: string;
  icon: NavIconName;
  permission?: string;
};

export type NavGroup = {
  type: "group";
  label: string;
  icon: NavIconName;
  permission?: string;
  children: NavItem[];
};

export type NavSection = {
  type: "section";
  label: string;
};

export type NavEntry = NavItem | NavGroup | NavSection;

export const organizationNav: NavEntry[] = [
  {
    type: "item",
    label: "Dashboard",
    path: "/app/dashboard",
    icon: "dashboard",
  },
  {
    type: "item",
    label: "Products",
    path: "/app/projects",
    icon: "brands",
    permission: PERMISSIONS.BRANDS_VIEW,
  },
  {
    type: "item",
    label: "Brand Kit",
    path: "/app/brand-kit",
    icon: "brandKit",
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  { type: "section", label: "Social Media" },
  {
    type: "item",
    label: "Accounts",
    path: "/app/social/accounts",
    icon: "accounts",
    permission: PERMISSIONS.SOCIAL_VIEW,
  },
  {
    type: "item",
    label: "Content Studio",
    path: "/app/social/content",
    icon: "content",
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    type: "item",
    label: "Calendar",
    path: "/app/social/calendar",
    icon: "calendar",
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    type: "item",
    label: "Inbox",
    path: "/app/social/inbox",
    icon: "inbox",
    permission: PERMISSIONS.SOCIAL_VIEW,
  },
  {
    type: "item",
    label: "Approvals",
    path: "/app/social/approvals",
    icon: "approvals",
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  {
    type: "item",
    label: "Campaigns",
    path: "/app/social/campaigns",
    icon: "campaigns",
    permission: PERMISSIONS.CAMPAIGN_VIEW,
  },
  {
    type: "item",
    label: "Analytics",
    path: "/app/social/analytics",
    icon: "analytics",
    permission: PERMISSIONS.ANALYTICS_VIEW,
  },
  {
    type: "group",
    label: "Cross Network",
    icon: "crossNetwork",
    permission: PERMISSIONS.CROSS_NETWORK_VIEW,
    children: [
      {
        type: "item",
        label: "Profile Performance",
        path: "/app/cross-network/profile-performance",
        icon: "analytics",
        permission: PERMISSIONS.CROSS_NETWORK_VIEW,
      },
      {
        type: "item",
        label: "Post Performance",
        path: "/app/cross-network/post-performance",
        icon: "analytics",
        permission: PERMISSIONS.CROSS_NETWORK_VIEW,
      },
    ],
  },
  {
    type: "item",
    label: "Media",
    path: "/app/social/media",
    icon: "media",
    permission: PERMISSIONS.CONTENT_VIEW,
  },
  { type: "section", label: "AI Agents" },
  {
    type: "item",
    label: "Agents",
    path: "/app/ai-agents",
    icon: "agents",
    permission: PERMISSIONS.AGENTS_VIEW,
  },
  {
    type: "item",
    label: "Agent Runs",
    path: "/app/ai-agents/runs",
    icon: "agentRuns",
    permission: PERMISSIONS.AGENTS_VIEW,
  },
  { type: "section", label: "Leads" },
  {
    type: "item",
    label: "Discover",
    path: "/app/leads/discover",
    icon: "discover",
    permission: PERMISSIONS.LEADS_VIEW,
  },
  {
    type: "item",
    label: "Leads",
    path: "/app/leads",
    icon: "leads",
    permission: PERMISSIONS.LEADS_VIEW,
  },
  {
    type: "item",
    label: "Campaigns",
    path: "/app/leads/campaigns",
    icon: "campaigns",
    permission: PERMISSIONS.LEADS_VIEW,
  },
  { type: "section", label: "CRM" },
  {
    type: "item",
    label: "CRM",
    path: "/app/crm",
    icon: "crm",
    permission: PERMISSIONS.CRM_VIEW,
  },
  {
    type: "item",
    label: "Team",
    path: "/app/team",
    icon: "team",
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    type: "item",
    label: "Integrations",
    path: "/app/integrations",
    icon: "integrations",
    permission: PERMISSIONS.INTEGRATIONS_VIEW,
  },
  {
    type: "item",
    label: "Billing",
    path: "/app/billing",
    icon: "billing",
    permission: PERMISSIONS.BILLING_VIEW,
  },
  {
    type: "item",
    label: "Settings",
    path: "/app/settings",
    icon: "settings",
  },
];

export const superAdminNav: NavEntry[] = [
  {
    type: "item",
    label: "Dashboard",
    path: "/super-admin",
    icon: "dashboard",
  },
  {
    type: "item",
    label: "Requests",
    path: "/super-admin/organizations",
    icon: "organizations",
  },
  {
    type: "item",
    label: "Organization",
    path: "/super-admin/users",
    icon: "users",
  },
  { type: "section", label: "Billing" },
  {
    type: "item",
    label: "Subscriptions",
    path: "/super-admin/subscriptions",
    icon: "subscriptions",
  },
  {
    type: "item",
    label: "Plans",
    path: "/super-admin/plans",
    icon: "plans",
  },
  {
    type: "item",
    label: "Billing",
    path: "/super-admin/billing",
    icon: "billing",
  },
  { type: "section", label: "Usage" },
  {
    type: "item",
    label: "AI Usage",
    path: "/super-admin/ai-usage",
    icon: "aiUsage",
  },
  {
    type: "item",
    label: "API Usage",
    path: "/super-admin/api-usage",
    icon: "apiUsage",
  },
  { type: "section", label: "Platform" },
  {
    type: "item",
    label: "Integrations",
    path: "/super-admin/integrations",
    icon: "integrations",
  },
  {
    type: "item",
    label: "System Settings",
    path: "/super-admin/settings",
    icon: "settings",
  },
  {
    type: "item",
    label: "Audit Logs",
    path: "/super-admin/audit-logs",
    icon: "audit",
  },
];
