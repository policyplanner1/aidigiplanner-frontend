export type ApiCompanyStatus =
  | "pending_approval"
  | "active"
  | "rejected"
  | "suspended";

export type ApiUserPublic = {
  id: string;
  email: string;
  full_name: string;
  is_super_admin: boolean;
  status: string;
  email_verified_at: string | null;
  created_at: string;
};

export type ApiCompanyPublic = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export type ApiCompanySummary = {
  id: string;
  name: string;
  slug: string;
  status: ApiCompanyStatus;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
};

export type ApiTokenPair = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in: number;
  company_id?: string | null;
  member_id?: string | null;
};

export type ApiCompanyMembership = {
  company_id: string;
  company_name: string;
  company_slug: string;
  role: string;
  status: string;
};

export type ApiProjectAccess = {
  project_id: string;
  project_name: string;
  company_id: string;
  role: string;
};

export type ApiMeResponse = {
  user: ApiUserPublic;
  companies: ApiCompanyMembership[];
  projects: ApiProjectAccess[];
  products?: ApiProjectAccess[];
};

export type ApiRegisterResponse = {
  user: ApiUserPublic;
  company: ApiCompanyPublic;
};

export type ApiProjectPublic = {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ApiCompanyRole = "company_admin" | "member";

export type ApiCompanyMemberStatus = "active" | "suspended";

export type ApiCompanyMember = {
  id: string;
  company_id: string;
  user_id: string;
  role: ApiCompanyRole;
  status: ApiCompanyMemberStatus;
  invited_by: string | null;
  joined_at: string | null;
  created_at: string;
  user_email: string;
  user_full_name: string;
  projects?: string[] | null;
};

// The real, live product-member role (app.models.enums.ProductRole on the
// backend) — matches ProductInviteRole in types/onboarding.ts exactly.
export type ApiProductMemberRole = "creator" | "approver" | "publisher" | "analyst" | "product_manager";

export type ApiProductMember = {
  id: string;
  product_id: string;
  user_id: string;
  role: ApiProductMemberRole;
  sub_product_ids: string[];
  added_by: string;
  created_at: string;
  user_email: string;
  user_full_name: string;
};

export type ApiAuditLog = {
  id: string;
  action: string;
  actor_user_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  company_id: string | null;
  company_name: string | null;
  project_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  audit_metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ApiAuditLogList = {
  items: ApiAuditLog[];
  total: number;
  limit: number;
  offset: number;
};

export type ApiAuditLogQuery = {
  action?: string;
  actor_user_id?: string;
  company_id?: string;
  project_id?: string;
  resource_type?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
};

export type ApiAdminUserCompany = {
  company_id: string;
  company_name: string;
  company_slug: string;
  role: string;
  status: string;
  joined_at: string | null;
};

export type ApiAdminUserProject = {
  project_id: string;
  project_name: string;
  project_slug: string;
  company_id: string;
  role: string;
};

export type ApiAdminUser = {
  id: string;
  email: string;
  full_name: string;
  is_super_admin: boolean;
  status: string;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  companies: ApiAdminUserCompany[];
  projects?: ApiAdminUserProject[];
};

export type ApiAdminUserList = {
  items: ApiAdminUser[];
  total: number;
  limit: number;
  offset: number;
};

export type ApiAdminUserQuery = {
  status?: string;
  company_id?: string;
  is_super_admin?: boolean;
  limit?: number;
  offset?: number;
};

export type ApiCompanyKpis = {
  total: number;
  pending_approval: number;
  active: number;
  rejected: number;
  suspended: number;
};

export type ApiUserKpis = {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  super_admins: number;
};

export type ApiSocialAccountKpis = {
  total: number;
  active: number;
  disabled: number;
  by_platform: Record<string, number>;
};

export type ApiKpiSummary = {
  companies: ApiCompanyKpis;
  users: ApiUserKpis;
  social_accounts: ApiSocialAccountKpis;
  ai_generations?: number | null;
  posts_published?: number | null;
};

export type ApiSocialAccount = {
  id: string;
  project_id: string;
  platform: string;
  handle: string;
  profile_url: string | null;
  status: string;
  added_by: string;
  created_at: string;
};

export type ApiCompanyDetail = {
  id: string;
  name: string;
  slug: string;
  status: ApiCompanyStatus;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  members: ApiCompanyMember[];
  social_accounts: ApiSocialAccount[];
};
