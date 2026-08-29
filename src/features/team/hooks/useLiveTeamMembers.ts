import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addLiveTeamMember,
  listLiveTeam,
  removeLiveTeamMember,
  updateLiveTeamMember,
} from "../../../services/team/liveTeam";
import type { ApiCompanyRole } from "../../../types/api";

export function teamMembersKey(companyId: string) {
  return ["company-members", companyId] as const;
}

export function useLiveTeamMembers(
  companyId: string | undefined,
  projects: { id: string; name: string }[],
) {
  return useQuery({
    queryKey: [...teamMembersKey(companyId ?? ""), ...projects.map((item) => item.id)],
    queryFn: () => listLiveTeam(companyId as string, projects),
    enabled: Boolean(companyId),
  });
}

export function useAddLiveTeamMember(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      name: string;
      email: string;
      role: ApiCompanyRole;
      projectIds: string[];
    }) => addLiveTeamMember(companyId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamMembersKey(companyId) });
    },
  });
}

export function useUpdateLiveTeamMember(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      memberId: string;
      role: ApiCompanyRole;
      status: "active" | "suspended";
    }) =>
      updateLiveTeamMember(companyId, input.memberId, {
        role: input.role,
        status: input.status,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamMembersKey(companyId) });
    },
  });
}

export function useRemoveLiveTeamMember(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeLiveTeamMember(companyId, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamMembersKey(companyId) });
    },
  });
}
