export const ROLE_NAMES = [
  "SUPER_ADMIN",
  "COMPANY_ADMIN",
  "PRODUCT_MANAGER",
  "CONTENT_CREATOR",
  "APPROVER",
  "PUBLISHER",
  "ANALYST",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export type UserStatus = "active" | "invited" | "suspended";

export type ProductModuleAccess = {
  projectId: string;
  manageAll: boolean;
  social: boolean;
  marketing: boolean;
  leads: boolean;
  crm: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  organizationId: string | null;
  status: UserStatus;
};

export type AuthSession = {
  user: User;
  organizationId: string | null;
  assignedBrandIds: string[];
  permissions: string[];
  source?: "mock" | "api";
  companyStatus?: string;
  organizationName?: string;
  organizationSlug?: string;
  emailVerified?: boolean;
};
