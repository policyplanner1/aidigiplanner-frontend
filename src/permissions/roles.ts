import type { RoleName } from "../types/auth";
import { PERMISSIONS } from "./permissions";

const ALL_ORGANIZATION_PERMISSIONS = Object.values(PERMISSIONS);

// Per spec §19-26: a member's *permissions* drive UI, not the role name alone —
// these per-role sets are just the sensible default a role grants on invite.
const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  SUPER_ADMIN: ["*"],

  // Company Admin: full access to everything within their company.
  COMPANY_ADMIN: ALL_ORGANIZATION_PERMISSIONS,

  // Product Manager: manages assigned products end-to-end, but not company
  // ownership, billing, or products they aren't assigned to (§22).
  PRODUCT_MANAGER: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.SUBPRODUCT_MANAGE,
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_APPROVE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.SOCIAL_MANAGE,
    PERMISSIONS.CAMPAIGN_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
  ],

  // Content Creator: creates/edits their own drafts and submits for approval;
  // cannot approve, publish, or manage social connections (§23).
  CONTENT_CREATOR: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
  ],

  // Approver: reviews the approval queue only (§24). Analytics access is
  // "if permitted" per spec — granted per-invite, not part of the base role.
  APPROVER: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.CONTENT_APPROVE,
  ],

  // Publisher: publishes/schedules already-approved content and selects
  // which connected accounts to publish to (§25).
  PUBLISHER: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.SOCIAL_MANAGE,
  ],

  // Analyst: read-only (§26).
  ANALYST: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
};

export function getPermissionsForRole(role: RoleName): string[] {
  return ROLE_PERMISSIONS[role];
}

// Legacy per-product module-access shape from the mock/demo team flow
// (services/auth/mockAuth.ts, services/team/teamService.ts) — mock login is
// disabled (see hooks/useAuth.ts), so this path is unreachable today. Kept
// only so that dead code still compiles; the live team model
// (services/team/liveTeam.ts) grants COMPANY_ADMIN or the invited
// ProductInviteRole directly instead of this per-module flag set.
function permissionMatchesModule(
  permission: string,
  access: {
    social: boolean;
    marketing: boolean;
  },
): boolean {
  if (
    permission.startsWith("social.") ||
    permission.startsWith("campaign.") ||
    permission.startsWith("analytics.")
  ) {
    return access.social;
  }
  if (permission.startsWith("content.")) {
    return access.marketing;
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
  if (role === "COMPANY_ADMIN") return ROLE_PERMISSIONS.COMPANY_ADMIN;
  if (!access) return [PERMISSIONS.PRODUCT_VIEW];

  if (access.manageAll) {
    return ROLE_PERMISSIONS.PRODUCT_MANAGER;
  }

  return getPermissionsForRole(role).filter((permission) =>
    permissionMatchesModule(permission, access),
  );
}

export const ROLE_LABELS: Record<RoleName, string> = {
  SUPER_ADMIN: "Super Admin",
  COMPANY_ADMIN: "Company Admin",
  PRODUCT_MANAGER: "Product Manager",
  CONTENT_CREATOR: "Content Creator",
  APPROVER: "Approver",
  PUBLISHER: "Publisher",
  ANALYST: "Analyst",
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
