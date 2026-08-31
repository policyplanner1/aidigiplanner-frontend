import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { AccessDeniedPage } from "../../components/common/AccessDeniedPage";
import { useAuth, useAuthHydrated } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useWorkspace } from "../../hooks/useWorkspace";
import { isLiveAuth } from "../../services/api/errors";
import { postAuthPath, roleHomePath } from "../../services/auth/mapSession";
import { onboardingApi } from "../../services/onboarding/onboardingApi";
import { maxReachableStepIndex, onboardingStepIndex, resumeStepForStatus } from "../../features/onboarding/steps";
import type { RoleName } from "../../types/auth";

function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export function RootRedirect() {
  const hydrated = useAuthHydrated();
  const { session } = useAuth();

  if (!hydrated) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate to={postAuthPath(session)} replace />
  );
}

// Redirects a legacy /app/projects/:projectId deep link to the current
// /app/products/:projectId path, preserving the id.
export function LegacyProductRedirect() {
  const { projectId } = useParams();
  return <Navigate to={`/app/products/${projectId ?? ""}`} replace />;
}

// Redirects a legacy /app/brand-kit/:projectId deep link to the current
// /app/brand-profile/:projectId path, preserving the id.
export function LegacyBrandKitRedirect() {
  const { projectId } = useParams();
  return <Navigate to={`/app/brand-profile/${projectId ?? ""}`} replace />;
}

// Redirects an already-authenticated user away from guest-only screens
// (login, register, forgot-password, ...).
export function GuestGuard() {
  const hydrated = useAuthHydrated();
  const { session } = useAuth();

  if (!hydrated) {
    return <LoadingScreen />;
  }

  if (session) {
    return <Navigate to={postAuthPath(session)} replace />;
  }

  return <Outlet />;
}

// Requires a signed-in session; otherwise sends the user to the right login
// screen for the section they were trying to reach.
export function AuthGuard() {
  const hydrated = useAuthHydrated();
  const { session } = useAuth();
  const location = useLocation();

  if (!hydrated) {
    return <LoadingScreen />;
  }

  if (!session) {
    const to = location.pathname.startsWith("/super-admin")
      ? "/admin/login"
      : "/login";

    return <Navigate to={to} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

// Restricts a route subtree to specific roles (spec §49) — shows a proper
// "you do not have access" screen instead of a silent redirect.
export function RoleGuard({ allow }: { allow: RoleName[] }) {
  const { user } = useAuth();

  if (!user || !allow.includes(user.role)) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
}

// Restricts a route subtree to users holding at least one of the given
// permissions (spec §3, §49) — permissions drive access, not the role name.
export function PermissionGuard({ anyOf }: { anyOf: string[] }) {
  const { can } = usePermissions();

  if (!anyOf.some((permission) => can(permission))) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
}

// aidigiplanner-backend has no subscription/billing model yet, so this is a
// pass-through today. Wire the real check here once subscription state exists
// instead of inventing fake plan/limit data in the frontend.
export function SubscriptionGuard() {
  return <Outlet />;
}

// Verifies the signed-in user actually has access to the :productId in the
// route before rendering a product-scoped page.
export function ProductAccessGuard() {
  const { productId } = useParams();
  const { projects } = useWorkspace();

  if (productId && !projects.some((project) => project.id === productId)) {
    return <AccessDeniedPage description="You don't have access to this product." />;
  }

  return <Outlet />;
}

// Redirects a Super Admin away from the organization app shell, blocks
// suspended/unapproved companies, and keeps a Company Admin inside the
// onboarding flow until it's complete.
export function OrganizationRoute() {
  const { isSuperAdmin, session } = useAuth();

  if (isSuperAdmin) {
    return <Navigate to="/super-admin" replace />;
  }

  if (session?.companyStatus && session.companyStatus !== "active") {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
}

// Guards the /onboarding/* route subtree: sends a user who has already
// finished onboarding to the dashboard, and a user who tries to jump ahead of
// their real progress back to the step they should resume at. Going back to
// an earlier step is always allowed.
export function OnboardingGuard() {
  const { session } = useAuth();
  const location = useLocation();
  const companyId = session?.organizationId;
  const live = isLiveAuth() && session?.source === "api";

  const onboarding = useQuery({
    queryKey: ["onboarding", companyId],
    queryFn: async () => (await onboardingApi.getOnboarding(companyId as string)).data,
    enabled: live && Boolean(companyId),
    retry: false,
  });

  if (onboarding.isLoading) {
    return <LoadingScreen />;
  }

  const resumeStep = resumeStepForStatus(onboarding.data?.onboarding_step);

  if (resumeStep === "completed") {
    return <Navigate to={session ? roleHomePath(session) : "/app/dashboard"} replace />;
  }

  const currentSegment = location.pathname.split("/")[2];
  const currentIndex = onboardingStepIndex(currentSegment);
  const maxIndex = maxReachableStepIndex(onboarding.data?.onboarding_step);

  if (!currentSegment || currentIndex > maxIndex) {
    return <Navigate to={`/onboarding/${resumeStep}`} replace />;
  }

  return <Outlet />;
}
