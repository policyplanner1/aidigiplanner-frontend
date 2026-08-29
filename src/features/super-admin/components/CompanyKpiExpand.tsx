import { Alert, Box, Chip, CircularProgress, Typography } from "@mui/material";
import { useMemo } from "react";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { getApiErrorMessage } from "../../../services/api/errors";
import { companyRoleLabel } from "../../../services/team/liveTeam";
import type { ApiAdminUserProject, ApiCompanyRole } from "../../../types/api";
import { useAdminCompany } from "../hooks/useAdminKpis";
import { useAdminUsers } from "../hooks/useAdminUsers";

function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function projectRoleLabel(role: string) {
  if (role === "project_admin") return "Project admin";
  if (role === "editor") return "Editor";
  if (role === "viewer") return "Viewer";
  return role.replace(/[._-]+/g, " ");
}

type CompanyProject = {
  project_id: string;
  project_name: string;
  project_slug: string;
  members: { id: string; name: string; email: string; role: string }[];
};

function projectsForCompany(companyId: string, users: { id: string; full_name: string; email: string; projects?: ApiAdminUserProject[] }[]) {
  const map = new Map<string, CompanyProject>();
  for (const user of users) {
    for (const project of user.projects ?? []) {
      if (project.company_id !== companyId) continue;
      const current = map.get(project.project_id) ?? {
        project_id: project.project_id,
        project_name: project.project_name,
        project_slug: project.project_slug,
        members: [],
      };
      current.members.push({
        id: user.id,
        name: user.full_name || user.email,
        email: user.email,
        role: project.role,
      });
      map.set(project.project_id, current);
    }
  }
  return [...map.values()].sort((a, b) => a.project_name.localeCompare(b.project_name));
}

export function CompanyKpiExpand({ companyId }: { companyId: string }) {
  const detail = useAdminCompany(companyId);
  const users = useAdminUsers({ company_id: companyId, limit: 200, offset: 0 });

  const projects = useMemo(
    () => projectsForCompany(companyId, users.data?.items ?? []),
    [companyId, users.data],
  );

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

  const company = detail.data;
  if (!company) return null;

  const members = [...(company.members ?? [])].sort((a, b) =>
    a.user_full_name.localeCompare(b.user_full_name),
  );
  const accounts = [...(company.social_accounts ?? [])].sort((a, b) =>
    a.platform.localeCompare(b.platform),
  );

  return (
    <Box sx={{ display: "grid", gap: 2, pt: 1.5 }}>
      <Box>
        <Typography sx={{ ...TYPE.label, mb: 1 }}>Members</Typography>
        {members.length === 0 ? (
          <Typography color="text.secondary">No members yet.</Typography>
        ) : (
          members.map((member) => (
            <Box key={member.id} sx={{ display: "flex", gap: 2, py: 0.75, flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 700, minWidth: 160 }}>{member.user_full_name}</Typography>
              <Typography color="text.secondary">{member.user_email}</Typography>
              <Chip size="small" label={companyRoleLabel(member.role as ApiCompanyRole)} />
              <Chip size="small" label={member.status} />
            </Box>
          ))
        )}
      </Box>

      <Box>
        <Typography sx={{ ...TYPE.label, mb: 1 }}>Projects</Typography>
        {users.isLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
            <CircularProgress size={18} />
          </Box>
        ) : users.isError ? (
          <Alert severity="error">{getApiErrorMessage(users.error)}</Alert>
        ) : projects.length === 0 ? (
          <Typography color="text.secondary">No projects yet.</Typography>
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {projects.map((project) => (
              <Box
                key={project.project_id}
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  backgroundColor: SURFACE.paper,
                  border: `1px solid ${SURFACE.border}`,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "baseline" }}>
                  <Typography sx={{ fontWeight: 700 }}>{project.project_name}</Typography>
                  <Typography color="text.secondary">{project.project_slug}</Typography>
                </Box>
                {project.members.map((member) => (
                  <Box key={`${project.project_id}-${member.id}`} sx={{ display: "flex", gap: 1.5, py: 0.6, flexWrap: "wrap" }}>
                    <Typography sx={{ minWidth: 160 }}>{member.name}</Typography>
                    <Typography color="text.secondary">{member.email}</Typography>
                    <Chip size="small" label={projectRoleLabel(member.role)} />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box>
        <Typography sx={{ ...TYPE.label, mb: 1 }}>Connected accounts</Typography>
        {accounts.length === 0 ? (
          <Typography color="text.secondary">No connected accounts.</Typography>
        ) : (
          accounts.map((account) => (
            <Box key={account.id} sx={{ display: "flex", gap: 2, py: 0.75, flexWrap: "wrap" }}>
              <Typography sx={{ fontWeight: 700, minWidth: 120 }}>{account.platform}</Typography>
              <Typography>{account.handle}</Typography>
              <Chip size="small" label={account.status} />
              <Typography color="text.secondary">{formatWhen(account.created_at)}</Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
