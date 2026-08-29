import type { SocialPlatform } from "../types/organization";

export const SOCIAL_PLATFORMS: {
  id: SocialPlatform;
  label: string;
  description: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    description: "Posts, Reels, and Stories",
  },
  {
    id: "facebook",
    label: "Facebook",
    description: "Pages and organic posts",
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Videos and channel publishing",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Company page updates",
  },
  {
    id: "google_business",
    label: "Google Business Profile",
    description: "Local posts, offers, and updates",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Lead follow-up and conversations",
  },
  {
    id: "x",
    label: "X",
    description: "Posts and conversations",
  },
  {
    id: "threads",
    label: "Threads",
    description: "Text-first conversation posts",
  },
];
