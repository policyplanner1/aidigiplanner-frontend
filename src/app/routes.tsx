import { createBrowserRouter, Navigate } from "react-router-dom";

import {
  AuthGuard,
  GuestGuard,
  LegacyBrandKitRedirect,
  LegacyProductRedirect,
  OnboardingGuard,
  OrganizationRoute,
  RootRedirect,
  RoleGuard,
} from "./guards/AuthGuards";
import { PlaceholderPage } from "../components/common/PlaceholderPage";
import { LoginPage } from "../features/auth/pages/Login";
import { PendingApprovalPage } from "../features/auth/pages/PendingApproval";
import { SignupPage } from "../features/auth/pages/Signup";
import { SuperAdminLoginPage } from "../features/auth/pages/SuperAdminLogin";
import { ChangePasswordPage } from "../features/auth/pages/ChangePassword";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPassword";
import { ResetPasswordPage } from "../features/auth/pages/ResetPassword";
import { AcceptInvitationPage } from "../features/auth/pages/AcceptInvitation";
import { PrivacyPolicyPage } from "../features/auth/pages/PrivacyPolicy";
import { TermsPage } from "../features/auth/pages/Terms";
import { VerifyEmailPage } from "../features/auth/pages/VerifyEmail";
import { CompanyStructurePage } from "../features/onboarding/pages/CompanyStructure";
import { CompanyProfilePage } from "../features/onboarding/pages/CompanyProfile";
import { BrandAnalysisPage } from "../features/onboarding/pages/BrandAnalysis";
import { BrandReviewPage } from "../features/onboarding/pages/BrandReview";
import { OnboardingProductsPage } from "../features/onboarding/pages/Products";
import { SubProductsPage } from "../features/onboarding/pages/SubProducts";
import { OnboardingSocialAccountsPage } from "../features/onboarding/pages/SocialAccounts";
import { OnboardingTeamPage } from "../features/onboarding/pages/Team";
import { OnboardingCompletedPage } from "../features/onboarding/pages/Completed";
import { BrandProfilePage } from "../features/brand/pages/BrandProfile";
import { BrandProfileWorkspacePage } from "../features/brand/pages/BrandProfileWorkspace";
import { ContentListPage } from "../features/content/pages/ContentList";
import { ContentEditorPage } from "../features/content/pages/ContentEditor";
import { NotificationsPage } from "../features/notifications/pages/Notifications";
// Not backed by the API yet (no AI Agents module in aidigiplanner-backend) — see routes below.
// import { AgentsPage } from "../features/agents/pages/Agents";
import { ContentCalendarPage } from "../features/content/pages/ContentCalendar";
import { ContentStudioPage } from "../features/content/pages/ContentStudio";
// Not backed by the API yet (no CRM module in aidigiplanner-backend) — see routes below.
// import { CrmPage } from "../features/crm/pages/Crm";
import { Dashboard } from "../features/dashboard/pages/Dashboard";
// Not backed by the API yet (no Leads module in aidigiplanner-backend) — see routes below.
// import { LeadsPage } from "../features/leads/pages/Leads";
import { ProjectDetailsPage } from "../features/projects/pages/ProjectDetails";
import { ProjectsPage } from "../features/projects/pages/Projects";
import { ContentApprovalsPage } from "../features/social/pages/ContentApprovals";
// Brand Library (spec §40) has no backend asset-storage module — real, mock-backed
// feature (localStorage), not a disabled stub. MediaLibrary.tsx (a different,
// post-activity-gallery concept) stays unrouted — see the note at its import below.
import { BrandLibraryPage } from "../features/social/pages/BrandLibrary";
// Not backed by the API yet, and superseded in intent by BrandLibraryPage above.
// import { MediaLibraryPage } from "../features/social/pages/MediaLibrary";
import { SocialAccountsPage } from "../features/social/pages/SocialAccounts";
import { SocialOAuthCallbackPage } from "../features/social/pages/SocialOAuthCallback";
// Analytics (spec §26/§37) has no backend module — real, mock-backed feature with an
// explicit "sample data" banner, not a disabled stub (see the page components).
import { SocialAnalyticsPage } from "../features/social/pages/SocialAnalytics";
import { ProfilePerformancePage } from "../features/cross-network/pages/ProfilePerformance";
import { PostPerformancePage } from "../features/cross-network/pages/PostPerformance";
// Campaigns have no backend entity (deliberately removed from aidigiplanner-backend)
// — this is a real, mock-backed feature (localStorage), not a disabled stub.
import { SocialCampaignsPage } from "../features/social/pages/SocialCampaigns";
import { CampaignDetailPage } from "../features/social/pages/CampaignDetail";
// Not backed by the API yet (backend social accounts are manual-entry only, no inbox).
// import { SocialInboxPage } from "../features/social/pages/SocialInbox";
import { SuperAdminDashboard } from "../features/super-admin/pages/SuperAdminDashboard";
import { OrganizationsPage } from "../features/super-admin/pages/Organizations";
import { CompanyDetailPage } from "../features/super-admin/pages/CompanyDetail";
import { AiProvidersPage } from "../features/super-admin/pages/AiProviders";
import { UsagePage } from "../features/super-admin/pages/Usage";
import { SocialIntegrationsPage } from "../features/super-admin/pages/SocialIntegrations";
import { TemplatesPage } from "../features/super-admin/pages/Templates";
import { ReportsPage } from "../features/super-admin/pages/Reports";
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
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
          { path: "/register", element: <SignupPage /> },
          { path: "/signup", element: <Navigate to="/register" replace /> },
          { path: "/admin/login", element: <SuperAdminLoginPage /> },
          { path: "/verify-email", element: <VerifyEmailPage /> },
          { path: "/registered", element: <VerifyEmailPage /> },
          { path: "/accept-invitation/:token", element: <AcceptInvitationPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
      { path: "/terms", element: <TermsPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      { path: "/pending", element: <PendingApprovalPage /> },
      {
        element: <OnboardingLayout />,
        children: [
          {
            path: "/onboarding",
            element: <OnboardingGuard />,
            children: [
              { index: true, element: <Navigate to="company-structure" replace /> },
              { path: "company-structure", element: <CompanyStructurePage /> },
              { path: "company-profile", element: <CompanyProfilePage /> },
              { path: "brand-analysis", element: <BrandAnalysisPage /> },
              { path: "brand-review", element: <BrandReviewPage /> },
              { path: "products", element: <OnboardingProductsPage /> },
              { path: "sub-products", element: <SubProductsPage /> },
              { path: "social-accounts", element: <OnboardingSocialAccountsPage /> },
              { path: "team", element: <OnboardingTeamPage /> },
              { path: "completed", element: <OnboardingCompletedPage /> },
            ],
          },
        ],
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
              { path: "products", element: <ProjectsPage /> },
              { path: "products/:projectId", element: <ProjectDetailsPage /> },
              // Legacy path kept as a redirect — spec §50 calls this "/app/products".
              { path: "projects", element: <Navigate to="/app/products" replace /> },
              { path: "projects/:projectId", element: <LegacyProductRedirect /> },
              { path: "brand-profile", element: <BrandProfilePage /> },
              { path: "brand-profile/:projectId", element: <BrandProfileWorkspacePage /> },
              // Legacy path kept as a redirect — was renamed from "Brand Kit" to "Brand Profile".
              { path: "brand-kit", element: <Navigate to="/app/brand-profile" replace /> },
              { path: "brand-kit/:projectId", element: <LegacyBrandKitRedirect /> },
              {
                path: "brands",
                element: <Navigate to="/app/products" replace />,
              },
              { path: "social-accounts", element: <SocialAccountsPage /> },
              { path: "social-accounts/oauth/callback", element: <SocialOAuthCallbackPage /> },
              { path: "create", element: <ContentStudioPage /> },
              { path: "content", element: <ContentListPage /> },
              { path: "content/:contentId", element: <ContentEditorPage /> },
              { path: "calendar", element: <ContentCalendarPage /> },
              // Not backed by the API yet (no social inbox module in aidigiplanner-backend)
              // — page kept on disk, route disabled.
              // { path: "social/inbox", element: <SocialInboxPage /> },
              { path: "approvals", element: <ContentApprovalsPage /> },
              { path: "campaigns", element: <SocialCampaignsPage /> },
              { path: "campaigns/:campaignId", element: <CampaignDetailPage /> },
              { path: "analytics", element: <SocialAnalyticsPage /> },
              { path: "cross-network/profile-performance", element: <ProfilePerformancePage /> },
              { path: "cross-network/post-performance", element: <PostPerformancePage /> },
              { path: "brand-library", element: <BrandLibraryPage /> },
              // Not backed by the API yet (no AI Agents, Leads, or CRM module in aidigiplanner-backend).
              // { path: "ai-agents", element: <AgentsPage /> },
              // {
              //   path: "ai-agents/runs",
              //   element: <PlaceholderPage title="Agent Runs" />,
              // },
              // { path: "leads/discover", element: <LeadsPage /> },
              // { path: "leads", element: <LeadsPage /> },
              // {
              //   path: "leads/campaigns",
              //   element: <PlaceholderPage title="Lead Campaigns" />,
              // },
              // { path: "crm", element: <CrmPage /> },
              { path: "team", element: <TeamPage /> },
              { path: "notifications", element: <NotificationsPage /> },
              // Not backed by the API yet (no integrations module in aidigiplanner-backend).
              // {
              //   path: "integrations",
              //   element: <PlaceholderPage title="Integrations" />,
              // },
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
        element: <RoleGuard allow={["SUPER_ADMIN"]} />,
        children: [
          {
            path: "/super-admin",
            element: <SuperAdminLayout />,
            children: [
              { index: true, element: <SuperAdminDashboard /> },
              {
                path: "companies",
                element: <OrganizationsPage />,
              },
              {
                path: "companies/:companyId",
                element: <CompanyDetailPage />,
              },
              // Legacy path kept as a redirect — spec §19 calls this "/super-admin/companies".
              {
                path: "organizations",
                element: <Navigate to="/super-admin/companies" replace />,
              },
              { path: "users", element: <UsersPage /> },
              // Subscriptions/plans/billing stay placeholders on purpose — there's no
              // subscription/plan model on the backend at all, and inventing fake plan
              // tiers/limits here would be actively misleading (unlike Campaigns/Brand
              // Library/Templates, which wrap a real local object even though the
              // backend doesn't persist it).
              {
                path: "subscriptions",
                element: <PlaceholderPage title="Subscriptions" />,
              },
              { path: "plans", element: <PlaceholderPage title="Plans" /> },
              { path: "billing", element: <PlaceholderPage title="Billing" /> },
              { path: "ai-providers", element: <AiProvidersPage /> },
              { path: "usage", element: <UsagePage /> },
              // Legacy paths kept as redirects.
              { path: "ai-usage", element: <Navigate to="/super-admin/usage" replace /> },
              { path: "api-usage", element: <Navigate to="/super-admin/usage" replace /> },
              { path: "social-integrations", element: <SocialIntegrationsPage /> },
              { path: "templates", element: <TemplatesPage /> },
              { path: "reports", element: <ReportsPage /> },
              {
                path: "integrations",
                element: <Navigate to="/super-admin/social-integrations" replace />,
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
