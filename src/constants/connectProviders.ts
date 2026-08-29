import type { ConnectProvider } from "../types/social";
import type { SocialPlatform } from "../types/organization";

export type ConnectProviderOption = {
  id: ConnectProvider;
  label: string;
  description: string;
  platforms: SocialPlatform[];
};

export const CONNECT_PROVIDERS: ConnectProviderOption[] = [
  {
    id: "meta",
    label: "Instagram + Facebook",
    description:
      "One Meta login. Your backend then lists Facebook Pages and linked Instagram professional accounts.",
    platforms: ["facebook", "instagram"],
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Google OAuth. Backend stores credentials and finds the YouTube channel.",
    platforms: ["youtube"],
  },
  {
    id: "google_business",
    label: "Google Business Profile",
    description: "Google OAuth, then pick the business location this project should post to.",
    platforms: ["google_business"],
  },
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    description:
      "Messaging only — lead follow-up, reminders, and conversations. Not used for feed publishing.",
    platforms: ["whatsapp"],
  },
];

export function providerForPlatform(
  platform: SocialPlatform,
): ConnectProvider | null {
  if (platform === "instagram" || platform === "facebook") return "meta";
  if (platform === "youtube") return "youtube";
  if (platform === "google_business") return "google_business";
  if (platform === "whatsapp") return "whatsapp";
  return null;
}

export const OAUTH_RETURN_PATH = "/app/social/oauth/callback";
