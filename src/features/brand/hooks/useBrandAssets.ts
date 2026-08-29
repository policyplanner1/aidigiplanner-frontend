import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../../hooks/useAuth";
import {
  brandAssetKey,
  brandProfileKey,
  getBrandAsset,
  uploadBrandAsset,
  type BrandAssetKind,
} from "../../../services/brand/brandProfileApi";

export function useBrandAsset(projectId: string | undefined, kind: BrandAssetKind) {
  const { session } = useAuth();
  const live = session?.source === "api";
  const query = useQuery({
    queryKey: brandAssetKey(projectId ?? "", kind),
    queryFn: () => getBrandAsset(projectId as string, kind, live),
    enabled: Boolean(projectId),
  });

  useEffect(() => {
    const url = query.data;
    return () => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [query.data]);

  return query;
}

export function useUploadBrandAsset(projectId: string, kind: BrandAssetKind) {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const live = session?.source === "api";

  return useMutation({
    mutationFn: (file: File) => uploadBrandAsset(projectId, kind, file, live),
    onSuccess: async (url) => {
      if (url) {
        queryClient.setQueryData(brandAssetKey(projectId, kind), url);
      } else {
        await queryClient.invalidateQueries({ queryKey: brandAssetKey(projectId, kind) });
      }
      await queryClient.invalidateQueries({ queryKey: brandProfileKey(projectId) });
    },
  });
}
