import type { RoleName } from "../types/auth";
import { PERMISSIONS } from "./permissions";

const ALL_ORGANIZATION_PERMISSIONS = Object.values(PERMISSIONS).filter(
  (permission) => !permission.startsWith("platform."),
);

const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ALL_ORGANIZATION_PERMISSIONS,
  SOCIAL_MANAGER: [
    PERMISSIONS.BRANDS_VIEW,
    PERMISSIONS.SOCIAL_VIEW,
    PERMISSIONS.SOCIAL_CONNECT,
    PERMISSIONS.SOCIAL_PUBLISH,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.AGENTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  CONTENT_MANAGER: [
    PERMISSIONS.BRANDS_VIEW,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_APPROVE,
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.SOCIAL_VIEW,
    PERMISSIONS.AGENTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  SALES_MANAGER: [
    PERMISSIONS.BRANDS_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_MANAGE,
    PERMISSIONS.CRM_VIEW,
    PERMISSIONS.CRM_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  ANALYST: [
    PERMISSIONS.BRANDS_VIEW,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  USER: [
    PERMISSIONS.BRANDS_VIEW,
    PERMISSIONS.SOCIAL_VIEW,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
};

export function getPermissionsForRole(role: RoleName): string[] {
  return ROLE_PERMISSIONS[role];
}

const PRODUCT_MANAGER_PERMISSIONS = ALL_ORGANIZATION_PERMISSIONS.filter(
  (permission) =>
    permission !== PERMISSIONS.USERS_VIEW &&
    permission !== PERMISSIONS.USERS_MANAGE &&
    permission !== PERMISSIONS.BILLING_VIEW &&
    permission !== PERMISSIONS.CROSS_NETWORK_VIEW,
);

function permissionMatchesModule(
  permission: string,
  access: {
    social: boolean;
    marketing: boolean;
    leads: boolean;
    crm: boolean;
  },
): boolean {
  if (
    permission.startsWith("social.") ||
    permission.startsWith("campaign.") ||
    permission.startsWith("analytics.")
  ) {
    return access.social;
  }
  if (permission.startsWith("content.") || permission.startsWith("agents.")) {
    return access.marketing;
  }
  if (permission.startsWith("leads.")) {
    return access.leads;
  }
  if (permission.startsWith("crm.")) {
    return access.crm;
  }
  return true;
}

export function getPermissionsForProductAccess(
  role: RoleName,
  access:
    | {
        manageAll: boolean;
        social: boolean;
        marketing: boolean;
        leads: boolean;
        crm: boolean;
      }
    | undefined,
): string[] {
  if (role === "SUPER_ADMIN") return ["*"];
  if (role === "ADMIN") return ROLE_PERMISSIONS.ADMIN;
  if (!access) return [PERMISSIONS.BRANDS_VIEW, PERMISSIONS.SETTINGS_VIEW];

  if (access.manageAll) {
    return PRODUCT_MANAGER_PERMISSIONS;
  }

  return getPermissionsForRole(role).filter((permission) =>
    permissionMatchesModule(permission, access),
  );
}

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Organization Admin",
  SOCIAL_MANAGER: "Social Media Manager",
  CONTENT_MANAGER: "Content Manager",
  SALES_MANAGER: "Sales Manager",
  ANALYST: "Analyst",
  USER: "User",
};

export function accountDisplayName(user: {
  name: string;
  email?: string;
  role: RoleName;
}) {
  const role = ROLE_LABELS[user.role];
  const name = user.name?.trim() ?? "";
  if (name && name !== role) return name;
  return user.email?.trim() || name || role;
}
