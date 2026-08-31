import type { CompanyBrandProfile } from "../../types/onboarding";

export const INDUSTRIES = [
  "Insurance",
  "Beauty & Personal Care",
  "Healthcare",
  "Education",
  "Real Estate",
  "Finance",
  "Retail",
  "D2C",
  "SaaS",
  "NGO",
  "Food & Beverage",
  "Travel",
  "Business Services",
  "Other",
];

export const ANALYSIS_STAGES = [
  "Reading website",
  "Finding logo and colours",
  "Understanding products and services",
  "Identifying audience",
  "Preparing brand voice",
  "Checking social links",
];

export const SOCIALS = [
  { id: "instagram", api: "instagram", label: "Instagram" },
  { id: "facebook", api: "facebook", label: "Facebook" },
  { id: "linkedin", api: "linkedin", label: "LinkedIn" },
  { id: "youtube", api: "youtube", label: "YouTube" },
  { id: "x", api: "twitter", label: "X" },
  { id: "google_business", api: "google", label: "Google Business Profile" },
];

export function emptyProfile(name: string, category = "General"): CompanyBrandProfile {
  return {
    name,
    category,
    market: "India",
    audience_primary: "",
    audience_secondary: "",
    tone: [],
    languages: ["en"],
    voice: "",
    tagline: "",
    description: "",
    website_url: "",
    visual_identity: { palette: [], style_keywords: [], avoid: [] },
    compliance_mandatory_disclaimer: "",
    compliance_secondary_disclaimers: [],
    compliance_banned_claims: [],
    compliance_rules: [],
    cta_bank: [],
    hashtag_bank: [],
    product_lines: [],
  };
}
