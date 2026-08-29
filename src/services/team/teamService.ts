import type { ProductModuleAccess, RoleName, UserStatus } from "../../types/auth";
import {
  buildSession,
  DEMO_PASSWORD,
  listStoredAccounts,
  saveStoredAccounts,
  type StoredAccount,
} from "../auth/mockAuth";
import { getAllProjects } from "../projects/projectService";

export const ORG_ASSIGNABLE_ROLES: RoleName[] = [
  "ADMIN",
  "SOCIAL_MANAGER",
  "CONTENT_MANAGER",
  "SALES_MANAGER",
  "ANALYST",
  "USER",
];

export type TeamMember = StoredAccount;

export function emptyProductAccess(projectId: string): ProductModuleAccess {
  return {
    projectId,
    manageAll: false,
    social: true,
    marketing: true,
    leads: true,
    crm: true,
  };
}

export function listTeamMembers(organizationId: string): TeamMember[] {
  return listStoredAccounts().filter(
    (account) => account.user.organizationId === organizationId,
  );
}

export function getTeamMember(userId: string): TeamMember | null {
  return listStoredAccounts().find((account) => account.user.id === userId) ?? null;
}

export type UpsertTeamMemberInput = {
  name: string;
  email: string;
  role: RoleName;
  status: UserStatus;
  productAccess: ProductModuleAccess[];
};

function assertAssignableRole(role: RoleName) {
  if (role === "SUPER_ADMIN") {
    throw new Error("Super Admin accounts are created on the platform, not here.");
  }
}

export function createTeamMember(
  organizationId: string,
  input: UpsertTeamMemberInput,
): { member: TeamMember; temporaryPassword: string } {
  assertAssignableRole(input.role);

  const accounts = listStoredAccounts();
  const email = input.email.trim().toLowerCase();

  if (accounts.some((account) => account.user.email.toLowerCase() === email)) {
    throw new Error("An account with this email already exists.");
  }

  const productAccess =
    input.role === "ADMIN"
      ? getAllProjects()
          .filter((project) => project.organizationId === organizationId)
          .map((project) => ({
            ...emptyProductAccess(project.id),
            manageAll: true,
          }))
      : input.productAccess;

  if (input.role !== "ADMIN" && productAccess.length === 0) {
    throw new Error("Assign at least one product.");
  }

  const member: TeamMember = {
    password: DEMO_PASSWORD,
    assignedBrandIds: productAccess.map((item) => item.projectId),
    productAccess,
    user: {
      id: `user_${crypto.randomUUID()}`,
      name: input.name.trim(),
      email,
      role: input.role,
      organizationId,
      status: input.status,
    },
  };

  saveStoredAccounts([...accounts, member]);
  return { member, temporaryPassword: DEMO_PASSWORD };
}

export function updateTeamMember(
  userId: string,
  input: UpsertTeamMemberInput,
  options?: { actorId?: string },
): TeamMember {
  assertAssignableRole(input.role);

  const accounts = listStoredAccounts();
  const current = accounts.find((account) => account.user.id === userId);

  if (!current) {
    throw new Error("That teammate was not found.");
  }

  if (options?.actorId === userId && input.role !== "ADMIN" && current.user.role === "ADMIN") {
    throw new Error("You cannot remove your own admin role.");
  }

  const email = input.email.trim().toLowerCase();
  if (
    accounts.some(
      (account) =>
        account.user.id !== userId && account.user.email.toLowerCase() === email,
    )
  ) {
    throw new Error("An account with this email already exists.");
  }

  const organizationId = current.user.organizationId;
  const productAccess =
    input.role === "ADMIN" && organizationId
      ? getAllProjects()
          .filter((project) => project.organizationId === organizationId)
          .map((project) => ({
            ...emptyProductAccess(project.id),
            manageAll: true,
          }))
      : input.productAccess;

  if (input.role !== "ADMIN" && productAccess.length === 0) {
    throw new Error("Assign at least one product.");
  }

  const next: TeamMember = {
    ...current,
    assignedBrandIds: productAccess.map((item) => item.projectId),
    productAccess,
    user: {
      ...current.user,
      name: input.name.trim(),
      email,
      role: input.role,
      status: input.status,
    },
  };

  saveStoredAccounts(
    accounts.map((account) => (account.user.id === userId ? next : account)),
  );
  return next;
}

export function refreshSessionForUser(
  userId: string,
  currentBrandId: string | null,
) {
  const member = getTeamMember(userId);
  if (!member) return null;
  return buildSession(member, currentBrandId);
}
