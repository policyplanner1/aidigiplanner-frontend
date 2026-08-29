import axios from "axios";

import { apiClient } from "../api/client";
import type { ApiProjectPublic } from "../../types/api";
import type {
  ApiOnboardingStatus,
  ApiProductPublic,
  ApiSocialAccountPublic,
  ApiSubProductPublic,
  BrandStructure,
  BrandingMode,
  CompanyBrandProfile,
  PatchProductInput,
  PatchSubProductInput,
  ProductDashboard,
  ProductInviteRole,
} from "../../types/onboarding";

function asProject(item: ApiProductPublic | ApiProjectPublic, companyId: string): ApiProjectPublic {
  return {
    id: item.id,
    company_id: "company_id" in item && item.company_id ? item.company_id : companyId,
    name: item.name,
    slug: "slug" in item && item.slug ? item.slug : item.name,
    description: ("description" in item ? item.description : null) ?? null,
    status: ("status" in item && item.status ? item.status : "active") as string,
    created_by: "created_by" in item && typeof item.created_by === "string" ? item.created_by : "",
    created_at: "created_at" in item && item.created_at ? String(item.created_at) : "",
    updated_at: "updated_at" in item && item.updated_at ? String(item.updated_at) : "",
  };
}

async function listCompanyWorkspaces(companyId: string): Promise<ApiProjectPublic[]> {
  try {
    const { data } = await apiClient.get<ApiProductPublic[] | { items?: ApiProductPublic[] }>(
      `/companies/${companyId}/products`,
    );
    const rows = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    return rows.map((item) => asProject(item, companyId));
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
    const { data } = await apiClient.get<ApiProjectPublic[] | { items?: ApiProjectPublic[] }>(
      `/companies/${companyId}/projects`,
    );
    const rows = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    return rows;
  }
}

export const onboardingApi = {
  getOnboarding(companyId: string) {
    return apiClient.get<ApiOnboardingStatus>(`/companies/${companyId}/onboarding`);
  },

  completeOnboarding(companyId: string) {
    return apiClient.post(`/companies/${companyId}/onboarding/complete`);
  },

  setBrandStructure(companyId: string, brand_structure: BrandStructure) {
    return apiClient.patch(`/companies/${companyId}/brand-structure`, { brand_structure });
  },

  setSingleBrandDetails(companyId: string, industry: string) {
    return apiClient.patch(`/companies/${companyId}/single-brand-details`, { industry });
  },

  setGroupProfile(companyId: string, group_website_url?: string) {
    return apiClient.patch(`/companies/${companyId}/group-profile`, {
      group_website_url: group_website_url || undefined,
    });
  },

  uploadGroupLogo(companyId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return apiClient.put(`/companies/${companyId}/group-profile/logo`, form);
  },

  getCompanyBrandProfile(companyId: string) {
    return apiClient.get<CompanyBrandProfile>(`/companies/${companyId}/brand-profile`);
  },

  saveCompanyBrandProfile(companyId: string, body: CompanyBrandProfile) {
    return apiClient.put<CompanyBrandProfile>(`/companies/${companyId}/brand-profile`, body);
  },

  analyzeCompanyBrand(companyId: string, input: { website_url?: string; description?: string; dry_run?: boolean }) {
    return apiClient.post(`/companies/${companyId}/brand-profile/analyze`, input);
  },

  listProducts(companyId: string) {
    return listCompanyWorkspaces(companyId);
  },

  async createProduct(
    companyId: string,
    input: { name: string; description?: string | null; branding_mode?: BrandingMode },
  ) {
    try {
      const { data } = await apiClient.post<ApiProductPublic>(`/companies/${companyId}/products`, input);
      return data;
    } catch (error) {
      if (!axios.isAxiosError(error) || (error.response?.status !== 404 && error.response?.status !== 405)) {
        throw error;
      }
      const { data } = await apiClient.post<ApiProjectPublic>(`/companies/${companyId}/projects`, {
        name: input.name,
        description: input.description ?? null,
      });
      return data as ApiProductPublic;
    }
  },

  getProductBrandProfile(productId: string) {
    return apiClient.get<CompanyBrandProfile>(`/products/${productId}/brand-profile`);
  },

  getEffectiveProductBrand(productId: string) {
    return apiClient.get<CompanyBrandProfile>(`/products/${productId}/brand-profile/effective`);
  },

  saveProductBrandProfile(productId: string, body: CompanyBrandProfile) {
    return apiClient.put<CompanyBrandProfile>(`/products/${productId}/brand-profile`, body);
  },

  analyzeProductBrand(productId: string, input: { website_url?: string; description?: string; dry_run?: boolean }) {
    return apiClient.post(`/products/${productId}/brand-profile/analyze`, input);
  },

  addSubProducts(productId: string, names: string[]) {
    return apiClient.post<ApiSubProductPublic[]>(`/products/${productId}/sub-products`, { names });
  },

  listSubProducts(productId: string) {
    return apiClient.get<ApiSubProductPublic[]>(`/products/${productId}/sub-products`);
  },

  addSocialAccount(
    productId: string,
    input: {
      platform: string;
      handle: string;
      profile_url?: string;
      scope?: "product" | "sub_products" | "company";
    },
  ) {
    return apiClient.post(`/products/${productId}/social-accounts`, input);
  },

  listSocialAccounts(productId: string) {
    return apiClient.get<ApiSocialAccountPublic[] | { items?: ApiSocialAccountPublic[] }>(
      `/products/${productId}/social-accounts`,
    );
  },

  inviteToProduct(
    productId: string,
    input: { email: string; full_name?: string; role: ProductInviteRole; sub_product_ids?: string[] },
  ) {
    return apiClient.post(`/products/${productId}/invitations`, input);
  },

  getProductDashboard(productId: string) {
    return apiClient.get<ProductDashboard>(`/products/${productId}/dashboard`);
  },

  patchProduct(productId: string, input: PatchProductInput) {
    return apiClient.patch<ApiProductPublic>(`/products/${productId}`, input);
  },

  async deleteProduct(productId: string) {
    try {
      return await apiClient.delete(`/products/${productId}`);
    } catch (error) {
      if (!axios.isAxiosError(error) || (error.response?.status !== 404 && error.response?.status !== 405)) {
        throw error;
      }
      return apiClient.delete(`/projects/${productId}`);
    }
  },

  patchSubProduct(subProductId: string, input: PatchSubProductInput) {
    return apiClient.patch<ApiSubProductPublic>(`/sub-products/${subProductId}`, input);
  },

  deleteSubProduct(subProductId: string) {
    return apiClient.delete(`/sub-products/${subProductId}`);
  },

  getSubProductBrandProfile(subProductId: string) {
    return apiClient.get<CompanyBrandProfile>(`/sub-products/${subProductId}/brand-profile`);
  },

  getEffectiveSubProductBrand(subProductId: string) {
    return apiClient.get<CompanyBrandProfile>(`/sub-products/${subProductId}/brand-profile/effective`);
  },

  saveSubProductBrandProfile(subProductId: string, body: CompanyBrandProfile) {
    return apiClient.put<CompanyBrandProfile>(`/sub-products/${subProductId}/brand-profile`, body);
  },

  deleteSocialAccount(productId: string, accountId: string) {
    return apiClient.delete(`/products/${productId}/social-accounts/${accountId}`);
  },
};

export { listCompanyWorkspaces };
