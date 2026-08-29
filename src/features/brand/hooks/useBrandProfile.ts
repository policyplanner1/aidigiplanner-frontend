import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  liveKitFromProfile,
  kitToProfileBody,
  profileToKit,
  saveBrandKit,
  type BrandKit,
} from "../../../services/brand/brandKitService";
import { brandProfileKey, getBrandProfile, saveBrandProfile } from "../../../services/brand/brandProfileApi";

export function useBrandProfile(projectId: string, _projectName: string, live: boolean) {
  return useQuery({
    queryKey: brandProfileKey(projectId),
    queryFn: async () => {
      const profile = await getBrandProfile(projectId);
      return liveKitFromProfile(projectId, profile);
    },
    enabled: Boolean(projectId) && live,
  });
}

export function useSaveBrandProfile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { kit: BrandKit; projectName: string }) => {
      const saved = await saveBrandProfile(projectId, kitToProfileBody(input.kit, input.projectName));
      const merged = profileToKit(saved, input.kit);
      saveBrandKit(merged);
      return merged;
    },
    onSuccess: (kit) => {
      queryClient.setQueryData(brandProfileKey(projectId), kit);
    },
  });
}

export function useBrandKits(
  projects: Array<{ id: string; name: string }>,
  live: boolean,
) {
  return useQueries({
    queries: projects.map((project) => ({
      queryKey: brandProfileKey(project.id),
      queryFn: async () => {
        const profile = await getBrandProfile(project.id);
        return liveKitFromProfile(project.id, profile);
      },
      enabled: live && Boolean(project.id),
    })),
  });
}
