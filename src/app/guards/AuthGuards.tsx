import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useAuth, useAuthHydrated } from "../../hooks/useAuth";
import { isLiveAuth } from "../../services/api/errors";
import { postAuthPath } from "../../services/auth/mapSession";
import { onboardingApi } from "../../services/onboarding/onboardingApi";

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

export function GuestRoute() {
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

export function ProtectedRoute() {
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

export function SuperAdminRoute() {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}

export function OrganizationRoute() {
  const { isSuperAdmin, session } = useAuth();
  const companyId = session?.organizationId;
  const live = isLiveAuth() && session?.source === "api";
  const onboarding = useQuery({
    queryKey: ["onboarding", companyId],
    queryFn: async () => (await onboardingApi.getOnboarding(companyId as string)).data,
    enabled: live && Boolean(companyId) && !isSuperAdmin,
    retry: false,
  });

  if (isSuperAdmin) {
    return <Navigate to="/super-admin" replace />;
  }

  if (session?.companyStatus && session.companyStatus !== "active") {
    return <Navigate to="/pending" replace />;
  }

  if (onboarding.isLoading) {
    return <LoadingScreen />;
  }

  const step = onboarding.data?.onboarding_step;
  if (step && step !== "completed") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
