import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { companiesApi, projectsApi } from "../../../services/auth/authApi";
import { mapApiProjects } from "../../../services/auth/mapSession";
import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import { useOrganizationStore } from "../../../store/organizationStore";
import type { PatchProductInput, PatchSubProductInput } from "../../../types/onboarding";

export function companyProjectsKey(companyId: string) {
  return ["company-projects", companyId] as const;
}

export function useCompanyProjects(companyId: string | undefined, enabled: boolean) {
  const setLiveProjects = useOrganizationStore((state) => state.setLiveProjects);

  const query = useQuery({
    queryKey: companyProjectsKey(companyId ?? ""),
    queryFn: async () => {
      const { data } = await companiesApi.listProjects(companyId as string);
      return mapApiProjects(companyId as string, data);
    },
    enabled: Boolean(companyId) && enabled,
  });

  useEffect(() => {
    if (query.data) setLiveProjects(query.data);
  }, [query.data, setLiveProjects]);

  return query;
}

export function useProductSubProducts(productId: string | undefined, enabled: boolean) {
  const setLiveSubProducts = useOrganizationStore((state) => state.setLiveSubProducts);

  const query = useQuery({
    queryKey: ["product-sub-products", productId],
    queryFn: async () => {
      const { data } = await onboardingApi.listSubProducts(productId as string);
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(productId) && enabled,
  });

  useEffect(() => {
    setLiveSubProducts(query.data ?? []);
  }, [query.data, setLiveSubProducts]);

  return query;
}

export function usePatchProduct(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { productId: string } & PatchProductInput) => {
      const { productId, ...body } = input;
      const { data } = await onboardingApi.patchProduct(productId, body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyProjectsKey(companyId) });
    },
  });
}

export function usePatchSubProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { subProductId: string } & PatchSubProductInput) => {
      const { subProductId, ...body } = input;
      const { data } = await onboardingApi.patchSubProduct(subProductId, body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["product-sub-products", productId] });
    },
  });
}

export function useDeleteSubProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subProductId: string) => {
      await onboardingApi.deleteSubProduct(subProductId);
      return subProductId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["product-sub-products", productId] });
    },
  });
}

export function useCreateCompanyProject(companyId: string) {
  const queryClient = useQueryClient();
  const setLiveProjects = useOrganizationStore((state) => state.setLiveProjects);
  const setCurrentBrandId = useOrganizationStore((state) => state.setCurrentBrandId);

  return useMutation({
    mutationFn: async (input: { name: string; description?: string | null }) => {
      const { data } = await companiesApi.createProject(companyId, input);
      return data;
    },
    onSuccess: (created) => {
      const mapped = mapApiProjects(companyId, [created])[0];
      const current = useOrganizationStore.getState().liveProjects;
      if (!current.some((project) => project.id === mapped.id)) {
        setLiveProjects([...current, mapped]);
      }
      setCurrentBrandId(mapped.id);
      void queryClient.invalidateQueries({ queryKey: companyProjectsKey(companyId) });
    },
  });
}

export function useDeleteCompanyProject(companyId: string) {
  const queryClient = useQueryClient();
  const setLiveProjects = useOrganizationStore((state) => state.setLiveProjects);
  const setCurrentBrandId = useOrganizationStore((state) => state.setCurrentBrandId);

  return useMutation({
    mutationFn: async (projectId: string) => {
      await projectsApi.deleteProject(projectId);
      return projectId;
    },
    onSuccess: (projectId) => {
      const current = useOrganizationStore.getState().liveProjects;
      const next = current.filter((project) => project.id !== projectId);
      setLiveProjects(next);
      if (useOrganizationStore.getState().currentBrandId === projectId) {
        setCurrentBrandId(next[0]?.id ?? null);
      }
      void queryClient.invalidateQueries({ queryKey: companyProjectsKey(companyId) });
    },
  });
}
