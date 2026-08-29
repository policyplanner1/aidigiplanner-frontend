import type { ApiAuditLog, ApiAuditLogList, ApiAuditLogQuery } from "../../types/api";
import { apiClient } from "../api/client";

export const auditApi = {
  listLogs(query: ApiAuditLogQuery = {}) {
    return apiClient.get<ApiAuditLogList>("/audit/logs", { params: query });
  },

  getLog(logId: string) {
    return apiClient.get<ApiAuditLog>(`/audit/logs/${logId}`);
  },
};
