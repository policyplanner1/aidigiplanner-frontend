import type {
  AuthSession,
  ProductModuleAccess,
  RoleName,
  User,
} from "../../types/auth";
import type { Organization, Project } from "../../types/organization";
import {
  getPermissionsForProductAccess,
  getPermissionsForRole,
} from "../../permissions/roles";
import {
  createProject,
  DEMO_PROJECTS,
  getProjectsForSession,
  seedProjects,
} from "../projects/projectService";
import { useOrganizationStore } from "../../store/organizationStore";

export const DEMO_PASSWORD = "Password123!";

export type StoredAccount = {
  user: User;
  password: string;
  assignedBrandIds: string[];
  productAccess?: ProductModuleAccess[];
};

function defaultProductAccess(
  projectId: string,
  manageAll = false,
): ProductModuleAccess {
  return {
    projectId,
    manageAll,
    social: true,
    marketing: true,
    leads: true,
    crm: true,
  };
}

export function normalizeAccount(account: StoredAccount): StoredAccount {
  const productAccess =
    account.productAccess && account.productAccess.length > 0
      ? account.productAccess
      : account.assignedBrandIds.map((projectId) =>
          defaultProductAccess(projectId, account.user.role === "ADMIN"),
        );

  return {
    ...account,
    productAccess,
    assignedBrandIds: productAccess.map((item) => item.projectId),
  };
}

export const DEMO_ORGANIZATION: Organization = {
  id: "org_abc",
  name: "ABC Marketing",
  slug: "abc-marketing",
  plan: "Growth",
  status: "active",
};

export const DEMO_ACCOUNTS: StoredAccount[] = [
  {
    password: DEMO_PASSWORD,
    assignedBrandIds: [],
    productAccess: [],
    user: {
      id: "user_super_admin",
      name: "Platform Admin",
      email: "emma.t@example.net",
      role: "SUPER_ADMIN",
      organizationId: null,
      status: "active",
    },
  },
  {
    password: DEMO_PASSWORD,
    assignedBrandIds: DEMO_PROJECTS.map((project) => project.id),
    productAccess: DEMO_PROJECTS.map((project) =>
      defaultProductAccess(project.id, true),
    ),
    user: {
      id: "user_prakash",
      name: "Prakash Patil",
      email: "prakash@gmail.com",
      role: "ADMIN",
      organizationId: DEMO_ORGANIZATION.id,
      status: "active",
    },
  },
  {
    password: DEMO_PASSWORD,
    assignedBrandIds: ["brand_product_a"],
    productAccess: [
      {
        projectId: "brand_product_a",
        manageAll: false,
        social: true,
        marketing: true,
        leads: false,
        crm: false,
      },
    ],
    user: {
      id: "user_amit",
      name: "Amit Patel",
      email: "uma.s@example.org",
      role: "SOCIAL_MANAGER",
      organizationId: DEMO_ORGANIZATION.id,
      status: "active",
    },
  },
];

const ACCOUNTS_KEY = "ai-growth-demo-accounts-v2";
const ORGANIZATIONS_KEY = "ai-growth-demo-organizations";

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedDemoData() {
  readJson(ACCOUNTS_KEY, DEMO_ACCOUNTS);
  readJson(ORGANIZATIONS_KEY, [DEMO_ORGANIZATION]);
  seedProjects();
}

function getAccounts() {
  return readJson(ACCOUNTS_KEY, DEMO_ACCOUNTS).map(normalizeAccount);
}

export function listStoredAccounts() {
  seedDemoData();
  return getAccounts();
}

export function saveStoredAccounts(accounts: StoredAccount[]) {
  writeJson(ACCOUNTS_KEY, accounts.map(normalizeAccount));
  useOrganizationStore.getState().bumpRevision();
}

function getOrganizations() {
  return readJson(ORGANIZATIONS_KEY, [DEMO_ORGANIZATION]);
}

export function buildSession(
  account: StoredAccount,
  currentBrandId?: string | null,
): AuthSession {
  const normalized = normalizeAccount(account);
  const access = normalized.productAccess?.find(
    (item) => item.projectId === currentBrandId,
  );

  return {
    user: normalized.user,
    organizationId: normalized.user.organizationId,
    assignedBrandIds: normalized.assignedBrandIds,
    permissions:
      normalized.user.role === "ADMIN" || normalized.user.role === "SUPER_ADMIN"
        ? getPermissionsForRole(normalized.user.role)
        : getPermissionsForProductAccess(normalized.user.role, access),
  };
}

export function loginWithPassword(email: string, password: string): AuthSession {
  seedDemoData();

  const account = getAccounts().find(
    (item) => item.user.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!account || account.password !== password) {
    throw new Error("Invalid email or password.");
  }

  if (account.user.status !== "active") {
    throw new Error("This account is not active.");
  }

  return buildSession(account, account.assignedBrandIds[0] ?? null);
}

export function signupOrganization(input: {
  companyName: string;
  name: string;
  email: string;
  password: string;
}): AuthSession {
  seedDemoData();

  const accounts = getAccounts();
  const email = input.email.trim().toLowerCase();

  if (accounts.some((account) => account.user.email.toLowerCase() === email)) {
    throw new Error("An account with this email already exists.");
  }

  const organizationId = `org_${crypto.randomUUID()}`;
  const slug = input.companyName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const organization: Organization = {
    id: organizationId,
    name: input.companyName.trim(),
    slug: slug || organizationId,
    plan: "Starter",
    status: "active",
  };

  const project = createProject({
    organizationId,
    name: input.companyName.trim(),
    description: "Primary project",
    industry: "General",
    modules: {
      social: true,
      marketing: true,
      leads: true,
      crm: true,
    },
  });

  const user: User = {
    id: `user_${crypto.randomUUID()}`,
    name: input.name.trim(),
    email,
    role: "ADMIN" satisfies RoleName,
    organizationId,
    status: "active",
  };

  const account: StoredAccount = {
    user,
    password: input.password,
    assignedBrandIds: [project.id],
    productAccess: [defaultProductAccess(project.id, true)],
  };

  writeJson(ACCOUNTS_KEY, [...accounts, account]);
  writeJson(ORGANIZATIONS_KEY, [...getOrganizations(), organization]);

  return buildSession(account, project.id);
}

export function getOrganizationById(id: string | null): Organization | null {
  if (!id) return null;
  return getOrganizations().find((organization) => organization.id === id) ?? null;
}

export function getBrandsForSession(session: AuthSession): Project[] {
  return getProjectsForSession(session);
}
