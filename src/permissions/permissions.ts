export const PERMISSIONS = {
  BRANDS_VIEW: "brands.view",
  BRANDS_MANAGE: "brands.manage",

  SOCIAL_VIEW: "social.view",
  SOCIAL_CONNECT: "social.connect",
  SOCIAL_PUBLISH: "social.publish",

  CONTENT_VIEW: "content.view",
  CONTENT_CREATE: "content.create",
  CONTENT_EDIT: "content.edit",
  CONTENT_APPROVE: "content.approve",
  CONTENT_PUBLISH: "content.publish",

  CAMPAIGN_VIEW: "campaign.view",
  CAMPAIGN_MANAGE: "campaign.manage",

  AGENTS_VIEW: "agents.view",
  AGENTS_MANAGE: "agents.manage",

  LEADS_VIEW: "leads.view",
  LEADS_CREATE: "leads.create",
  LEADS_MANAGE: "leads.manage",

  CRM_VIEW: "crm.view",
  CRM_MANAGE: "crm.manage",

  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_EXPORT: "analytics.export",
  CROSS_NETWORK_VIEW: "cross_network.view",

  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",

  INTEGRATIONS_VIEW: "integrations.view",
  BILLING_VIEW: "billing.view",
  SETTINGS_VIEW: "settings.view",

  PLATFORM_ORGANIZATIONS_VIEW: "platform.organizations.view",
  PLATFORM_USERS_VIEW: "platform.users.view",
  PLATFORM_BILLING_VIEW: "platform.billing.view",
  PLATFORM_USAGE_VIEW: "platform.usage.view",
  PLATFORM_SETTINGS_VIEW: "platform.settings.view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  permissions: string[],
  permission: string,
): boolean {
  return permissions.includes("*") || permissions.includes(permission);
}
