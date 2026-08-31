import {
  AutoAwesome,
  // Campaign, ContactPage: only used by the disabled Leads/CRM module cards below.
  Share,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { KpiTile } from "../../dashboard/components/KpiTile";
import { SOCIAL_PLATFORMS } from "../../../constants/platforms";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import { deleteProject, getSocialAccounts } from "../../../services/projects/projectService";
import { DeleteProjectDialog } from "../components/DeleteProjectDialog";
import { ProductSettingsPanel } from "../components/ProductSettingsPanel";
import { ProjectTeamPanel } from "../components/ProjectTeamPanel";
import { useDeleteCompanyProject } from "../hooks/useCompanyProjects";
import { getProjectPulse } from "../projectPulse";
import { useSocialAccounts } from "../../social/hooks/useSocialAccounts";

type ProjectTab = "overview" | "social" | "marketing" | "leads" | "crm" | "team";

export function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { organization, projects, subProducts, setCurrentProjectId } = useWorkspace();
  const { can } = usePermissions();
  const [tab, setTab] = useState<ProjectTab>("overview");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const canManage = can(PERMISSIONS.PRODUCT_DELETE);
  const live = session?.source === "api";
  const deleteLiveProject = useDeleteCompanyProject(organization?.id ?? "");

  const project = projects.find((item) => item.id === projectId) ?? null;
  const liveAccounts = useSocialAccounts(live ? project?.id : undefined);
  const accounts = live ? (liveAccounts.data ?? []) : project ? getSocialAccounts(project.id) : [];

  const tabs: { id: ProjectTab; label: string }[] = [
    { id: "overview", label: "Overview" },
  ];
  if (project?.modules.social) tabs.push({ id: "social", label: "Social accounts" });
  if (project?.modules.marketing) tabs.push({ id: "marketing", label: "Marketing" });
  // No Leads/CRM module in aidigiplanner-backend yet — see constants/navigation.ts.
  // if (project?.modules.leads) tabs.push({ id: "leads", label: "Lead generation" });
  // if (project?.modules.crm) tabs.push({ id: "crm", label: "CRM" });
  tabs.push({ id: "team", label: "Team" });

  if (!projectId || !project) {
    return <Navigate to="/app/products" replace />;
  }

  const connected = accounts.filter((account) => account.status === "connected");
  const pulse = getProjectPulse(project.id);

  const handleDelete = async () => {
    setDeleteError(null);
    if (live) {
      try {
        await deleteLiveProject.mutateAsync(project.id);
        setConfirmDelete(false);
        navigate("/app/products");
      } catch (error) {
        setDeleteError(getApiErrorMessage(error));
      }
      return;
    }

    const remaining = projects.filter((item) => item.id !== project.id);
    deleteProject(project.id);
    setCurrentProjectId(remaining[0]?.id ?? null);
    setConfirmDelete(false);
    navigate("/app/products");
  };

  return (
    <ScreenFrame>
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <PageHeader
        eyebrow={project.industry || "Workspace"}
        title={project.name}
        description={project.description || "Social, content, leads, and CRM stay inside this workspace."}
        action={
          <>
            {project.modules.marketing ? (
              <Button variant="contained" onClick={() => navigate("/app/create")}>
                Create content
              </Button>
            ) : null}
            {canManage ? (
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setDeleteError(null);
                  setConfirmDelete(true);
                }}
              >
                Delete
              </Button>
            ) : null}
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={(_event, value: ProjectTab) => setTab(value)}
        variant="scrollable"
        sx={{
          minHeight: 44,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 700, minHeight: 44 },
        }}
      >
        {tabs.map((item) => (
          <Tab key={item.id} value={item.id} label={item.label} />
        ))}
      </Tabs>

      {tab === "overview" ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            }}
          >
            <KpiTile label="Channels" value={String(pulse.connected)} hint="Connected" delay={40} />
            <KpiTile label="Scheduled" value={String(pulse.scheduled)} hint="This week" delay={80} />
            <KpiTile label="Inbox" value={String(pulse.inbox)} hint="Open messages" delay={120} />
            <KpiTile label="Leads" value={String(pulse.leads)} hint="New + qualified" delay={160} />
          </Box>
          {live ? (
            <ProductSettingsPanel
              companyId={organization?.id ?? session?.organizationId ?? ""}
              productId={project.id}
              name={project.name}
              description={project.description}
              live={live}
              subProducts={subProducts}
            />
          ) : null}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
          {project.modules.social ? (
            <ModuleCard
              icon={<Share />}
              title="Social media"
              body={`${connected.length} connected account${connected.length === 1 ? "" : "s"}`}
              action="Manage accounts"
              onClick={() => setTab("social")}
            />
          ) : null}
          {project.modules.marketing ? (
            <ModuleCard
              icon={<AutoAwesome />}
              title="Digital marketing"
              body="AI content, captions, creatives, and campaigns"
              action="Open marketing"
              onClick={() => setTab("marketing")}
            />
          ) : null}
          {/* No Leads/CRM module in aidigiplanner-backend yet — see constants/navigation.ts.
          {project.modules.leads ? (
            <ModuleCard
              icon={<Campaign />}
              title="Lead generation"
              body="Discovery, enrichment, scoring, and outreach"
              action="Open leads"
              onClick={() => setTab("leads")}
            />
          ) : null}
          {project.modules.crm ? (
            <ModuleCard
              icon={<ContactPage />}
              title="CRM"
              body="Contacts, companies, deals, and pipeline"
              action="Open CRM"
              onClick={() => setTab("crm")}
            />
          ) : null}
          */}
          </Box>
        </Box>
      ) : null}

      {tab === "social" ? (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography color="text.secondary">
              Connect the accounts this project is allowed to publish to.
            </Typography>
            {can(PERMISSIONS.SOCIAL_MANAGE) ? (
              <Button
                variant="contained"
                onClick={() => {
                  setCurrentProjectId(project.id);
                  navigate("/app/social-accounts");
                }}
              >
                Manage accounts
              </Button>
            ) : null}
          </Box>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            {SOCIAL_PLATFORMS.map((platform) => {
              const account = accounts.find(
                (item) => item.platform === platform.id && item.status === "connected",
              );

              return (
                <Card key={platform.id}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          {platform.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {account?.accountName ?? platform.description}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={account ? "success" : "default"}
                        label={account ? "Connected" : "Not connected"}
                      />
                    </Box>
                    {account && can(PERMISSIONS.SOCIAL_MANAGE) ? (
                      <Button
                        sx={{ mt: 2 }}
                        onClick={() => {
                          setCurrentProjectId(project.id);
                          navigate("/app/social-accounts");
                        }}
                      >
                        Manage
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      ) : null}

      {tab === "marketing" ? (
        <ComingModule
          title="AI content studio"
          body="Create posts, reels, shorts, videos, and blogs from this project's brand voice, then schedule or send for approval."
          action="Open content studio"
          onClick={() => navigate("/app/create")}
        />
      ) : null}

      {/* No Leads/CRM module in aidigiplanner-backend yet — see constants/navigation.ts.
      {tab === "leads" ? (
        <ComingModule
          title="Lead engine"
          body="Discover, enrich, score, and follow up with leads for this project only."
          action="Open lead discovery"
          onClick={() => navigate("/app/leads/discover")}
        />
      ) : null}

      {tab === "crm" ? (
        <ComingModule
          title="CRM pipeline"
          body="Contacts, companies, deals, and activities stay inside this project so teams do not mix client data."
          action="Open CRM"
          onClick={() => navigate("/app/crm")}
        />
      ) : null}
      */}

      {tab === "team" ? (
        <ProjectTeamPanel
          projectId={project.id}
          companyId={organization?.id ?? session?.organizationId}
          live={session?.source === "api"}
          canManage={can(PERMISSIONS.TEAM_MANAGE)}
        />
      ) : null}
    </Box>
    <DeleteProjectDialog
      open={confirmDelete}
      projectName={project.name}
      busy={deleteLiveProject.isPending}
      error={deleteError}
      onClose={() => {
        if (!deleteLiveProject.isPending) {
          setConfirmDelete(false);
          setDeleteError(null);
        }
      }}
      onConfirm={() => void handleDelete()}
    />
    </ScreenFrame>
  );
}

function ModuleCard({
  icon,
  title,
  body,
  action,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        animation: "dashIn 0.45s ease both",
        "@keyframes dashIn": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 24px rgba(74, 52, 44, 0.08)",
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography color="text.secondary">{body}</Typography>
        <Button sx={{ mt: 2 }} onClick={onClick}>
          {action}
        </Button>
      </CardContent>
    </Card>
  );
}

function ComingModule({
  title,
  body,
  action,
  onClick,
}: {
  title: string;
  body: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        This module is scoped to the current project. Full workflows come next.
      </Alert>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {body}
          </Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={onClick}>
            {action}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
