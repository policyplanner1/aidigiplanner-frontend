import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ApiSubProductPublic } from "../types/onboarding";
import type { Project } from "../types/organization";

type OrganizationState = {
  currentBrandId: string | null;
  currentSubProductId: string | null;
  revision: number;
  liveProjects: Project[];
  liveSubProducts: ApiSubProductPublic[];
  setCurrentBrandId: (brandId: string | null) => void;
  setCurrentSubProductId: (subProductId: string | null) => void;
  setLiveProjects: (projects: Project[]) => void;
  setLiveSubProducts: (subProducts: ApiSubProductPublic[]) => void;
  bumpRevision: () => void;
  reset: () => void;
};

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      currentBrandId: null,
      currentSubProductId: null,
      revision: 0,
      liveProjects: [],
      liveSubProducts: [],
      setCurrentBrandId: (brandId) => set({ currentBrandId: brandId, currentSubProductId: null }),
      setCurrentSubProductId: (subProductId) => set({ currentSubProductId: subProductId }),
      setLiveProjects: (projects) => set({ liveProjects: projects }),
      setLiveSubProducts: (subProducts) => set({ liveSubProducts: subProducts }),
      bumpRevision: () => set((state) => ({ revision: state.revision + 1 })),
      reset: () => set({ currentBrandId: null, currentSubProductId: null, liveProjects: [], liveSubProducts: [] }),
    }),
    {
      name: "ai-growth-organization",
      partialize: (state) => ({
        currentBrandId: state.currentBrandId,
        currentSubProductId: state.currentSubProductId,
      }),
    },
  ),
);
