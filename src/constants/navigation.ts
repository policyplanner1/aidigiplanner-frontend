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
  | "brandProfile"
  | "crossNetwork"
  | "templates"
  | "reports";

export type NavItem = {
  type: "item";
  label: string;
  path: string;
  icon: NavIconName;
  // A list means "visible if the user holds any one of these" — e.g. Calendar
  // is useful to whoever can edit, approve, or publish content, not just editors.
  permission?: string | string[];
};

export type NavGroup = {
  type: "group";
  label: string;
  icon: NavIconName;
  permission?: string | string[];
  children: NavItem[];
};

export type NavSection = {
  type: "section";
  label: string;
};

export type NavEntry = NavItem | NavGroup | NavSection;

// Company Admin sidebar, following spec §20's order: Dashboard, Create with AI,
// Content, Calendar, Campaigns, Approvals, Products, Social Accounts, Analytics,
// Brand Library, Team, Settings, Billing. Content/Campaigns/Analytics/Brand
// Library nav entries stay disabled until their pages land (Phase 2/3 of the
// spec rebuild) — see the commented entries below.
export const organizationNav: NavEntry[] = [
  {
    type: "item",
    label: "Dashboard",
    path: "/app/dashboard",
    icon: "dashboard",
  },
  {
    type: "item",
    label: "Create with AI",
    path: "/app/create",
    icon: "content",
    permission: PERMISSIONS.CONTENT_CREATE,
  },
  {
    type: "item",
    label: "Content",
    path: "/app/content",
    icon: "content",
    permission: [PERMISSIONS.CONTENT_EDIT, PERMISSIONS.CONTENT_APPROVE, PERMISSIONS.CONTENT_PUBLISH],
  },
  {
    type: "item",
    label: "Calendar",
    path: "/app/calendar",
    icon: "calendar",
    permission: [PERMISSIONS.CONTENT_EDIT, PERMISSIONS.CONTENT_APPROVE, PERMISSIONS.CONTENT_PUBLISH],
  },
  {
    type: "item",
    label: "Campaigns",
    path: "/app/campaigns",
    icon: "campaigns",
    permission: PERMISSIONS.CAMPAIGN_MANAGE,
  },
  {
    type: "item",
    label: "Approvals",
    path: "/app/approvals",
    icon: "approvals",
    permission: PERMISSIONS.CONTENT_APPROVE,
  },
  {
    type: "item",
    label: "Products",
    path: "/app/products",
    icon: "brands",
    permission: PERMISSIONS.PRODUCT_VIEW,
  },
  {
    type: "item",
    label: "Brand Profile",
    path: "/app/brand-profile",
    icon: "brandProfile",
    permission: PERMISSIONS.PRODUCT_VIEW,
  },
  {
    type: "item",
    label: "Social Accounts",
    path: "/app/social-accounts",
    icon: "accounts",
    permission: PERMISSIONS.SOCIAL_MANAGE,
  },
  {
    type: "item",
    label: "Analytics",
    path: "/app/analytics",
    icon: "analytics",
    permission: PERMISSIONS.ANALYTICS_VIEW,
  },
  {
    type: "group",
    label: "Cross Network",
    icon: "crossNetwork",
    permission: PERMISSIONS.ANALYTICS_VIEW,
    children: [
      {
        type: "item",
        label: "Profile Performance",
        path: "/app/cross-network/profile-performance",
        icon: "analytics",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
      {
        type: "item",
        label: "Post Performance",
        path: "/app/cross-network/post-performance",
        icon: "analytics",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },
  {
    type: "item",
    label: "Brand Library",
    path: "/app/brand-library",
    icon: "media",
    permission: PERMISSIONS.PRODUCT_VIEW,
  },
  // AI Agents/Leads/CRM/Inbox are not part of the spec's product surface at all — stay removed.
  {
    type: "item",
    label: "Team",
    path: "/app/team",
    icon: "team",
    permission: PERMISSIONS.TEAM_MANAGE,
  },
  {
    type: "item",
    label: "Settings",
    path: "/app/settings",
    icon: "settings",
  },
  {
    type: "item",
    label: "Billing",
    path: "/app/billing",
    icon: "billing",
    permission: PERMISSIONS.BILLING_MANAGE,
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
    path: "/super-admin/companies",
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
  { type: "section", label: "AI & Usage" },
  {
    type: "item",
    label: "AI Providers",
    path: "/super-admin/ai-providers",
    icon: "aiUsage",
  },
  {
    type: "item",
    label: "Usage",
    path: "/super-admin/usage",
    icon: "apiUsage",
  },
  { type: "section", label: "Platform" },
  {
    type: "item",
    label: "Social Integrations",
    path: "/super-admin/social-integrations",
    icon: "integrations",
  },
  {
    type: "item",
    label: "Templates",
    path: "/super-admin/templates",
    icon: "templates",
  },
  {
    type: "item",
    label: "Reports",
    path: "/super-admin/reports",
    icon: "reports",
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
