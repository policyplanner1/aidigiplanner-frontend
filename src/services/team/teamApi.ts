import { apiClient } from "../api/client";
import type {
  ApiCompanyMember,
  ApiCompanyMemberStatus,
  ApiCompanyRole,
  ApiProjectMember,
  ApiProjectRole,
} from "../../types/api";

export const teamApi = {
  listMembers(companyId: string) {
    return apiClient.get<ApiCompanyMember[]>(`/companies/${companyId}/members`);
  },

  addMember(
    companyId: string,
    input: {
      email: string;
      full_name?: string | null;
      role: ApiCompanyRole;
    },
  ) {
    return apiClient.post<ApiCompanyMember>(`/companies/${companyId}/members`, input);
  },

  updateMember(
    companyId: string,
    memberId: string,
    input: {
      role?: ApiCompanyRole | null;
      status?: ApiCompanyMemberStatus | null;
    },
  ) {
    return apiClient.patch<ApiCompanyMember>(
      `/companies/${companyId}/members/${memberId}`,
      input,
    );
  },

  removeMember(companyId: string, memberId: string) {
    return apiClient.delete(`/companies/${companyId}/members/${memberId}`);
  },

  listProjectMembers(projectId: string) {
    return apiClient.get<ApiProjectMember[]>(`/projects/${projectId}/members`);
  },

  addProjectMember(
    projectId: string,
    input: { user_id: string; role: ApiProjectRole },
  ) {
    return apiClient.post<ApiProjectMember>(`/projects/${projectId}/members`, input);
  },

  removeProjectMember(projectId: string, memberId: string) {
    return apiClient.delete(`/projects/${projectId}/members/${memberId}`, {
      validateStatus: (status) => status === 204 || status === 200,
    });
  },
};
