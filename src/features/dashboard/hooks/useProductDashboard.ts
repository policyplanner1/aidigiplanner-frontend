import { useQuery } from "@tanstack/react-query";

import { onboardingApi } from "../../../services/onboarding/onboardingApi";
import type { ProductDashboard } from "../../../types/onboarding";

export function useProductDashboard(productId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["product-dashboard", productId],
    queryFn: async () => {
      const { data } = await onboardingApi.getProductDashboard(productId as string);
      return data;
    },
    enabled: Boolean(productId) && enabled,
    retry: false,
  });
}

export function dashboardCount(data: ProductDashboard | undefined, key: keyof ProductDashboard) {
  const value = data?.[key];
  return typeof value === "number" ? value : 0;
}
