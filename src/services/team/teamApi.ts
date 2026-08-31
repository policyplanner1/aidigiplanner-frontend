import { apiClient } from "../api/client";
import type {
  ApiCompanyMember,
  ApiCompanyMemberStatus,
  ApiCompanyRole,
  ApiProductMember,
  ApiProductMemberRole,
} from "../../types/api";

export const teamApi = {
  listMembers(companyId: string) {
    return apiClient.get<ApiCompanyMember[]>(`/companies/${companyId}/members`);
  },

  addMember(
    companyId: string,
    input: {
      email: string;
      full_name?: string | null;
      role: ApiCompanyRole;
    },
  ) {
    return apiClient.post<ApiCompanyMember>(`/companies/${companyId}/members`, input);
  },

  updateMember(
    companyId: string,
    memberId: string,
    input: {
      role?: ApiCompanyRole | null;
      status?: ApiCompanyMemberStatus | null;
    },
  ) {
    return apiClient.patch<ApiCompanyMember>(
      `/companies/${companyId}/members/${memberId}`,
      input,
    );
  },

  removeMember(companyId: string, memberId: string) {
    return apiClient.delete(`/companies/${companyId}/members/${memberId}`);
  },

  // Real live routes are /products/{id}/... — aidigiplanner-backend has no
  // /projects/{id}/members route at all (that module was renamed to
  // "products"; the old path 404s).
  listProductMembers(productId: string) {
    return apiClient.get<ApiProductMember[]>(`/products/${productId}/members`);
  },

  // Adds an existing company member (already has a user_id) to a product.
  addProductMember(
    productId: string,
    input: { user_id: string; role: ApiProductMemberRole; sub_product_ids?: string[] },
  ) {
    return apiClient.post<ApiProductMember>(`/products/${productId}/members`, input);
  },

  // Invites someone by email who may not have an account yet — creates the
  // user (and their CompanyMember row) if needed, per companies/provisioning.py.
  inviteProductMember(
    productId: string,
    input: { email: string; full_name?: string; role: ApiProductMemberRole; sub_product_ids?: string[] },
  ) {
    return apiClient.post<ApiProductMember>(`/products/${productId}/invitations`, input);
  },

  removeProductMember(productId: string, memberId: string) {
    return apiClient.delete(`/products/${productId}/members/${memberId}`, {
      validateStatus: (status) => status === 204 || status === 200,
    });
  },
};
