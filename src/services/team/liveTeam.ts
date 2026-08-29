import { teamApi } from "./teamApi";
import type { ApiCompanyMember, ApiCompanyRole } from "../../types/api";

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
    role: ApiCompanyRole;
    projectIds: string[];
  },
) {
  const { data } = await teamApi.addMember(companyId, {
    email: input.email.trim().toLowerCase(),
    full_name: input.name.trim(),
    role: input.role,
  });

  if (input.role === "member" && input.projectIds.length > 0) {
    await Promise.allSettled(
      input.projectIds.map((projectId) =>
        teamApi.addProjectMember(projectId, {
          user_id: data.user_id,
          role: "editor",
        }),
      ),
    );
  }

  return data;
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
