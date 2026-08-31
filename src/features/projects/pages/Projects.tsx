import { Add } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { AnimatedSearchField } from "../../../components/ui/AnimatedSearchField";
import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import { createProject, deleteProject, getSocialAccounts } from "../../../services/projects/projectService";
import type { Project } from "../../../types/organization";
import { AddProjectDialog } from "../components/AddProjectDialog";
import { DeleteProjectDialog } from "../components/DeleteProjectDialog";
import { ProjectCard } from "../components/ProjectCard";
import {
  useCompanyProjects,
  useCreateCompanyProject,
  useDeleteCompanyProject,
} from "../hooks/useCompanyProjects";
import { getProjectPulse, type ProjectPulse } from "../projectPulse";
import type { ProjectFormValues } from "../schemas/projectSchema";

const filters = [
  { id: "all", label: "All" },
  { id: "social", label: "Social" },
  { id: "marketing", label: "Marketing" },
  { id: "leads", label: "Leads" },
  { id: "crm", label: "CRM" },
] as const;

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { can } = usePermissions();
  const { organization, projects: workspaceProjects, currentProject, setCurrentProjectId } =
    useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const canManage = can(PERMISSIONS.PRODUCT_CREATE);
  const live = session?.source === "api";
  const listed = useCompanyProjects(organization?.id, live);
  const createLiveProject = useCreateCompanyProject(organization?.id ?? "");
  const deleteLiveProject = useDeleteCompanyProject(organization?.id ?? "");
  const projects = live ? (listed.data ?? workspaceProjects) : workspaceProjects;

  const pulses = useMemo(() => {
    const next: Record<string, ProjectPulse> = {};
    for (const project of projects) {
      next[project.id] = getProjectPulse(project.id);
    }
    return next;
  }, [projects]);

  const connected = Object.values(pulses).reduce((sum, pulse) => sum + pulse.connected, 0);
  const scheduled = Object.values(pulses).reduce((sum, pulse) => sum + pulse.scheduled, 0);

  const visible = projects.filter((project) => {
    const matchesQuery = `${project.name} ${project.industry} ${project.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "social" && project.modules.social) ||
      (filter === "marketing" && project.modules.marketing) ||
      (filter === "leads" && project.modules.leads) ||
      (filter === "crm" && project.modules.crm);
    return matchesQuery && matchesFilter;
  });

  const handleCreate = async (values: ProjectFormValues) => {
    if (!organization) return;
    setCreateError(null);

    if (live) {
      try {
        const created = await createLiveProject.mutateAsync({
          name: values.name.trim(),
          description: values.description?.trim() || null,
        });
        setDialogOpen(false);
        navigate(`/app/products/${created.id}`);
      } catch (error) {
        setCreateError(getApiErrorMessage(error));
      }
      return;
    }

    const project = createProject({
      organizationId: organization.id,
      name: values.name,
      description: values.description ?? "",
      industry: values.industry ?? "",
      modules: {
        social: values.social,
        marketing: values.marketing,
        leads: values.leads,
        crm: values.crm,
      },
    });

    setCurrentProjectId(project.id);
    setDialogOpen(false);
    navigate(`/app/products/${project.id}`);
  };

  const openProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    navigate(`/app/products/${projectId}`);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteError(null);

    if (live) {
      try {
        await deleteLiveProject.mutateAsync(deleting.id);
        setDeleting(null);
      } catch (error) {
        setDeleteError(getApiErrorMessage(error));
      }
      return;
    }

    const remaining = projects.filter((project) => project.id !== deleting.id);
    deleteProject(deleting.id);
    if (currentProject?.id === deleting.id) {
      setCurrentProjectId(remaining[0]?.id ?? null);
    }
    setDeleting(null);
  };

  return (
    <ScreenFrame>
    <Box sx={{ display: "grid", gap: 2.5 }}>
      {createError && !dialogOpen ? <Alert severity="error">{createError}</Alert> : null}
      {listed.isError ? (
        <Alert severity="error">{getApiErrorMessage(listed.error)}</Alert>
      ) : null}
      <PageHeader
        eyebrow={`${organization?.name ?? "Organization"} · Gallery`}
        title="Projects"
        description={
          user?.role === "COMPANY_ADMIN"
            ? "A board of brand workspaces. Each one keeps social, content, leads, and CRM separate."
            : "Projects assigned to you. Open one to work inside that brand only."
        }
        action={
          canManage ? (
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
              Add project
            </Button>
          ) : null
        }
        stats={[
          { label: "Workspaces", value: projects.length },
          { label: "Channels", value: connected },
          { label: "Scheduled", value: scheduled },
        ]}
      />

      <Box
        sx={{
          ...GLASS_SX,
          p: 1.25,
          borderRadius: 1,
          backgroundColor: SURFACE.well,
          display: "flex",
          gap: 1.25,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <CapsuleFilter items={filters} value={filter} onChange={setFilter} />
        <AnimatedSearchField
          value={query}
          onChange={setQuery}
          aria-label="Search projects"
          phrases={[
            "projects",
            "a workspace name",
            "by industry",
            "a brand board",
          ]}
        />
      </Box>

      {live && listed.isLoading && !listed.data ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : visible.length === 0 && !canManage ? (
        <Box
          sx={{
            ...GLASS_SX,
            p: 4,
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>No projects match</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {projects.length === 0
              ? "No projects are assigned to you yet."
              : "Try another filter or search."}
          </Typography>
        </Box>
      ) : visible.length === 0 && (query.trim() || filter !== "all") ? (
        <Box
          sx={{
            ...GLASS_SX,
            p: 4,
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>No projects match</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Try another filter or search.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
          }}
        >
          {visible.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              accounts={getSocialAccounts(project.id)}
              pulse={pulses[project.id]}
              delay={index * 50}
              active={project.id === currentProject?.id}
              onOpen={() => openProject(project.id)}
              onDelete={
                canManage
                  ? () => {
                      setDeleteError(null);
                      setDeleting(project);
                    }
                  : undefined
              }
            />
          ))}
        </Box>
      )}

      <AddProjectDialog
        open={dialogOpen}
        live={live}
        busy={createLiveProject.isPending}
        error={dialogOpen ? createError : null}
        onClose={() => {
          setDialogOpen(false);
          setCreateError(null);
        }}
        onSubmit={handleCreate}
      />
      <DeleteProjectDialog
        open={Boolean(deleting)}
        projectName={deleting?.name ?? "project"}
        busy={deleteLiveProject.isPending}
        error={deleteError}
        onClose={() => {
          if (!deleteLiveProject.isPending) {
            setDeleting(null);
            setDeleteError(null);
          }
        }}
        onConfirm={() => void handleDelete()}
      />
    </Box>
    </ScreenFrame>
  );
}
