import {
  Article,
  AutoStories,
  Campaign,
  Description,
  OndemandVideo,
  SmartDisplay,
  Theaters,
  ViewCarousel,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";

import type { ContentFormatId } from "./contentFormats";
import type { CreativeConcept } from "../services/content/creativesApi";

export const CONTENT_FORMAT_ICONS: Record<ContentFormatId, SvgIconComponent> = {
  post: Article,
  carousel: ViewCarousel,
  reel: Theaters,
  short: SmartDisplay,
  video: OndemandVideo,
  story: AutoStories,
  campaign: Campaign,
  blog: Description,
};

/** post/carousel/reel/video are the only formats a concept's own shape can
 * distinguish (no `format` field is returned on CreativeConceptPublic) --
 * story/short/campaign/blog concepts render with the generic post icon. */
export function inferConceptFormat(concept: CreativeConcept): ContentFormatId {
  if (concept.carousel_slides?.length) return "carousel";
  if (concept.reel_script || concept.assets?.some((asset) => asset.kind === "video")) return "reel";
  return "post";
}
