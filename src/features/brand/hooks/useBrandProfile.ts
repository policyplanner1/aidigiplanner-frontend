import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  liveFormFromProfile,
  formToProfileBody,
  profileToForm,
  saveBrandProfileForm,
  type BrandProfileForm,
} from "../../../services/brand/brandProfileService";
import { brandProfileKey, getBrandProfile, saveBrandProfile } from "../../../services/brand/brandProfileApi";

export function useBrandProfile(projectId: string, _projectName: string, live: boolean) {
  return useQuery({
    queryKey: brandProfileKey(projectId),
    queryFn: async () => {
      const profile = await getBrandProfile(projectId);
      return liveFormFromProfile(projectId, profile);
    },
    enabled: Boolean(projectId) && live,
  });
}

export function useSaveBrandProfile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { form: BrandProfileForm; projectName: string }) => {
      const saved = await saveBrandProfile(projectId, formToProfileBody(input.form, input.projectName));
      const merged = profileToForm(saved, input.form);
      saveBrandProfileForm(merged);
      return merged;
    },
    onSuccess: (form) => {
      queryClient.setQueryData(brandProfileKey(projectId), form);
    },
  });
}

export function useBrandProfiles(
  projects: Array<{ id: string; name: string }>,
  live: boolean,
) {
  return useQueries({
    queries: projects.map((project) => ({
      queryKey: brandProfileKey(project.id),
      queryFn: async () => {
        const profile = await getBrandProfile(project.id);
        return liveFormFromProfile(project.id, profile);
      },
      enabled: live && Boolean(project.id),
    })),
  });
}
