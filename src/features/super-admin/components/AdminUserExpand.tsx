import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { adminApi } from "../../../services/admin/adminApi";
import { getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import type { ApiAdminUser, ApiAdminUserCompany, ApiAdminUserProject } from "../../../types/api";

function text(value: string | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  return value;
}

function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function membershipRole(role: string) {
  if (role === "company_admin") return "Organization Admin";
  if (role === "member") return "Member";
  return role;
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

function projectRole(role: string) {
  if (role === "project_admin") return "Project admin";
  if (role === "editor") return "Editor";
  if (role === "viewer") return "Viewer";
  return role;
}

function CompanyCard({
  company,
  projects,
}: {
  company: ApiAdminUserCompany;
  projects: ApiAdminUserProject[];
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        backgroundColor: SURFACE.paper,
        border: `1px solid ${SURFACE.border}`,
        display: "grid",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
        }}
      >
        <Field label="company_name" value={text(company.company_name)} />
        <Field label="company_slug" value={text(company.company_slug)} />
        <Field label="company_id" value={text(company.company_id)} />
        <Field label="role" value={membershipRole(company.role)} />
        <Field label="status" value={text(company.status)} />
        <Field label="joined_at" value={formatWhen(company.joined_at)} />
      </Box>
      <Box>
        <Typography sx={{ ...TYPE.label, color: "text.secondary", fontSize: 11, mb: 0.75 }}>
          projects
        </Typography>
        {projects.length === 0 ? (
          <Typography sx={{ ...TYPE.body, fontWeight: 600 }}>—</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 0.75 }}>
            {projects.map((project) => (
              <Box
                key={project.project_id}
                sx={{
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                }}
              >
                <Field label="project_name" value={text(project.project_name)} />
                <Field label="project_slug" value={text(project.project_slug)} />
                <Field label="role" value={projectRole(project.role)} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function AdminUserExpand({ user }: { user: ApiAdminUser }) {
  const live = isLiveAuth();
  const detail = useQuery({
    queryKey: ["admin-user", user.id],
    queryFn: async () => (await adminApi.getUser(user.id)).data,
    enabled: live,
  });
  const resolved = detail.data ?? user;
  const companies = resolved.companies ?? [];
  const projects = resolved.projects ?? [];

  const fields: { label: string; value: string }[] = [
    { label: "id", value: text(resolved.id) },
    { label: "email", value: text(resolved.email) },
    { label: "full_name", value: text(resolved.full_name) },
    { label: "is_super_admin", value: text(resolved.is_super_admin) },
    { label: "status", value: text(resolved.status) },
    { label: "email_verified_at", value: formatWhen(resolved.email_verified_at) },
    { label: "last_login_at", value: formatWhen(resolved.last_login_at) },
    { label: "created_at", value: formatWhen(resolved.created_at) },
  ];

  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      {detail.isLoading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading user detail…
          </Typography>
        </Box>
      ) : null}
      {detail.isError ? <Alert severity="warning">{getApiErrorMessage(detail.error)}</Alert> : null}
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

      <Box>
        <Typography sx={{ ...TYPE.label, color: "text.secondary", fontSize: 11, mb: 1 }}>
          companies
        </Typography>
        {companies.length === 0 ? (
          <Typography sx={{ ...TYPE.body, fontWeight: 600 }}>—</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {companies.map((company) => (
              <CompanyCard
                key={`${company.company_id}-${company.role}`}
                company={company}
                projects={projects.filter((project) => project.company_id === company.company_id)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
