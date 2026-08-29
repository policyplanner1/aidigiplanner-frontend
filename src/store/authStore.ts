import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthSession } from "../types/auth";

type AuthState = {
  session: AuthSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: AuthSession | null) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string } | null) => void;
  setAuth: (input: {
    session: AuthSession;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      accessToken: null,
      refreshToken: null,
      setSession: (session) => set({ session }),
      setTokens: (tokens) =>
        set({
          accessToken: tokens?.accessToken ?? null,
          refreshToken: tokens?.refreshToken ?? null,
        }),
      setAuth: ({ session, accessToken, refreshToken }) =>
        set({ session, accessToken, refreshToken }),
      logout: () => set({ session: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "ai-growth-auth",
      partialize: (state) => ({
        session: state.session,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
