import { useCallback, useSyncExternalStore } from "react";

// The app now always talks to the real aidigiplanner-backend API — the mock/demo-data
// auth path (mockAuth.ts) is disabled below and kept only for reference.
// import { isLiveAuth } from "../services/api/errors";
// import {
//   getBrandsForSession,
//   loginWithPassword,
//   seedDemoData,
//   signupOrganization,
// } from "../services/auth/mockAuth";
import {
  loginWithApi,
  refreshLiveSession,
  registerCompanyWithApi,
  type LiveAuthResult,
} from "../services/auth/liveAuth";
import { authApi } from "../services/auth/authApi";
import { postAuthPath } from "../services/auth/mapSession";
import { useAuthStore } from "../store/authStore";
import { useOrganizationStore } from "../store/organizationStore";
// import type { AuthSession } from "../types/auth";

// if (typeof window !== "undefined") {
//   seedDemoData();
// }

export function useAuthHydrated() {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const setAuth = useAuthStore((state) => state.setAuth);
  // const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.logout);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setCurrentBrandId = useOrganizationStore((state) => state.setCurrentBrandId);
  const setLiveProjects = useOrganizationStore((state) => state.setLiveProjects);
  const resetWorkspace = useOrganizationStore((state) => state.reset);

  const applyLive = useCallback(
    (result: LiveAuthResult) => {
      setAuth({
        session: result.session,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      const listedProjects = result.projects ?? [];
      setLiveProjects(listedProjects);

      if (result.session.user.role === "SUPER_ADMIN") {
        resetWorkspace();
        return result.session;
      }

      const currentBrandId = useOrganizationStore.getState().currentBrandId;
      const nextBrandId = listedProjects.some((project) => project.id === currentBrandId)
        ? currentBrandId
        : (listedProjects[0]?.id ?? null);
      setCurrentBrandId(nextBrandId);
      return result.session;
    },
    [resetWorkspace, setAuth, setCurrentBrandId, setLiveProjects],
  );

  // const applyMockSession = useCallback(
  //   (nextSession: AuthSession) => {
  //     setSession(nextSession);
  //
  //     if (nextSession.user.role === "SUPER_ADMIN") {
  //       resetWorkspace();
  //       return;
  //     }
  //
  //     const brands = getBrandsForSession(nextSession);
  //     const currentBrandId = useOrganizationStore.getState().currentBrandId;
  //     const nextBrandId = brands.some((brand) => brand.id === currentBrandId)
  //       ? currentBrandId
  //       : (brands[0]?.id ?? null);
  //
  //     setCurrentBrandId(nextBrandId);
  //   },
  //   [resetWorkspace, setCurrentBrandId, setSession],
  // );

  const login = useCallback(
    async (email: string, password: string) => {
      // if (isLiveAuth()) {
      const result = await loginWithApi(email, password);
      return applyLive(result);
      // }
      //
      // const nextSession = loginWithPassword(email, password);
      // applyMockSession(nextSession);
      // return nextSession;
    },
    [applyLive],
  );

  const signup = useCallback(
    async (input: {
      companyName: string;
      name: string;
      email: string;
      password: string;
    }) => {
      // if (isLiveAuth()) {
      return registerCompanyWithApi(input);
      // }
      //
      // const nextSession = signupOrganization(input);
      // applyMockSession(nextSession);
      // return nextSession;
    },
    [],
  );

  const refreshWorkspace = useCallback(async () => {
    // if (!isLiveAuth()) return session;
    const result = await refreshLiveSession();
    return applyLive(result);
  }, [applyLive]);

  const logout = useCallback(() => {
    // if (isLiveAuth() && refreshToken) {
    if (refreshToken) {
      void authApi.logout(refreshToken).catch(() => undefined);
    }
    clearSession();
    resetWorkspace();
  }, [clearSession, refreshToken, resetWorkspace]);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    isSuperAdmin: session?.user.role === "SUPER_ADMIN",
    companyStatus: session?.companyStatus,
    login,
    signup,
    logout,
    refreshWorkspace,
    postAuthPath,
  };
}
