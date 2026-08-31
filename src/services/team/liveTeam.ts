import { teamApi } from "./teamApi";
import type { ApiCompanyMember, ApiCompanyRole, ApiProductMemberRole } from "../../types/api";

export type LiveTeamProjectAccess = {
  projectId: string;
  projectName: string;
  membershipId: string;
  role: string;
};

export type LiveTeamMember = {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  email: string;
  role: ApiCompanyRole;
  status: "active" | "suspended";
  projects: LiveTeamProjectAccess[];
};

export function companyRoleLabel(role: ApiCompanyRole) {
  return role === "company_admin" ? "Organization Admin" : "Member";
}

export async function listLiveTeam(
  companyId: string,
  catalog: { id: string; name: string }[],
): Promise<LiveTeamMember[]> {
  const { data: members } = await teamApi.listMembers(companyId);
  return members.map((member) => mapMember(member, catalog));
}

function mapMember(
  member: ApiCompanyMember,
  catalog: { id: string; name: string }[],
): LiveTeamMember {
  return {
    id: member.id,
    userId: member.user_id,
    companyId: member.company_id,
    name: member.user_full_name,
    email: member.user_email,
    role: member.role,
    status: member.status,
    projects: mapProjectAccess(member.projects, catalog),
  };
}

function mapProjectAccess(
  names: string[] | null | undefined,
  catalog: { id: string; name: string }[],
): LiveTeamProjectAccess[] {
  if (!names || names.length === 0) return [];
  return names.map((name) => {
    const match = catalog.find(
      (project) => project.name.toLowerCase() === name.toLowerCase(),
    );
    return {
      projectId: match?.id ?? name,
      projectName: match?.name ?? name,
      membershipId: "",
      role: "editor",
    };
  });
}

export async function addLiveTeamMember(
  companyId: string,
  input: {
    name: string;
    email: string;
    role: "company_admin" | ApiProductMemberRole;
    projectIds: string[];
  },
) {
  const email = input.email.trim().toLowerCase();
  const full_name = input.name.trim();

  if (input.role === "company_admin") {
    const { data } = await teamApi.addMember(companyId, { email, full_name, role: "company_admin" });
    return data;
  }

  // Product-scoped roles (product_manager/creator/approver/publisher/analyst)
  // aren't company members at all — inviting them to a product creates their
  // CompanyMember(role=member) row automatically (see products/service.py
  // invite_member), so there's no separate /companies/{id}/members call here.
  if (input.projectIds.length === 0) {
    throw new Error("Pick at least one product for this role.");
  }

  const results = await Promise.allSettled(
    input.projectIds.map((projectId) =>
      teamApi.inviteProductMember(projectId, { email, full_name, role: input.role as ApiProductMemberRole }),
    ),
  );

  const first = results.find((result) => result.status === "fulfilled") as
    | PromiseFulfilledResult<Awaited<ReturnType<typeof teamApi.inviteProductMember>>>
    | undefined;
  const firstFailure = results.find((result) => result.status === "rejected") as
    | PromiseRejectedResult
    | undefined;

  if (!first) {
    throw firstFailure?.reason ?? new Error("Could not invite this teammate to any product.");
  }

  return first.value.data;
}

export async function updateLiveTeamMember(
  companyId: string,
  memberId: string,
  input: { role: ApiCompanyRole; status: "active" | "suspended" },
) {
  const { data } = await teamApi.updateMember(companyId, memberId, input);
  return data;
}

export async function removeLiveTeamMember(companyId: string, memberId: string) {
  await teamApi.removeMember(companyId, memberId);
}
