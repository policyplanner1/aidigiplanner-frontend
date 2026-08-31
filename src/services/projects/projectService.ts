import type {
  Brand,
  Project,
  ProjectModules,
  SocialAccount,
  SocialPlatform,
} from "../../types/organization";
import type { AuthSession } from "../../types/auth";
import { useOrganizationStore } from "../../store/organizationStore";

const BRANDS_KEY = "ai-growth-demo-brands";
const SOCIAL_ACCOUNTS_KEY = "ai-growth-demo-social-accounts-v2";

const DEFAULT_MODULES: ProjectModules = {
  social: true,
  marketing: true,
  leads: true,
  crm: true,
};

export function normalizeProject(
  project: Partial<Project> & Pick<Project, "id" | "organizationId" | "name">,
): Project {
  return {
    id: project.id,
    organizationId: project.organizationId,
    name: project.name,
    description: project.description ?? "",
    industry: project.industry ?? "General",
    status: project.status ?? "active",
    modules: {
      social: project.modules?.social ?? true,
      marketing: project.modules?.marketing ?? true,
      leads: project.modules?.leads ?? true,
      crm: project.modules?.crm ?? true,
    },
  };
}

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

function bumpWorkspace() {
  useOrganizationStore.getState().bumpRevision();
}

export const DEMO_PROJECTS: Project[] = [
  {
    id: "brand_product_a",
    organizationId: "org_abc",
    name: "Insurance Product A",
    description: "Health and life insurance brand",
    industry: "Insurance",
    status: "active",
    modules: DEFAULT_MODULES,
  },
  {
    id: "brand_product_b",
    organizationId: "org_abc",
    name: "Insurance Product B",
    description: "Travel insurance brand",
    industry: "Insurance",
    status: "active",
    modules: {
      social: true,
      marketing: true,
      leads: true,
      crm: false,
    },
  },
  {
    id: "brand_corporate",
    organizationId: "org_abc",
    name: "Corporate Brand",
    description: "Company-wide corporate presence",
    industry: "Corporate",
    status: "active",
    modules: {
      social: true,
      marketing: true,
      leads: false,
      crm: true,
    },
  },
];

export const DEMO_SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: "social_a_ig",
    projectId: "brand_product_a",
    organizationId: "org_abc",
    platform: "instagram",
    accountName: "Product A Insurance",
    handle: "@producta.insurance",
    platformAccountId: "1780001",
    status: "connected",
    tokenHealth: "needs_reconnect",
    purpose: "publishing",
  },
  {
    id: "social_a_fb",
    projectId: "brand_product_a",
    organizationId: "org_abc",
    platform: "facebook",
    accountName: "Product A Insurance",
    handle: "Product A Insurance",
    platformAccountId: "page_0001",
    status: "connected",
    tokenHealth: "valid",
    purpose: "publishing",
  },
  {
    id: "social_b_ig",
    projectId: "brand_product_b",
    organizationId: "org_abc",
    platform: "instagram",
    accountName: "Product B Travel",
    handle: "@productb.travel",
    platformAccountId: "1780002",
    status: "connected",
    tokenHealth: "valid",
    purpose: "publishing",
  },
  {
    id: "social_c_li",
    projectId: "brand_corporate",
    organizationId: "org_abc",
    platform: "linkedin",
    accountName: "ABC Marketing",
    handle: "ABC Marketing",
    platformAccountId: "li_0001",
    status: "connected",
    tokenHealth: "valid",
    purpose: "publishing",
  },
  {
    id: "social_c_ig",
    projectId: "brand_corporate",
    organizationId: "org_abc",
    platform: "instagram",
    accountName: "ABC Corporate",
    handle: "@abc.corporate",
    platformAccountId: "1780003",
    status: "connected",
    tokenHealth: "valid",
    purpose: "publishing",
  },
];

export function seedProjects() {
  const stored = readJson(BRANDS_KEY, DEMO_PROJECTS).map(normalizeProject);
  writeJson(BRANDS_KEY, stored);
  readJson(SOCIAL_ACCOUNTS_KEY, DEMO_SOCIAL_ACCOUNTS);
}

