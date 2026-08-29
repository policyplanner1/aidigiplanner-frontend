import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminApi } from "../../../services/admin/adminApi";
import type { ApiAdminUserQuery } from "../../../types/api";

export function adminUsersKey(query: ApiAdminUserQuery) {
  return ["admin-users", query] as const;
}

export function useAdminUsers(query: ApiAdminUserQuery, enabled = true) {
  return useQuery({
    queryKey: adminUsersKey(query),
    queryFn: async () => {
      const response = await adminApi.listUsers(query);
      return response.data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}
