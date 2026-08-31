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
import { AiRecommendationsPanel, AttentionPanels, TopPerformingPanel } from "../components/AttentionPanels";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardSection } from "../components/DashboardSection";
import { FeatureSnapshotGrid } from "../components/FeatureSnapshotGrid";
import { KpiTile } from "../components/KpiTile";
import {
  buildAiRecommendations,
  formatDashboardDate,
  getDashboardSnapshot,
  greetingForNow,
  type AttentionItem,
} from "../dashboardData";
import { dashboardCount, useProductDashboard } from "../hooks/useProductDashboard";

export function Dashboard() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { can } = usePermissions();
  const { organization, projects, currentProject, setCurrentProjectId } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const canManage = can(PERMISSIONS.PRODUCT_CREATE);
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
  const socials = liveDash.data ? dashboardCount(liveDash.data, "social_accounts_total") : snapshot.connected;

  const attentionItems: AttentionItem[] = liveDash.data
    ? (liveDash.data.pending_approvals_list ?? []).slice(0, 5).map((item) => ({
        id: item.id,
        label: "Waiting approval",
        detail: item.hook,
        path: "/app/approvals",
        tone: "info" as const,
      }))
    : snapshot.attention;

  const topPerforming = liveDash.data
    ? (liveDash.data.top_performing ?? []).map((item) => ({
        id: item.id,
        label: item.hook,
        detail: item.published_at ? new Date(item.published_at).toLocaleDateString() : "Published",
      }))
    : snapshot.weekPosts
        .filter((item) => item.status === "published")
        .map((item) => ({ id: item.id, label: item.title, detail: `${item.day} ${item.time}` }));

  const aiRecommendations = liveDash.data
    ? (liveDash.data.ai_recommendations ?? [])
    : buildAiRecommendations({ drafts, pending, published, socials });

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
        // No inbox module in aidigiplanner-backend yet — see constants/navigation.ts.
        showInbox={false}
        showStudio={can(PERMISSIONS.CONTENT_EDIT)}
        onCreateProject={() => setDialogOpen(true)}
        onCreateContent={() => open("/app/create")}
        onOpenInbox={() => open("/app/social-accounts")}
        onOpenAnalytics={() => open("/app/calendar")}
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
          onClick={() => open("/app/calendar")}
        />
        <KpiTile
          label="Pending approvals"
          value={String(pending)}
          hint="Waiting for review"
          accent="#E8A838"
          icon={<InboxOutlined sx={{ fontSize: 16 }} />}
          delay={80}
          onClick={() => open("/app/approvals")}
        />
        <KpiTile
          label="Scheduled posts"
          value={String(scheduled)}
          hint="Ready to go live"
          accent="#1F8A80"
          icon={<ScheduleOutlined sx={{ fontSize: 16 }} />}
          delay={120}
          onClick={() => open("/app/calendar")}
        />
        <KpiTile
          label="Published posts"
          value={String(published)}
          hint={currentProject?.name ?? "This product"}
          accent="#7C5CFC"
          icon={<Campaign sx={{ fontSize: 16 }} />}
          delay={160}
          onClick={() => open("/app/calendar")}
        />
        <KpiTile
          label="Failed posts"
          value={String(failed)}
          hint="Needs a retry"
          accent="#C45C4A"
          icon={<ErrorOutlined sx={{ fontSize: 16 }} />}
          delay={200}
          onClick={() => open("/app/calendar")}
        />
        <KpiTile
          label="Social accounts"
          value={String(socials)}
          hint="Connected"
          accent="#176E66"
          icon={<ShareOutlined sx={{ fontSize: 16 }} />}
          delay={240}
          onClick={() => open("/app/social-accounts")}
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
        attention={attentionItems}
        weekPosts={snapshot.weekPosts}
        onOpen={open}
      />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
        }}
      >
        <TopPerformingPanel items={topPerforming} onOpen={open} />
        <AiRecommendationsPanel items={aiRecommendations} />
      </Box>

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
