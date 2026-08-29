import { toAuthError } from "../api/errors";
import { authApi, companiesApi } from "./authApi";
import {
  mapAccessProjects,
  mapApiProjects,
  mapMeToSession,
} from "./mapSession";
import { useAuthStore } from "../../store/authStore";
import type { AuthSession } from "../../types/auth";
import type { Project } from "../../types/organization";

export type LiveAuthResult = {
  session: AuthSession;
  accessToken: string;
  refreshToken: string;
  projects: Project[];
};

async function sessionFromTokens(
  accessToken: string,
  refreshToken: string,
  extras?: { companyId?: string | null },
): Promise<LiveAuthResult> {
  const me = await authApi.me();
  const session = mapMeToSession(me.data);
  const organizationId = session.organizationId ?? extras?.companyId ?? null;
  let projects = mapAccessProjects(me.data);

  if (organizationId) {
    try {
      const listed = await companiesApi.listProjects(organizationId);
      projects = mapApiProjects(organizationId, listed?.data);
    } catch {
      // /me project access is enough until the company projects list is available.
    }
  }

  return {
    session: {
      ...session,
      organizationId,
      user: {
        ...session.user,
        organizationId,
      },
      assignedBrandIds: projects.map((project) => project.id),
    },
    accessToken,
    refreshToken,
    projects,
  };
}

export async function loginWithApi(
  email: string,
  password: string,
): Promise<LiveAuthResult> {
  try {
    const tokens = await authApi.login({ email, password });
    useAuthStore.getState().setTokens({
      accessToken: tokens.data.access_token,
      refreshToken: tokens.data.refresh_token,
    });
    return sessionFromTokens(tokens.data.access_token, tokens.data.refresh_token, {
      companyId: tokens.data.company_id,
    });
  } catch (error) {
    toAuthError(error);
  }
}

export async function registerCompanyWithApi(input: {
  companyName: string;
  name: string;
  email: string;
  password: string;
}) {
  try {
    const { data } = await authApi.register({
      email: input.email,
      password: input.password,
      full_name: input.name,
      company_name: input.companyName,
    });
    return data;
  } catch (error) {
    toAuthError(error);
  }
}

export async function refreshLiveSession(): Promise<LiveAuthResult> {
  const { accessToken, refreshToken } = await import("../../store/authStore").then(
    (mod) => mod.useAuthStore.getState(),
  );
  if (!accessToken || !refreshToken) {
    throw new Error("You are not signed in.");
  }
  return sessionFromTokens(accessToken, refreshToken);
}
