import axios from "axios";

import { apiClient } from "../api/client";
import { isLiveAuth } from "../api/errors";
import { listCompanyWorkspaces } from "../onboarding/onboardingApi";
import type {
  ApiMeResponse,
  ApiProjectPublic,
  ApiRegisterResponse,
  ApiTokenPair,
} from "../../types/api";

const MOCK_RESET_OTP = "123456";

function pickResetToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  if (typeof data.reset_token === "string") return data.reset_token;
  if (typeof data.token === "string") return data.token;
  if (data.data && typeof data.data === "object") {
    const inner = data.data as Record<string, unknown>;
    if (typeof inner.reset_token === "string") return inner.reset_token;
    if (typeof inner.token === "string") return inner.token;
  }
  return null;
}

export const authApi = {
  register(input: {
    email: string;
    password: string;
    full_name: string;
    company_name: string;
  }) {
    return apiClient.post<ApiRegisterResponse>("/auth/register", input);
  },

  login(input: { email: string; password: string }) {
    return apiClient.post<ApiTokenPair>("/auth/login", input);
  },

  refresh(refresh_token: string) {
    return apiClient.post<ApiTokenPair>("/auth/refresh", { refresh_token });
  },

  logout(refresh_token: string) {
    return apiClient.post("/auth/logout", { refresh_token });
  },

  me() {
    return apiClient.get<ApiMeResponse>("/auth/me");
  },

  resendVerification(email: string) {
    return apiClient.post("/auth/resend-verification", { email });
  },

  verifyEmail(input: { email: string; otp: string }) {
    return apiClient.post("/auth/verify-email", {
      email: input.email.trim().toLowerCase(),
      otp: input.otp.trim(),
    });
  },

  forgotPassword(email: string) {
    if (!isLiveAuth()) {
      return Promise.resolve({ data: { message: "OTP sent." } });
    }
    return apiClient.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
  },

  async verifyResetOtp(input: { email: string; otp: string }) {
    const email = input.email.trim().toLowerCase();
    const otp = input.otp.trim();
    if (!isLiveAuth()) {
      if (otp !== MOCK_RESET_OTP) {
        throw new Error("Enter the 6-digit code sent to your email.");
      }
      return { resetToken: "mock-reset-token" };
    }
    const { data } = await apiClient.post("/auth/verify-reset-otp", { email, otp });
    return { resetToken: pickResetToken(data) };
  },

  resetPassword(input: {
    email: string;
    otp: string;
    new_password: string;
    reset_token?: string | null;
  }) {
    const body: Record<string, string> = {
      email: input.email.trim().toLowerCase(),
      otp: input.otp.trim(),
      new_password: input.new_password,
    };
    if (input.reset_token) body.reset_token = input.reset_token;
    if (!isLiveAuth()) {
      return Promise.resolve({ data: { message: "Password updated." } });
    }
    return apiClient.post("/auth/reset-password", body);
  },

  changePassword(input: { current_password: string; new_password: string }) {
    if (!isLiveAuth()) {
      return Promise.resolve({ data: { message: "Password updated." } });
    }
    return apiClient.post("/auth/change-password", input);
  },
};

export const companiesApi = {
  async listProjects(companyId: string) {
    const data = await listCompanyWorkspaces(companyId);
    return { data };
  },

  createProject(companyId: string, input: { name: string; description?: string | null }) {
    return apiClient.post<ApiProjectPublic>(`/companies/${companyId}/products`, input).catch((error) => {
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 405)) {
        return apiClient.post<ApiProjectPublic>(`/companies/${companyId}/projects`, input);
      }
      throw error;
    });
  },
};

export const projectsApi = {
  async deleteProject(projectId: string) {
    try {
      return await apiClient.delete(`/products/${projectId}`);
    } catch (error) {
      if (!axios.isAxiosError(error) || (error.response?.status !== 404 && error.response?.status !== 405)) {
        throw error;
      }
      return apiClient.delete(`/projects/${projectId}`);
    }
  },
};
