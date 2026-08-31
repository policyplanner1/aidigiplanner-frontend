export const PERMISSIONS = {
  COMPANY_VIEW: "company.view",
  COMPANY_MANAGE: "company.manage",

  PRODUCT_VIEW: "product.view",
  PRODUCT_CREATE: "product.create",
  PRODUCT_EDIT: "product.edit",
  PRODUCT_DELETE: "product.delete",

  SUBPRODUCT_MANAGE: "subproduct.manage",

  TEAM_MANAGE: "team.manage",

  CONTENT_CREATE: "content.create",
  CONTENT_EDIT: "content.edit",
  CONTENT_DELETE: "content.delete",
  CONTENT_APPROVE: "content.approve",
  CONTENT_PUBLISH: "content.publish",

  SOCIAL_MANAGE: "social.manage",
  CAMPAIGN_MANAGE: "campaign.manage",
  ANALYTICS_VIEW: "analytics.view",
  BILLING_MANAGE: "billing.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  permissions: string[],
  permission: string,
): boolean {
  return permissions.includes("*") || permissions.includes(permission);
}