export function getAllProjects(): Project[] {
  seedProjects();
  return readJson<Brand[]>(BRANDS_KEY, DEMO_PROJECTS).map(normalizeProject);
}

export function saveProjects(projects: Project[]) {
  writeJson(BRANDS_KEY, projects.map(normalizeProject));
  bumpWorkspace();
}

export function getProjectsForSession(session: AuthSession): Project[] {
  if (!session.organizationId) return [];

  const projects = getAllProjects().filter(
    (project) => project.organizationId === session.organizationId,
  );

  if (session.user.role === "COMPANY_ADMIN") {
    return projects;
  }

  return projects.filter((project) =>
    session.assignedBrandIds.includes(project.id),
  );
}

export function getProjectById(projectId: string): Project | null {
  return getAllProjects().find((project) => project.id === projectId) ?? null;
}

export function createProject(input: {
  organizationId: string;
  name: string;
  description: string;
  industry: string;
  modules: ProjectModules;
}): Project {
  const project = normalizeProject({
    id: `brand_${crypto.randomUUID()}`,
    organizationId: input.organizationId,
    name: input.name.trim(),
    description: input.description.trim(),
    industry: input.industry.trim() || "General",
    status: "active",
    modules: input.modules,
  });

  saveProjects([...getAllProjects(), project]);
  return project;
}

export function deleteProject(projectId: string) {
  saveProjects(getAllProjects().filter((project) => project.id !== projectId));
  writeSocialAccounts(readSocialAccounts().filter((account) => account.projectId !== projectId));
}

export function normalizeSocialAccount(account: SocialAccount): SocialAccount {
  return {
    ...account,
    handle: account.handle ?? account.accountName,
    tokenHealth:
      account.tokenHealth ??
      (account.status === "connected" ? "valid" : "needs_reconnect"),
    purpose:
      account.purpose ??
      (account.platform === "whatsapp" ? "messaging" : "publishing"),
  };
}

function readSocialAccounts(): SocialAccount[] {
  return readJson<SocialAccount[]>(SOCIAL_ACCOUNTS_KEY, DEMO_SOCIAL_ACCOUNTS).map(
    normalizeSocialAccount,
  );
}

function writeSocialAccounts(accounts: SocialAccount[]) {
  writeJson(SOCIAL_ACCOUNTS_KEY, accounts.map(normalizeSocialAccount));
  bumpWorkspace();
}

export function getSocialAccounts(projectId: string): SocialAccount[] {
  seedProjects();
  return readSocialAccounts().filter((account) => account.projectId === projectId);
}

export function connectSocialAccount(input: {
  projectId: string;
  organizationId: string;
  platform: SocialPlatform;
  accountName: string;
  handle?: string;
  platformAccountId?: string;
  purpose?: SocialAccount["purpose"];
  metrics?: SocialAccount["metrics"];
  tokenHealth?: SocialAccount["tokenHealth"];
}): SocialAccount {
  const accounts = readSocialAccounts();

  const existing = accounts.find(
    (account) =>
      account.projectId === input.projectId &&
      account.platform === input.platform &&
      (input.platformAccountId
        ? account.platformAccountId === input.platformAccountId
        : true),
  );

  const nextAccount = normalizeSocialAccount({
    id: existing?.id ?? `social_${crypto.randomUUID()}`,
    projectId: input.projectId,
    organizationId: input.organizationId,
    platform: input.platform,
    accountName: input.accountName.trim(),
    handle: input.handle ?? input.accountName.trim(),
    platformAccountId: input.platformAccountId,
    status: "connected",
    tokenHealth: input.tokenHealth ?? "valid",
    purpose: input.purpose,
    metrics: input.metrics,
  });

  const nextAccounts = existing
    ? accounts.map((account) =>
        account.id === existing.id ? nextAccount : account,
      )
    : [...accounts, nextAccount];

  writeSocialAccounts(nextAccounts);
  return nextAccount;
}

export function disconnectSocialAccount(accountId: string) {
  writeSocialAccounts(
    readSocialAccounts().map((account) =>
      account.id === accountId
        ? { ...account, status: "disconnected" as const }
        : account,
    ),
  );
}
