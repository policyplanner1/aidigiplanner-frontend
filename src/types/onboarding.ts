export type BrandStructure = "single_brand" | "multi_brand" | "unsure";

export type OnboardingStep =
  | "registered"
  | "email_verified"
  | "brand_structure_selected"
  | "brand_profile_completed"
  | "first_product_created"
  | "completed";

export type BrandingMode = "use_company_branding" | "separate_brand";

export type SubProductBrandingMode = "use_product_branding" | "separate_brand";

export type ApprovalPolicy =
  | "no_approval"
  | "one_approver"
  | "product_manager_approval"
  | "company_admin_approval";

export type ProductInviteRole = "creator" | "approver" | "publisher" | "analyst" | "product_manager";

export type ApiOnboardingStatus = {
  onboarding_step?: OnboardingStep | string;
  brand_structure?: BrandStructure | null;
  product_count?: number;
  sub_product_count?: number;
  social_account_count?: number;
  team_member_count?: number;
  company_name?: string;
  [key: string]: unknown;
};

export type ApiProductPublic = {
  id: string;
  company_id: string;
  name: string;
  slug?: string;
  description?: string | null;
  status?: string;
  branding_mode?: BrandingMode | string;
  approval_policy?: ApprovalPolicy | string;
  created_at?: string;
  updated_at?: string;
};

export type ApiSubProductPublic = {
  id: string;
  product_id?: string;
  name: string;
  status?: string;
  branding_mode?: SubProductBrandingMode | string;
};

export type PatchProductInput = {
  name?: string;
  description?: string | null;
  status?: "active" | "archived";
  branding_mode?: BrandingMode;
  approval_policy?: ApprovalPolicy;
};

export type PatchSubProductInput = {
  name?: string;
  status?: "active" | "archived";
  branding_mode?: SubProductBrandingMode;
};

export type ApiSocialAccountPublic = {
  id: string;
  product_id?: string;
  project_id?: string;
  platform: string;
  handle: string;
  profile_url?: string | null;
  status?: string;
  scope?: string;
  added_by?: string;
  created_at?: string;
};

export type CompanyBrandProfile = {
  name: string;
  category: string;
  market: string;
  audience_primary: string;
  audience_secondary?: string;
  tone?: string[];
  languages?: string[];
  voice?: string;
  tagline?: string;
  description?: string;
  contact_email?: string;
  contact_number?: string;
  social_links?: Record<string, string>;
  regulatory_category?: string;
  website_url?: string | null;
  visual_identity?: {
    palette?: string[];
    heading_font?: string;
    body_font?: string;
    style_keywords?: string[];
    avoid?: string[];
  };
  compliance_mandatory_disclaimer?: string;
  compliance_secondary_disclaimers?: string[];
  compliance_banned_claims?: string[];
  compliance_rules?: string[];
  cta_bank?: string[];
  hashtag_bank?: string[];
  product_lines?: Array<{
    id: string;
    label: string;
    partners?: string[];
    hooks?: string[];
  }>;
  [key: string]: unknown;
};

export type ProductDashboard = {
  drafts?: number;
  pending_approvals?: number;
  scheduled?: number;
  published?: number;
  failed_jobs?: number;
  social_accounts?: number;
  [key: string]: unknown;
};
