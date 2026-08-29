export const CONTENT_FORMATS = [
  {
    id: "post",
    label: "Post",
    hint: "Feed update with caption",
    platforms: ["Instagram", "Facebook", "LinkedIn", "Google Business"],
  },
  {
    id: "carousel",
    label: "Carousel",
    hint: "Swipeable slides",
    platforms: ["Instagram", "Facebook", "LinkedIn"],
  },
  {
    id: "reel",
    label: "Reel",
    hint: "Short vertical clip",
    platforms: ["Instagram", "Facebook"],
  },
  {
    id: "short",
    label: "Short",
    hint: "YouTube / TikTok clip",
    platforms: ["YouTube", "TikTok"],
  },
  {
    id: "video",
    label: "Video",
    hint: "Long-form video",
    platforms: ["YouTube", "Facebook", "LinkedIn"],
  },
  {
    id: "story",
    label: "Story",
    hint: "24-hour frames",
    platforms: ["Instagram", "Facebook"],
  },
  {
    id: "campaign",
    label: "Campaign",
    hint: "Multi-piece campaign brief",
    platforms: ["Instagram", "Facebook", "LinkedIn", "YouTube"],
  },
  {
    id: "blog",
    label: "Blog",
    hint: "Article or LinkedIn post",
    platforms: ["LinkedIn", "Blog"],
  },
] as const;

export type ContentFormatId = (typeof CONTENT_FORMATS)[number]["id"];

export function getContentFormat(id: ContentFormatId) {
  return CONTENT_FORMATS.find((item) => item.id === id) ?? CONTENT_FORMATS[0];
}

export function platformsForFormats(ids: readonly ContentFormatId[]) {
  return Array.from(new Set(ids.flatMap((id) => getContentFormat(id).platforms)));
}
