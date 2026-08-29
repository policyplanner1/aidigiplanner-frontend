import { createBrowserRouter, Navigate } from "react-router-dom";

import {
  GuestRoute,
  OrganizationRoute,
  ProtectedRoute,
  RootRedirect,
  SuperAdminRoute,
} from "./guards/AuthGuards";
import { PlaceholderPage } from "../components/common/PlaceholderPage";
import { LoginPage } from "../features/auth/pages/Login";
import { PendingApprovalPage } from "../features/auth/pages/PendingApproval";
import { SignupPage } from "../features/auth/pages/Signup";
import { SuperAdminLoginPage } from "../features/auth/pages/SuperAdminLogin";
import { ChangePasswordPage } from "../features/auth/pages/ChangePassword";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPassword";
import { VerifyEmailPage } from "../features/auth/pages/VerifyEmail";
import { OnboardingWizard } from "../features/onboarding/pages/OnboardingWizard";
import { BrandKitPage } from "../features/brand/pages/BrandKit";
import { BrandKitWorkspacePage } from "../features/brand/pages/BrandKitWorkspace";
import { AgentsPage } from "../features/agents/pages/Agents";
import { ContentCalendarPage } from "../features/content/pages/ContentCalendar";
import { ContentStudioPage } from "../features/content/pages/ContentStudio";
import { CrmPage } from "../features/crm/pages/Crm";
import { Dashboard } from "../features/dashboard/pages/Dashboard";
import { LeadsPage } from "../features/leads/pages/Leads";
import { ProjectDetailsPage } from "../features/projects/pages/ProjectDetails";
import { ProjectsPage } from "../features/projects/pages/Projects";
import { ContentApprovalsPage } from "../features/social/pages/ContentApprovals";
import { MediaLibraryPage } from "../features/social/pages/MediaLibrary";
import { SocialAccountsPage } from "../features/social/pages/SocialAccounts";
import { SocialOAuthCallbackPage } from "../features/social/pages/SocialOAuthCallback";
import { SocialAnalyticsPage } from "../features/social/pages/SocialAnalytics";
import { ProfilePerformancePage } from "../features/cross-network/pages/ProfilePerformance";
import { PostPerformancePage } from "../features/cross-network/pages/PostPerformance";
import { SocialCampaignsPage } from "../features/social/pages/SocialCampaigns";
import { SocialInboxPage } from "../features/social/pages/SocialInbox";
import { SuperAdminDashboard } from "../features/super-admin/pages/SuperAdminDashboard";
import { OrganizationsPage } from "../features/super-admin/pages/Organizations";
import { AuditLogsPage } from "../features/super-admin/pages/AuditLogs";
import { UsersPage } from "../features/super-admin/pages/Users";
import { TeamPage } from "../features/team/pages/Team";
import { AuthLayout } from "../layouts/AuthLayout";
import { OnboardingLayout } from "../layouts/OnboardingLayout";
import { OrganizationLayout } from "../layouts/OrganizationLayout";
import { SuperAdminLayout } from "../layouts/SuperAdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/signup", element: <SignupPage /> },
          { path: "/admin/login", element: <SuperAdminLoginPage /> },
          { path: "/verify-email", element: <VerifyEmailPage /> },
          { path: "/registered", element: <VerifyEmailPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/pending", element: <PendingApprovalPage /> },
      {
        element: <OnboardingLayout />,
        children: [{ path: "/onboarding", element: <OnboardingWizard /> }],
      },
      {
        element: <OrganizationRoute />,
        children: [
          {
            path: "/app",
            element: <OrganizationLayout />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <Dashboard /> },
              { path: "projects", element: <ProjectsPage /> },
              { path: "projects/:projectId", element: <ProjectDetailsPage /> },
              { path: "brand-kit", element: <BrandKitPage /> },
              { path: "brand-kit/:projectId", element: <BrandKitWorkspacePage /> },
              {
                path: "brands",
                element: <Navigate to="/app/projects" replace />,
              },
              {
                path: "products",
                element: <Navigate to="/app/projects" replace />,
              },
              { path: "social/accounts", element: <SocialAccountsPage /> },
              { path: "social/oauth/callback", element: <SocialOAuthCallbackPage /> },
              { path: "social/content", element: <ContentStudioPage /> },
              { path: "social/calendar", element: <ContentCalendarPage /> },
              { path: "social/inbox", element: <SocialInboxPage /> },
              { path: "social/approvals", element: <ContentApprovalsPage /> },
              { path: "social/campaigns", element: <SocialCampaignsPage /> },
              { path: "social/analytics", element: <SocialAnalyticsPage /> },
              { path: "cross-network/profile-performance", element: <ProfilePerformancePage /> },
              { path: "cross-network/post-performance", element: <PostPerformancePage /> },
              { path: "social/media", element: <MediaLibraryPage /> },
              { path: "ai-agents", element: <AgentsPage /> },
              {
                path: "ai-agents/runs",
                element: <PlaceholderPage title="Agent Runs" />,
              },
              { path: "leads/discover", element: <LeadsPage /> },
              { path: "leads", element: <LeadsPage /> },
              {
                path: "leads/campaigns",
                element: <PlaceholderPage title="Lead Campaigns" />,
              },
              { path: "crm", element: <CrmPage /> },
              { path: "team", element: <TeamPage /> },
              {
                path: "integrations",
                element: <PlaceholderPage title="Integrations" />,
              },
              { path: "billing", element: <PlaceholderPage title="Billing" /> },
              {
                path: "settings",
                element: <ChangePasswordPage />,
              },
            ],
          },
        ],
      },
      {
        element: <SuperAdminRoute />,
        children: [
          {
            path: "/super-admin",
            element: <SuperAdminLayout />,
            children: [
              { index: true, element: <SuperAdminDashboard /> },
              {
                path: "organizations",
                element: <OrganizationsPage />,
              },
              { path: "users", element: <UsersPage /> },
              {
                path: "subscriptions",
                element: <PlaceholderPage title="Subscriptions" />,
              },
              { path: "plans", element: <PlaceholderPage title="Plans" /> },
              { path: "billing", element: <PlaceholderPage title="Billing" /> },
              {
                path: "ai-usage",
                element: <PlaceholderPage title="AI Usage" />,
              },
              {
                path: "api-usage",
                element: <PlaceholderPage title="API Usage" />,
              },
              {
                path: "integrations",
                element: <PlaceholderPage title="Integrations" />,
              },
              {
                path: "settings",
                element: <ChangePasswordPage />,
              },
              {
                path: "audit-logs",
                element: <AuditLogsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <RootRedirect />,
  },
]);
