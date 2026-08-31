import { useQuery } from "@tanstack/react-query";

import { onboardingApi } from "../../services/onboarding/onboardingApi";
import type { ApiProjectPublic } from "../../types/api";

// The onboarding steps after product creation (sub-products, social accounts,
// team) don't carry the just-created product id forward through router state
// (a page refresh would lose it) — they resolve it independently by asking the
// company for its most recently created product, which is always correct
// during first-time onboarding (exactly one product exists at this point).
export function useLatestOnboardingProduct(companyId: string) {
  const query = useQuery({
    queryKey: ["onboarding-products", companyId],
    queryFn: () => onboardingApi.listProducts(companyId),
    enabled: Boolean(companyId),
  });

  const product: ApiProjectPublic | undefined = [...(query.data ?? [])].sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  )[0];

  return { product, isLoading: query.isLoading, refetch: query.refetch };
}
