export function isLiveSocialApi(): boolean {
  return import.meta.env.VITE_SOCIAL_API === "true";
}

export function oauthReturnUrl(): string {
  return `${window.location.origin}/app/social/oauth/callback`;
}

export function followAuthorizationUrl(
  url: string,
  navigate: (path: string) => void,
) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    window.location.assign(url);
    return;
  }
  navigate(url);
}
