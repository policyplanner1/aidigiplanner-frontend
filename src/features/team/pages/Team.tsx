import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { ROLE_LABELS } from "../../../permissions/roles";
import { getAllProjects } from "../../../services/projects/projectService";
import {
  createTeamMember,
  listTeamMembers,
  refreshSessionForUser,
  updateTeamMember,
  type TeamMember,
} from "../../../services/team/teamService";
import { useAuthStore } from "../../../store/authStore";
import type { ProductModuleAccess, RoleName } from "../../../types/auth";
import { MemberDialog } from "../components/MemberDialog";
import { LiveTeamPanel } from "../components/LiveTeamPanel";
import type { TeamMemberFormValues } from "../schemas/teamMemberSchema";

function accessSummary(
  member: TeamMember,
  projectNames: Map<string, string>,
): string {
  if (member.user.role === "COMPANY_ADMIN") return "All products";

  const access = member.productAccess ?? [];
  if (access.length === 0) return "No products";

  return access
    .map((item) => {
      const name = projectNames.get(item.projectId) ?? "Product";
      if (item.manageAll) return `${name} · Full access`;
      const modules = [
        item.social ? "Social" : null,
        item.marketing ? "Content" : null,
        item.leads ? "Leads" : null,
        item.crm ? "CRM" : null,
      ].filter(Boolean);
      return `${name} · ${modules.join(", ")}`;
    })
    .join(" · ");
}

export function TeamPage() {
  const { user, session } = useAuth();
  const setSession = useAuthStore((state) => state.setSession);
  const { organization, projects, currentProject } = useWorkspace();
  const { can } = usePermissions();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const members =
    session?.source === "api" || !organization
      ? []
      : listTeamMembers(organization.id);
  const canManage = can(PERMISSIONS.TEAM_MANAGE);

  const orgProjects = useMemo(() => {
    if (!organization) return [];
    const visibleIds = new Set(projects.map((project) => project.id));
    return getAllProjects().filter(
      (project) =>
        project.organizationId === organization.id &&
        (user?.role === "COMPANY_ADMIN" || visibleIds.has(project.id)),
    );
  }, [organization, projects, user?.role]);

  const projectNames = useMemo(
    () => new Map(orgProjects.map((project) => [project.id, project.name])),
    [orgProjects],
  );

  if (!can(PERMISSIONS.TEAM_MANAGE)) {
    return (
      <ScreenFrame>
        <Alert severity="warning">You do not have access to Team.</Alert>
      </ScreenFrame>
    );
  }

  if (session?.source === "api") {
    if (!organization) {
      return (
        <ScreenFrame>
          <Alert severity="warning">This account is not attached to a company yet.</Alert>
        </ScreenFrame>
      );
    }

    return (
      <ScreenFrame>
        <LiveTeamPanel
          companyId={organization.id}
          projects={projects}
          currentUserId={user?.id}
          canManage={canManage}
        />
      </ScreenFrame>
    );
  }

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const save = (values: TeamMemberFormValues) => {
    if (!organization) return;
    setError(null);

    try {
      const input = {
        name: values.name,
        email: values.email,
        role: values.role as RoleName,
        status: values.status,
        productAccess: values.productAccess as ProductModuleAccess[],
      };

      if (editing) {
        updateTeamMember(editing.user.id, input, { actorId: user?.id });
        if (editing.user.id === user?.id) {
          const next = refreshSessionForUser(user.id, currentProject?.id ?? null);
          if (next) setSession(next);
        }
        setBanner(`${values.name} was updated.`);
      } else {
        const created = createTeamMember(organization.id, input);
        setBanner(
          `${created.member.user.name} can sign in with ${created.member.user.email} / ${created.temporaryPassword}`,
        );
      }
      closeDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this teammate.");
    }
  };

  const initial: TeamMemberFormValues | undefined = editing
    ? {
        name: editing.user.name,
        email: editing.user.email,
        role:
          editing.user.role === "SUPER_ADMIN" ? "COMPANY_ADMIN" : editing.user.role,
        status: editing.user.status === "suspended" ? "suspended" : "active",
        productAccess: editing.productAccess ?? [],
      }
    : undefined;

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Workspace"
          title="Team"
          description="Add people and decide which products they can work on — or let them manage a product entirely."
          action={
            canManage ? (
              <Button
                variant="contained"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                Add teammate
              </Button>
            ) : null
          }
        />

        {banner ? <Alert severity="success">{banner}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Paper sx={{ overflow: "auto", borderRadius: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Status</TableCell>
                {canManage ? <TableCell align="right"> </TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{member.user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{ROLE_LABELS[member.user.role]}</TableCell>
                  <TableCell sx={{ maxWidth: 420 }}>
                    <Typography variant="body2">
                      {accessSummary(member, projectNames)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={member.user.status === "active" ? "success" : "default"}
                      label={member.user.status}
                    />
                  </TableCell>
                  {canManage ? (
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => {
                          setEditing(member);
                          setOpen(true);
                        }}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <MemberDialog
        open={open}
        projects={orgProjects}
        initial={initial}
        onClose={closeDialog}
        onSubmit={save}
      />
    </ScreenFrame>
  );
}
