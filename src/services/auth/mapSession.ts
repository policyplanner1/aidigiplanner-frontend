import { getPermissionsForRole } from "../../permissions/roles";
import type { ApiMeResponse, ApiProjectAccess, ApiProjectPublic } from "../../types/api";
import type { AuthSession, RoleName, UserStatus } from "../../types/auth";
import type { Organization, Project } from "../../types/organization";

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items as T[];
    if (Array.isArray(record.data)) return record.data as T[];
    if (Array.isArray(record.results)) return record.results as T[];
    if (Array.isArray(record.products)) return record.products as T[];
    if (Array.isArray(record.projects)) return record.projects as T[];
  }
  return [];
}

function unwrapMePayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const record = raw as Record<string, unknown>;
  if (record.user && typeof record.user === "object") return record;
  if (record.data && typeof record.data === "object") return unwrapMePayload(record.data);
  return record;
}

function normalizeAccess(item: Record<string, unknown>): ApiProjectAccess {
  return {
    project_id: String(item.project_id ?? item.product_id ?? item.id ?? ""),
    project_name: String(item.project_name ?? item.product_name ?? item.name ?? "Product"),
    company_id: String(item.company_id ?? ""),
    role: String(item.role ?? "editor"),
  };
}

export function normalizeMe(raw: unknown): ApiMeResponse {
  const root = unwrapMePayload(raw);
  const user = (root.user ?? {}) as ApiMeResponse["user"];
  const companies = asList<ApiMeResponse["companies"][number]>(root.companies);
  const access = asList<Record<string, unknown>>(root.products ?? root.projects)
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map(normalizeAccess);
  return {
    user,
    companies,
    projects: access,
  };
}

function mapUserStatus(status: string | undefined): UserStatus {
  if (status === "suspended") return "suspended";
  if (status === "invited" || status === "pending") return "invited";
  return "active";
}

function mapRole(me: ApiMeResponse): RoleName {
  if (me.user?.is_super_admin) return "SUPER_ADMIN";

  const company = me.companies[0];
  if (company?.role === "company_admin") return "COMPANY_ADMIN";

  // Real product-invite roles (app.models.enums.ProductInviteRole on the backend:
  // creator/approver/publisher/analyst/product_manager) map 1:1 onto the spec's
  // role names. "project_admin" is a legacy alias for product_manager.
  const projectRoles = me.projects.map((item) => item.role);
  if (projectRoles.includes("product_manager") || projectRoles.includes("project_admin")) return "PRODUCT_MANAGER";
  if (projectRoles.includes("approver")) return "APPROVER";
  if (projectRoles.includes("publisher")) return "PUBLISHER";
  if (projectRoles.includes("analyst")) return "ANALYST";
  if (projectRoles.includes("creator") || projectRoles.includes("editor")) return "CONTENT_CREATOR";
  return "CONTENT_CREATOR";
}

export function mapMeToSession(raw: unknown): AuthSession {
  const me = normalizeMe(raw);
  const company = me.companies[0];
  const role = mapRole(me);

  return {
    source: "api",
    user: {
      id: me.user?.id ?? "",
      name: me.user?.full_name ?? "",
      email: me.user?.email ?? "",
      role,
      organizationId: company?.company_id ?? null,
      status: mapUserStatus(me.user?.status),
    },
    organizationId: company?.company_id ?? null,
    organizationName: company?.company_name,
    organizationSlug: company?.company_slug,
    companyStatus: company?.status,
    emailVerified: Boolean(me.user?.email_verified_at),
    assignedBrandIds: me.projects.map((item) => item.project_id).filter(Boolean),
    permissions: getPermissionsForRole(role),
  };
}

export function mapOrganizationFromSession(session: AuthSession): Organization | null {
  if (!session.organizationId) return null;

  return {
    id: session.organizationId,
    name: session.organizationName ?? "Company",
    slug: session.organizationSlug ?? session.organizationId,
    plan: "Starter",
    status: session.companyStatus === "active" ? "active" : "suspended",
  };
}

export function mapApiProjects(
  companyId: string,
  projects: ApiProjectPublic[] | null | undefined,
): Project[] {
  return asList<ApiProjectPublic>(projects).map((project) => ({
    id: project.id,
    organizationId: companyId,
    name: project.name,
    description: project.description ?? "",
    industry: "General",
    status: project.status === "archived" ? "inactive" : "active",
    modules: {
      social: true,
      marketing: true,
      leads: true,
      crm: true,
    },
  }));
}

export function mapAccessProjects(raw: unknown): Project[] {
  const me = normalizeMe(raw);
  return me.projects
    .filter((project) => project.project_id)
    .map((project) => ({
      id: project.project_id,
      organizationId: project.company_id,
      name: project.project_name,
      description: "",
      industry: "General",
      status: "active" as const,
      modules: {
        social: true,
        marketing: true,
        leads: true,
        crm: true,
      },
    }));
}

// Per spec §7/§19-27: Company Admins are the only role that goes through
// onboarding (invited members never do — §27). Once onboarding is complete,
// OnboardingGuard bounces a Company Admin straight to their role destination
// below instead of /app/dashboard, so this stays in sync with that redirect.
export function roleHomePath(session: AuthSession): string {
  switch (session.user.role) {
    case "APPROVER":
      return "/app/approvals";
    case "PUBLISHER":
      return "/app/calendar";
    case "PRODUCT_MANAGER":
    case "CONTENT_CREATOR":
    case "ANALYST":
    default:
      return "/app/dashboard";
  }
}

export function postAuthPath(session: AuthSession): string {
  if (session.user.role === "SUPER_ADMIN") return "/super-admin";
  if (session.companyStatus && session.companyStatus !== "active") {
    return "/pending";
  }
  if (session.user.role !== "COMPANY_ADMIN") {
    return roleHomePath(session);
  }
  return "/onboarding";
}
