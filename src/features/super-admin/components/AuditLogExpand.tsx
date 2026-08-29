import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { getApiErrorMessage } from "../../../services/api/errors";
import type { ApiAuditLog } from "../../../types/api";
import { formatWhen } from "../auditLabels";
import { useAuditLog } from "../hooks/useAuditLogs";

type AuditLogExpandProps = {
  logId: string;
};

function text(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ ...TYPE.label, color: "text.secondary", fontSize: 11 }}>{label}</Typography>
      <Typography sx={{ ...TYPE.body, mt: 0.3, fontWeight: 600, wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}

function DetailsGrid({ log }: { log: ApiAuditLog }) {
  const metadata =
    log.audit_metadata && Object.keys(log.audit_metadata).length > 0
      ? JSON.stringify(log.audit_metadata, null, 2)
      : "—";

  const fields: { label: string; value: string }[] = [
    { label: "id", value: text(log.id) },
    { label: "action", value: text(log.action) },
    { label: "actor_user_id", value: text(log.actor_user_id) },
    { label: "actor_name", value: text(log.actor_name) },
    { label: "actor_email", value: text(log.actor_email) },
    { label: "company_id", value: text(log.company_id) },
    { label: "company_name", value: text(log.company_name) },
    { label: "project_id", value: text(log.project_id) },
    { label: "resource_type", value: text(log.resource_type) },
    { label: "resource_id", value: text(log.resource_id) },
    { label: "ip_address", value: text(log.ip_address) },
    { label: "user_agent", value: text(log.user_agent) },
    { label: "created_at", value: `${text(log.created_at)}${log.created_at ? `  (${formatWhen(log.created_at)})` : ""}` },
  ];

  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        }}
      >
        {fields.map((field) => (
          <Field key={field.label} label={field.label} value={field.value} />
        ))}
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          backgroundColor: SURFACE.paper,
          border: `1px solid ${SURFACE.border}`,
        }}
      >
        <Typography sx={{ ...TYPE.label, color: "text.secondary", fontSize: 11, mb: 0.75 }}>
          audit_metadata
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            ...TYPE.body,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {metadata}
        </Box>
      </Box>
    </Box>
  );
}

export function AuditLogExpand({ logId }: AuditLogExpandProps) {
  const detail = useAuditLog(logId);

  if (detail.isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 3 }}>
        <CircularProgress size={22} />
      </Box>
    );
  }

  if (detail.isError) {
    return <Alert severity="error">{getApiErrorMessage(detail.error)}</Alert>;
  }

  if (!detail.data) return null;

  return <DetailsGrid log={detail.data} />;
}
