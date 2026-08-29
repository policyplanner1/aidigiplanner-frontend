import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { auditApi } from "../../../services/audit/auditApi";
import type { ApiAuditLogQuery } from "../../../types/api";

export function auditLogsKey(query: ApiAuditLogQuery) {
  return ["audit-logs", query] as const;
}

export function useAuditLogs(query: ApiAuditLogQuery, enabled = true) {
  return useQuery({
    queryKey: auditLogsKey(query),
    queryFn: async () => {
      const response = await auditApi.listLogs(query);
      return response.data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAuditLog(logId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["audit-log", logId],
    queryFn: async () => {
      const response = await auditApi.getLog(logId as string);
      return response.data;
    },
    enabled: enabled && Boolean(logId),
  });
}
