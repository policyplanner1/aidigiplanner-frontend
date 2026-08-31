import { Add } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AnimatedSearchField } from "../../../components/ui/AnimatedSearchField";
import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import { emptyBrandProfileForm, getBrandProfileForm, getBrandProfileScore, type BrandProfileForm } from "../../../services/brand/brandProfileService";
import { createProject, getSocialAccounts } from "../../../services/projects/projectService";
import { AddProjectDialog } from "../../projects/components/AddProjectDialog";
import {
  useCompanyProjects,
  useCreateCompanyProject,
} from "../../projects/hooks/useCompanyProjects";
import type { ProjectFormValues } from "../../projects/schemas/projectSchema";
import { BrandProjectCard } from "../components/BrandProjectCard";
import { useBrandProfiles } from "../hooks/useBrandProfile";

const statusFilters = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
] as const;

export function BrandProfilePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { can } = usePermissions();
  const { organization, projects: workspaceProjects, setCurrentProjectId } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statusFilters)[number]["id"]>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const canManage = can(PERMISSIONS.PRODUCT_CREATE);
  const live = session?.source === "api";
  const listed = useCompanyProjects(organization?.id, live);
  const createLiveProject = useCreateCompanyProject(organization?.id ?? "");
  const projects = live ? (listed.data ?? workspaceProjects) : workspaceProjects;
  const liveProfiles = useBrandProfiles(
    projects.map((project) => ({ id: project.id, name: project.name })),
    live,
  );

  const profileByProject = useMemo(() => {
    const map = new Map<string, BrandProfileForm>();
    projects.forEach((project, index) => {
      map.set(project.id, liveProfiles[index]?.data ?? (live ? emptyBrandProfileForm(project.id) : getBrandProfileForm(project.id, project.name)));
    });
    return map;
  }, [liveProfiles, projects]);

  const visible = useMemo(() => {
    return projects.filter((project) => {
      const profile = profileByProject.get(project.id) ?? (live ? emptyBrandProfileForm(project.id) : getBrandProfileForm(project.id, project.name));
      const haystack = `${project.name} ${project.industry} ${project.description} ${profile.websiteUrl} ${profile.domains}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesStatus = status === "all" || project.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [profileByProject, live, projects, query, status]);

  const openProfile = (projectId: string) => {
    setCurrentProjectId(projectId);
    navigate(`/app/brand-profile/${projectId}`);
  };

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
        openProfile(created.id);
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
    setDialogOpen(false);
    openProfile(project.id);
  };

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        {createError && !dialogOpen ? <Alert severity="error">{createError}</Alert> : null}
        <PageHeader
          eyebrow={`${organization?.name ?? "Organization"} · Brand board`}
          title="Brand Profile"
          description="Manage your brands, projects, and marketing identity. Each profile stays inside its own project so voices never mix."
          action={
            canManage ? (
              <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                Add project
              </Button>
            ) : null
          }
          stats={[
            { label: "Projects", value: projects.length },
            { label: "Active", value: projects.filter((item) => item.status === "active").length },
            { label: "Profiles ready", value: projects.filter((item) => getBrandProfileScore(profileByProject.get(item.id) ?? (live ? emptyBrandProfileForm(item.id) : getBrandProfileForm(item.id, item.name))) === 100).length },
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
          <AnimatedSearchField
            value={query}
            onChange={setQuery}
            aria-label="Search projects"
            phrases={["projects", "a brand name", "a domain"]}
          />
          <CapsuleFilter items={statusFilters} value={status} onChange={setStatus} />
        </Box>

        {live && listed.isLoading && !listed.data ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : visible.length === 0 ? (
          <Box sx={{ ...GLASS_SX, p: 4, borderRadius: 1, textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700 }}>No projects match</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {projects.length === 0
                ? "Create a project first. Each one gets its own brand profile, domain, and social accounts."
                : "Try another search or status."}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            {visible.map((project) => {
              const profile = profileByProject.get(project.id) ?? (live ? emptyBrandProfileForm(project.id) : getBrandProfileForm(project.id, project.name));
              return (
                <BrandProjectCard
                  key={project.id}
                  project={project}
                  profile={profile}
                  accounts={getSocialAccounts(project.id)}
                  score={getBrandProfileScore(profile)}
                  onManage={() => openProfile(project.id)}
                />
              );
            })}
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
      </Box>
    </ScreenFrame>
  );
}
