import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { teamMembersKey } from "../../team/hooks/useLiveTeamMembers";
import { teamApi } from "../../../services/team/teamApi";
import type { ApiProjectRole } from "../../../types/api";

export function projectMembersKey(projectId: string) {
  return ["project-members", projectId] as const;
}

export function useProjectMembers(projectId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: projectMembersKey(projectId ?? ""),
    queryFn: async () => {
      const { data } = await teamApi.listProjectMembers(projectId as string);
      return data;
    },
    enabled: Boolean(projectId) && enabled,
  });
}

export function useCompanyMemberOptions(companyId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["company-members", companyId ?? "", "options"],
    queryFn: async () => {
      const { data } = await teamApi.listMembers(companyId as string);
      return data.filter((member) => member.status === "active");
    },
    enabled: Boolean(companyId) && enabled,
  });
}

export function useAddProjectMember(projectId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { user_id: string; role: ApiProjectRole }) =>
      teamApi.addProjectMember(projectId, input).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectMembersKey(projectId) });
      if (companyId) {
        void queryClient.invalidateQueries({ queryKey: teamMembersKey(companyId) });
      }
    },
  });
}

export function useRemoveProjectMember(projectId: string, companyId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => teamApi.removeProjectMember(projectId, memberId),
    onSuccess: (_data, memberId) => {
      queryClient.setQueryData(projectMembersKey(projectId), (current: unknown) => {
        if (!Array.isArray(current)) return current;
        return current.filter((member: { id: string }) => member.id !== memberId);
      });
      void queryClient.invalidateQueries({ queryKey: projectMembersKey(projectId) });
      if (companyId) {
        void queryClient.invalidateQueries({ queryKey: teamMembersKey(companyId) });
      }
    },
  });
}
