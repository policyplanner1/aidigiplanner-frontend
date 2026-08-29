import { Campaign, ErrorOutlined, FolderOutlined, InboxOutlined, ScheduleOutlined, ShareOutlined } from "@mui/icons-material";
import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import { createProject } from "../../../services/projects/projectService";
import { AddProjectDialog } from "../../projects/components/AddProjectDialog";
import {
  useCompanyProjects,
  useCreateCompanyProject,
} from "../../projects/hooks/useCompanyProjects";
import type { ProjectFormValues } from "../../projects/schemas/projectSchema";
import { AttentionPanels } from "../components/AttentionPanels";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardSection } from "../components/DashboardSection";
import { FeatureSnapshotGrid } from "../components/FeatureSnapshotGrid";
import { KpiTile } from "../components/KpiTile";
import {
  formatDashboardDate,
  getDashboardSnapshot,
  greetingForNow,
} from "../dashboardData";
import { dashboardCount, useProductDashboard } from "../hooks/useProductDashboard";

export function Dashboard() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { can } = usePermissions();
  const { organization, projects, currentProject, setCurrentProjectId } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const canManage = can(PERMISSIONS.BRANDS_MANAGE);
  const live = session?.source === "api";
  useCompanyProjects(organization?.id, live);
  const createLiveProject = useCreateCompanyProject(organization?.id ?? "");

  const snapshot = useMemo(
    () => getDashboardSnapshot(projects, currentProject?.id ?? null),
    [projects, currentProject?.id],
  );
  const liveDash = useProductDashboard(currentProject?.id, live);

  const drafts = liveDash.data ? dashboardCount(liveDash.data, "drafts") : 0;
  const pending = liveDash.data ? dashboardCount(liveDash.data, "pending_approvals") : snapshot.inReview;
  const scheduled = liveDash.data ? dashboardCount(liveDash.data, "scheduled") : snapshot.scheduled;
  const published = liveDash.data ? dashboardCount(liveDash.data, "published") : snapshot.published;
  const failed = liveDash.data ? dashboardCount(liveDash.data, "failed_jobs") : 0;
  const socials = liveDash.data ? dashboardCount(liveDash.data, "social_accounts") : snapshot.connected;

  const visibleSnapshots = snapshot.snapshots.filter((item) => can(item.permission));
  const firstName = user?.name?.split(" ")[0] ?? "there";

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
        navigate(`/app/projects/${created.id}`);
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
    navigate(`/app/projects/${project.id}`);
  };

  const open = (path: string) => navigate(path);

  return (
    <ScreenFrame>
    <Box sx={{ display: "grid", gap: 3.25 }}>
      <DashboardHero
        greeting={greetingForNow()}
        name={firstName}
        organization={organization?.name ?? "Your organization"}
        projectName={currentProject?.name ?? "No project selected"}
        dateLabel={formatDashboardDate()}
        scheduled={scheduled}
        openInbox={snapshot.openInbox}
        inReview={pending}
        trend={snapshot.analytics.trend}
        canCreateProject={canManage}
        showInbox={can(PERMISSIONS.SOCIAL_VIEW)}
        showStudio={can(PERMISSIONS.CONTENT_VIEW)}
        onCreateProject={() => setDialogOpen(true)}
        onCreateContent={() => open("/app/social/content")}
        onOpenInbox={() => open("/app/social/inbox")}
        onOpenAnalytics={() => open("/app/social/analytics")}
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
        }}
      >
        <KpiTile
          label="Drafts"
          value={String(drafts)}
          hint="Not submitted yet"
          accent="#FF6B45"
          icon={<FolderOutlined sx={{ fontSize: 16 }} />}
          delay={40}
          onClick={() => open("/app/social/calendar")}
        />
        <KpiTile
          label="Pending approvals"
          value={String(pending)}
          hint="Waiting for review"
          accent="#E8A838"
          icon={<InboxOutlined sx={{ fontSize: 16 }} />}
          delay={80}
          onClick={() => open("/app/social/approvals")}
        />
        <KpiTile
          label="Scheduled posts"
          value={String(scheduled)}
          hint="Ready to go live"
          accent="#1F8A80"
          icon={<ScheduleOutlined sx={{ fontSize: 16 }} />}
          delay={120}
          onClick={() => open("/app/social/calendar")}
        />
        <KpiTile
          label="Published posts"
          value={String(published)}
          hint={currentProject?.name ?? "This product"}
          accent="#7C5CFC"
          icon={<Campaign sx={{ fontSize: 16 }} />}
          delay={160}
          onClick={() => open("/app/social/analytics")}
        />
        <KpiTile
          label="Failed posts"
          value={String(failed)}
          hint="Needs a retry"
          accent="#C45C4A"
          icon={<ErrorOutlined sx={{ fontSize: 16 }} />}
          delay={200}
          onClick={() => open("/app/social/calendar")}
        />
        <KpiTile
          label="Social accounts"
          value={String(socials)}
          hint="Connected"
          accent="#176E66"
          icon={<ShareOutlined sx={{ fontSize: 16 }} />}
          delay={240}
          onClick={() => open("/app/social/accounts")}
        />
      </Box>

      <Box>
        <DashboardSection
          eyebrow="Modules"
          title="Every workspace at a glance"
          description="Short status for each feature. Click any tile to jump in."
        />
        <FeatureSnapshotGrid items={visibleSnapshots} onOpen={open} />
      </Box>

      <AttentionPanels
        attention={snapshot.attention}
        weekPosts={snapshot.weekPosts}
        onOpen={open}
      />

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
