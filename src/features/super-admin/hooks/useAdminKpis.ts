import { useQuery } from "@tanstack/react-query";

import { adminApi } from "../../../services/admin/adminApi";

export function useAdminKpis(enabled = true) {
  return useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async () => {
      const response = await adminApi.getKpis();
      return response.data;
    },
    enabled,
    refetchInterval: 12_000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminCompany(companyId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["admin-company", companyId],
    queryFn: async () => {
      const response = await adminApi.getCompany(companyId as string);
      return response.data;
    },
    enabled: enabled && Boolean(companyId),
  });
}
