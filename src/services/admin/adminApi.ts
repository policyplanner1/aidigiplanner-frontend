import type {
  ApiAdminUser,
  ApiAdminUserList,
  ApiAdminUserQuery,
  ApiCompanyDetail,
  ApiCompanyStatus,
  ApiCompanySummary,
  ApiKpiSummary,
} from "../../types/api";
import { apiClient } from "../api/client";

export const adminApi = {
  listCompanies(status?: ApiCompanyStatus) {
    return apiClient.get<ApiCompanySummary[]>("/admin/companies", {
      params: status ? { status } : undefined,
    });
  },

  getCompany(companyId: string) {
    return apiClient.get<ApiCompanyDetail>(`/admin/companies/${companyId}`);
  },

  listUsers(query: ApiAdminUserQuery = {}) {
    return apiClient.get<ApiAdminUserList>("/admin/users", { params: query });
  },

  getUser(userId: string) {
    return apiClient.get<ApiAdminUser>(`/admin/users/${userId}`);
  },

  getKpis() {
    return apiClient.get<ApiKpiSummary>("/admin/kpis");
  },

  approveCompany(companyId: string) {
    return apiClient.post<ApiCompanySummary>(`/admin/companies/${companyId}/approve`);
  },

  rejectCompany(companyId: string, reason: string) {
    return apiClient.post<ApiCompanySummary>(`/admin/companies/${companyId}/reject`, {
      reason,
    });
  },

  suspendCompany(companyId: string) {
    return apiClient.post<ApiCompanySummary>(`/admin/companies/${companyId}/suspend`);
  },

  deleteCompany(companyId: string) {
    return apiClient.delete(`/admin/companies/${companyId}`);
  },
};
