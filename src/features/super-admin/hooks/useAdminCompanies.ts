import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "../../../services/api/errors";
import { adminApi } from "../../../services/admin/adminApi";
import type { ApiCompanyStatus } from "../../../types/api";

export type CompanyStatusFilter = ApiCompanyStatus | "all";

export function adminCompaniesKey(status: CompanyStatusFilter) {
  return ["admin-companies", status] as const;
}

export function useAdminCompanies(status: CompanyStatusFilter, enabled = true) {
  return useQuery({
    queryKey: adminCompaniesKey(status),
    queryFn: async () => {
      const response = await adminApi.listCompanies(
        status === "all" ? undefined : status,
      );
      return response.data;
    },
    enabled,
  });
}

export function useApproveCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const response = await adminApi.approveCompany(companyId);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
    },
  });
}

export function useRejectCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { companyId: string; reason: string }) => {
      const response = await adminApi.rejectCompany(input.companyId, input.reason);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
    },
  });
}

export function useSuspendCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const response = await adminApi.suspendCompany(companyId);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-company"] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      await adminApi.deleteCompany(companyId);
      return companyId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-company"] });
    },
  });
}

export function mutationErrorMessage(error: unknown) {
  return getApiErrorMessage(error);
}
