import { getContentFormat, type ContentFormatId } from "../../constants/contentFormats";
import { useOrganizationStore } from "../../store/organizationStore";

export type PublishStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export type SocialPost = {
  id: string;
  projectId: string;
  campaignId: string | null;
  format: ContentFormatId;
  platform: string;
  title: string;
  caption: string;
  hashtags: string;
  hook: string;
  script: string;
  cta: string;
  day: string;
  time: string;
  status: PublishStatus;
};

export type SocialCampaign = {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  status: "active" | "paused" | "completed";
  start: string;
  end: string;
  // Optional fields from spec §38 — campaigns have no backend entity at all
  // (deliberately removed from aidigiplanner-backend), so this whole feature
  // stays local/mock, same as the rest of this service.
  objective?: string;
  subProductIds?: string[];
  platforms?: string[];
  offer?: string;
  audience?: string;
  postCount?: number;
  frequency?: string;
  occasion?: string;
  cta?: string;
  landingPage?: string;
};

export type InboxReply = {
  id: string;
  author: string;
  text: string;
  time: string;
  fromBrand: boolean;
};

export type InboxItem = {
  id: string;
  projectId: string;
  platform: string;
  type: "comment" | "mention" | "message";
  author: string;
  text: string;
  time: string;
  status: "open" | "replied";
  replies: InboxReply[];
};

export type InternalComment = {
  id: string;
  postId: string;
  author: string;
  initials: string;
  text: string;
  time: string;
};

export type MediaAsset = {
  id: string;
  projectId: string;
  name: string;
  kind: "image" | "video" | "document";
  format: ContentFormatId;
  detail: string;
};

const POSTS_KEY = "ai-growth-social-posts";
const CAMPAIGNS_KEY = "ai-growth-social-campaigns";
const INBOX_KEY = "ai-growth-social-inbox";
const MEDIA_KEY = "ai-growth-social-media";
const COMMENTS_KEY = "ai-growth-social-comments";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T, bump = true) {
  localStorage.setItem(key, JSON.stringify(value));
  if (bump) useOrganizationStore.getState().bumpRevision();
}

function seedPosts(projectId: string): SocialPost[] {
  return [
    {
      id: `${projectId}-p1`,
      projectId,
      campaignId: `${projectId}-camp-1`,
      format: "post",
      platform: "Instagram",
      title: "3 cover myths, explained",
      caption:
        "Myth: health cover is only for hospital stays.\nFact: the right plan also helps with diagnostics and daycare procedures.",
      hashtags: "#HealthCover #FamilyFirst",
      hook: "Stop believing these 3 insurance myths.",
      script: "",
      cta: "Save this post for your next policy review.",
      day: "Mon",
      time: "11:00",
      status: "published",
    },
    {
      id: `${projectId}-p2`,
      projectId,
      campaignId: `${projectId}-camp-1`,
      format: "reel",
      platform: "Instagram",
      title: "60-second claim checklist",
      caption: "A claim is less stressful when the paperwork is ready before you need it.",
      hashtags: "#ClaimsMadeSimple #Reel",
      hook: "If you only save one reel this week, make it this checklist.",
      script:
        "0-3s: Hook on-screen\n3-12s: Documents you need\n12-25s: Who to call\n25-35s: CTA to Brand Profile offer",
      cta: "Follow for weekly policy tips.",
      day: "Wed",
      time: "19:30",
      status: "scheduled",
    },
    {
      id: `${projectId}-p3`,
      projectId,
      campaignId: `${projectId}-camp-2`,
      format: "short",
      platform: "YouTube",
      title: "Short: waiting period in 20s",
      caption: "Waiting periods explained without the jargon.",
      hashtags: "#YouTubeShorts #InsuranceTips",
      hook: "Why did my claim get delayed?",
      script: "Hook → waiting period in plain words → when it does not apply → subscribe CTA.",
      cta: "Subscribe for weekly explainers.",
      day: "Thu",
      time: "18:00",
      status: "in_review",
    },
    {
      id: `${projectId}-p4`,
      projectId,
      campaignId: `${projectId}-camp-2`,
      format: "video",
      platform: "YouTube",
      title: "Planning 101: family cover",
      caption: "A 6-minute walkthrough of what a family floater actually covers.",
      hashtags: "#FamilyCover",
      hook: "What should a family of 4 actually buy?",
      script: "Intro, needs, what to skip, how to compare, close with CTA.",
      cta: "Book a 15-min planning call.",
      day: "Fri",
      time: "10:00",
      status: "draft",
    },
    {
      id: `${projectId}-p5`,
      projectId,
      campaignId: `${projectId}-camp-1`,
      format: "blog",
      platform: "LinkedIn",
      title: "How to pick a health plan in Pune",
      caption:
        "A practical checklist for salaried professionals: network hospitals, waiting periods, and riders worth paying for.",
      hashtags: "#LinkedIn #HealthInsurance",
      hook: "Most people buy the wrong health plan for one quiet reason.",
      script:
        "1. Network hospitals near you\n2. Waiting periods\n3. Room rent caps\n4. Riders that matter\n5. How to review yearly",
      cta: "Download the comparison sheet.",
      day: "Tue",
      time: "09:30",
      status: "scheduled",
    },
    {
      id: `${projectId}-p6`,
      projectId,
      campaignId: `${projectId}-camp-1`,
      format: "post",
      platform: "Facebook",
      title: "Adoption glow-up",
      caption: "What a wonderful story. We love an adoption glow-up!",
      hashtags: "#Community",
      hook: "A glow-up worth sharing.",
      script: "",
      cta: "Read the story.",
      day: "Sat",
      time: "11:09",
      status: "published",
    },
    {
      id: `${projectId}-p7`,
      projectId,
      campaignId: `${projectId}-camp-2`,
      format: "reel",
      platform: "TikTok",
      title: "Easter sale hook",
      caption: "Our upcoming Easter Sale starts with one clear offer.",
      hashtags: "#TikTok",
      hook: "One offer. One week.",
      script: "",
      cta: "Shop the drop.",
      day: "Sun",
      time: "08:45",
      status: "scheduled",
    },
    {
      id: `${projectId}-p8`,
      projectId,
      campaignId: `${projectId}-camp-1`,
      format: "post",
      platform: "Facebook",
      title: "Paw-some surprise",
      caption: "Ready for a paw-some surprise? This week's cover myth is one most families still believe.",
      hashtags: "#FamilyFirst #Education",
      hook: "Ready for a paw-some surprise?",
      script: "",
      cta: "Save this for later.",
      day: "Mon",
      time: "09:48",
      status: "scheduled",
    },
    {
      id: `${projectId}-p9`,
      projectId,
      campaignId: `${projectId}-camp-1`,
      format: "carousel",
      platform: "Instagram",
      title: "Product launch carousel",
      caption: "Three slides. One product. What changed in this year's family floater, in plain words.",
      hashtags: "#Product #Launch",
      hook: "What changed this year?",
      script: "",
      cta: "Swipe through.",
      day: "Tue",
      time: "11:09",
      status: "scheduled",
    },
    {
      id: `${projectId}-p10`,
      projectId,
      campaignId: `${projectId}-camp-2`,
      format: "post",
      platform: "X",
      title: "Waiting period thread",
      caption: "Waiting periods are not a trick. Here is when they apply, and when they do not.",
      hashtags: "#InsuranceTips",
      hook: "Waiting periods, without the jargon.",
      script: "",
      cta: "Read the thread.",
      day: "Wed",
      time: "08:12",
      status: "published",
    },
    {
      id: `${projectId}-p11`,
      projectId,
      campaignId: `${projectId}-camp-1`,
      format: "story",
      platform: "Instagram",
      title: "Story poll",
      caption: "Would you rather a higher deductible or a lower monthly premium?",
      hashtags: "#Stories",
      hook: "Quick poll.",
      script: "",
      cta: "Vote in stories.",
      day: "Wed",
      time: "13:22",
      status: "scheduled",
    },
    {
      id: `${projectId}-p12`,
      projectId,
      campaignId: `${projectId}-camp-1`,
      format: "post",
      platform: "Threads",
      title: "Quiet reminder",
      caption: "A quiet reminder: preventative visits often cost less than waiting. Share this with someone who needs it.",
      hashtags: "#Community",
      hook: "A quiet reminder.",
      script: "",
      cta: "Share with family.",
      day: "Thu",
      time: "16:15",
      status: "draft",
    },
  ];
}

function seedCampaigns(projectId: string): SocialCampaign[] {
  return [
    {
      id: `${projectId}-camp-1`,
      projectId,
      name: "Family cover education",
      goal: "Explain myths, claims, and product fit with posts and reels.",
      status: "active",
      start: "This week",
      end: "Next 14 days",
    },
    {
      id: `${projectId}-camp-2`,
      projectId,
      name: "YouTube explainers",
      goal: "Shorts plus one long video to grow search traffic.",
      status: "active",
      start: "This week",
      end: "End of month",
    },
  ];
}

function seedInbox(projectId: string): InboxItem[] {
  return [
    {
      id: `${projectId}-i1`,
      projectId,
      platform: "Instagram",
      type: "comment",
      author: "priya.m",
      text: "Does this cover daycare procedures too?",
      time: "12m",
      status: "open",
      replies: [],
    },
    {
      id: `${projectId}-i2`,
      projectId,
      platform: "YouTube",
      type: "comment",
      author: "Amit R",
      text: "Can you make a Short on waiting periods?",
      time: "1h",
      status: "open",
      replies: [],
    },
    {
      id: `${projectId}-i3`,
      projectId,
      platform: "LinkedIn",
      type: "mention",
      author: "Nova Clinics",
      text: "Useful checklist for our staff onboarding.",
      time: "3h",
      status: "replied",
      replies: [
        {
          id: `${projectId}-i3r1`,
          author: "Workspace",
          text: "Glad it helped — we can share the staff checklist.",
          time: "2h",
          fromBrand: true,
        },
      ],
    },
    {
      id: `${projectId}-i4`,
      projectId,
      platform: "Facebook",
      type: "message",
      author: "Sneha K",
      text: "Can we run this reel on our page next week?",
      time: "Yesterday",
      status: "open",
      replies: [],
    },
  ];
}

function seedMedia(projectId: string): MediaAsset[] {
  return [
    {
      id: `${projectId}-m1`,
      projectId,
      name: "Claim checklist cover",
      kind: "image",
      format: "post",
      detail: "1080×1080",
    },
    {
      id: `${projectId}-m2`,
      projectId,
      name: "Reel: paperwork B-roll",
      kind: "video",
      format: "reel",
      detail: "15s · 9:16",
    },
    {
      id: `${projectId}-m3`,
      projectId,
      name: "Short: waiting period",
      kind: "video",
      format: "short",
      detail: "22s · 9:16",
    },
    {
      id: `${projectId}-m4`,
      projectId,
      name: "Family cover explainer",
      kind: "video",
      format: "video",
      detail: "6:12 · 16:9",
    },
    {
      id: `${projectId}-m5`,
      projectId,
      name: "Pune hospital network notes",
      kind: "document",
      format: "blog",
      detail: "Outline",
    },
  ];
}

function ensureProjectData(projectId: string) {
  const posts = readJson<SocialPost[]>(POSTS_KEY, []);
  if (!posts.some((item) => item.projectId === projectId)) {
    writeJson(POSTS_KEY, [...posts, ...seedPosts(projectId)], false);
  }

  const campaigns = readJson<SocialCampaign[]>(CAMPAIGNS_KEY, []);
  if (!campaigns.some((item) => item.projectId === projectId)) {
    writeJson(CAMPAIGNS_KEY, [...campaigns, ...seedCampaigns(projectId)], false);
  }

  const inbox = readJson<InboxItem[]>(INBOX_KEY, []);
  if (!inbox.some((item) => item.projectId === projectId)) {
    writeJson(INBOX_KEY, [...inbox, ...seedInbox(projectId)], false);
  }

  const media = readJson<MediaAsset[]>(MEDIA_KEY, []);
  if (!media.some((item) => item.projectId === projectId)) {
    writeJson(MEDIA_KEY, [...media, ...seedMedia(projectId)], false);
  }

  const comments = readJson<InternalComment[]>(COMMENTS_KEY, []);
  if (!comments.some((item) => item.postId.startsWith(projectId))) {
    writeJson(
      COMMENTS_KEY,
      [
        ...comments,
        {
          id: `${projectId}-c1`,
          postId: `${projectId}-p1`,
          author: "Bhavna M",
          initials: "BM",
          text: "Can we tighten the first line before this goes live?",
          time: "Feb 10, 2026",
        },
        {
          id: `${projectId}-c2`,
          postId: `${projectId}-p1`,
          author: "Chris D",
          initials: "CD",
          text: "@Bhavna agreed — I'll add the checklist link.",
          time: "Feb 10, 2026",
        },
      ],
      false,
    );
  }
}

export function getSocialPosts(projectId: string): SocialPost[] {
  ensureProjectData(projectId);
  return readJson<SocialPost[]>(POSTS_KEY, []).filter((item) => item.projectId === projectId);
}

export function getSocialCampaigns(projectId: string): SocialCampaign[] {
  ensureProjectData(projectId);
  return readJson<SocialCampaign[]>(CAMPAIGNS_KEY, []).filter(
    (item) => item.projectId === projectId,
  );
}

export function getSocialCampaign(campaignId: string): SocialCampaign | null {
  return readJson<SocialCampaign[]>(CAMPAIGNS_KEY, []).find((item) => item.id === campaignId) ?? null;
}

export function saveSocialCampaign(input: Omit<SocialCampaign, "id"> & { id?: string }): SocialCampaign {
  const campaigns = readJson<SocialCampaign[]>(CAMPAIGNS_KEY, []);
  const campaign: SocialCampaign = { ...input, id: input.id ?? `campaign_${Date.now()}` };
  const next = campaigns.some((item) => item.id === campaign.id)
    ? campaigns.map((item) => (item.id === campaign.id ? campaign : item))
    : [campaign, ...campaigns];
  writeJson(CAMPAIGNS_KEY, next);
  return campaign;
}

export function deleteSocialCampaign(campaignId: string) {
  const campaigns = readJson<SocialCampaign[]>(CAMPAIGNS_KEY, []);
  writeJson(CAMPAIGNS_KEY, campaigns.filter((item) => item.id !== campaignId));
  const posts = readJson<SocialPost[]>(POSTS_KEY, []);
  writeJson(
    POSTS_KEY,
    posts.map((item) => (item.campaignId === campaignId ? { ...item, campaignId: null } : item)),
  );
}

export function getInboxItems(projectId: string): InboxItem[] {
  ensureProjectData(projectId);
  return readJson<InboxItem[]>(INBOX_KEY, [])
    .filter((item) => item.projectId === projectId)
    .map((item) => ({ ...item, replies: item.replies ?? [] }));
}

export function getMediaAssets(projectId: string): MediaAsset[] {
  ensureProjectData(projectId);
  return readJson<MediaAsset[]>(MEDIA_KEY, []).filter((item) => item.projectId === projectId);
}

export function saveSocialPost(
  input: Omit<SocialPost, "id"> & { id?: string },
): SocialPost {
  const posts = readJson<SocialPost[]>(POSTS_KEY, []);
  const post: SocialPost = {
    ...input,
    id: input.id ?? `post_${Date.now()}`,
  };
  const next = posts.some((item) => item.id === post.id)
    ? posts.map((item) => (item.id === post.id ? post : item))
    : [post, ...posts];
  writeJson(POSTS_KEY, next);
  return post;
}

export function updatePostStatus(postId: string, status: PublishStatus) {
  const posts = readJson<SocialPost[]>(POSTS_KEY, []);
  writeJson(
    POSTS_KEY,
    posts.map((item) => (item.id === postId ? { ...item, status } : item)),
  );
}

export function replyToInbox(itemId: string, text?: string) {
  const items = readJson<InboxItem[]>(INBOX_KEY, []);
  writeJson(
    INBOX_KEY,
    items.map((item) => {
      if (item.id !== itemId) return item;
      const replies = item.replies ?? [];
      return {
        ...item,
        status: "replied" as const,
        replies: text
          ? [
              ...replies,
              {
                id: `reply_${Date.now()}`,
                author: "Workspace",
                text,
                time: "Just now",
                fromBrand: true,
              },
            ]
          : replies,
      };
    }),
  );
}

export function getInternalComments(postId: string): InternalComment[] {
  return readJson<InternalComment[]>(COMMENTS_KEY, []).filter((item) => item.postId === postId);
}

export function addInternalComment(input: Omit<InternalComment, "id" | "time">) {
  const comments = readJson<InternalComment[]>(COMMENTS_KEY, []);
  writeJson(COMMENTS_KEY, [
    {
      ...input,
      id: `comment_${Date.now()}`,
      time: "Just now",
    },
    ...comments,
  ]);
}

export function generateContentDraft(input: {
  brief: string;
  format: ContentFormatId;
  platform: string;
  voice: string;
  audience: string;
}) {
  const format = getContentFormat(input.format);
  const brief =
    input.brief.trim() ||
    `Help ${input.audience} understand the product in a ${input.voice.toLowerCase()} way.`;

  if (input.format === "reel" || input.format === "short") {
    return {
      title: `${format.label}: ${brief.slice(0, 42)}`,
      hook: `Watch this if you have 20 seconds: ${brief.slice(0, 64)}`,
      caption: `${brief}\n\nShot for ${input.platform} in a ${input.voice.toLowerCase()} tone for ${input.audience}.`,
      script:
        "0-3s: Hook on screen\n3-10s: One problem\n10-22s: One clear answer\n22-30s: CTA + brand end card",
      hashtags:
        input.format === "short"
          ? "#Shorts #Explainers #AIGrowth"
          : "#Reels #QuickTips #AIGrowth",
      cta: "Follow for the next explainer.",
    };
  }

  if (input.format === "video") {
    return {
      title: brief.slice(0, 70),
      hook: `A practical walkthrough for ${input.audience}.`,
      caption: `${brief}\n\nChapters: intro, what to look for, what to skip, next step.`,
      script:
        "Intro (20s)\nNeed vs want (90s)\nWhat to skip (60s)\nHow to compare (90s)\nCTA (20s)",
      hashtags: "#YouTube #Explainer #AIGrowth",
      cta: "Comment the city you are buying cover in.",
    };
  }

  if (input.format === "carousel") {
    return {
      title: `Carousel: ${brief.slice(0, 40)}`,
      hook: "Swipe through the 5 things people miss.",
      caption: `${brief}\n\nSlide 1: Hook\nSlide 2-4: Facts\nSlide 5: CTA`,
      script: "Slide 1 hook\nSlide 2 myth\nSlide 3 fact\nSlide 4 checklist\nSlide 5 CTA",
      hashtags: "#Carousel #SaveThis #AIGrowth",
      cta: "Share this with someone comparing plans.",
    };
  }

  if (input.format === "story") {
    return {
      title: `Story: ${brief.slice(0, 40)}`,
      hook: "Frame 1: question. Frame 2: answer. Frame 3: tap CTA.",
      caption: brief,
      script: "Frame 1: question\nFrame 2: proof point\nFrame 3: sticker CTA",
      hashtags: "",
      cta: "Swipe up / link sticker",
    };
  }

  if (input.format === "blog") {
    return {
      title: brief.slice(0, 80),
      hook: `Most ${input.audience.toLowerCase()} skip this step.`,
      caption: `${brief}\n\nWritten in a ${input.voice.toLowerCase()} tone. Outline is ready to edit before publishing to ${input.platform}.`,
      script:
        "H2: Who this is for\nH2: What to check first\nH2: Common mistakes\nH2: Recommended next step",
      hashtags: "#Blog #LinkedIn #AIGrowth",
      cta: "Read the full checklist and save it.",
    };
  }

  return {
    title: brief.slice(0, 56),
    hook: `A clear take for ${input.audience}.`,
    caption: `${brief}\n\nWritten for ${input.audience}, in a ${input.voice.toLowerCase()} tone. Ready for ${input.platform}.`,
    script: "",
    hashtags: "#AIGrowth #SocialTips #OnBrand",
    cta: "Save this post.",
  };
}

export function getBestTimes(platform: string) {
  if (platform === "YouTube" || platform === "TikTok") {
    return ["12:00", "18:00", "21:00"];
  }
  if (platform === "LinkedIn" || platform === "Blog") {
    return ["08:30", "12:30", "17:00"];
  }
  return ["11:00", "13:30", "19:30"];
}

export function getWeekdays() {
  return WEEKDAYS;
}

export function statusChipColor(
  status: PublishStatus,
): "default" | "success" | "warning" | "info" | "error" | "primary" {
  if (status === "published") return "success";
  if (status === "scheduled") return "primary";
  if (status === "in_review") return "warning";
  if (status === "approved") return "info";
  if (status === "rejected") return "error";
  return "default";
}

export function getAnalytics(projectId: string) {
  const posts = getSocialPosts(projectId);
  const published = posts.filter((item) => item.status === "published").length;
  const scheduled = posts.filter((item) => item.status === "scheduled").length;
  const videoCount = posts.filter(
    (item) => item.format === "reel" || item.format === "short" || item.format === "video",
  ).length;

  return {
    impressions: "48.2k",
    engagement: "4.6%",
    videoViews: "12.8k",
    published,
    scheduled,
    videoCount,
    trend: [
      { day: "Mon", reach: 6200, engagement: 280 },
      { day: "Tue", reach: 5400, engagement: 310 },
      { day: "Wed", reach: 8100, engagement: 460 },
      { day: "Thu", reach: 7300, engagement: 390 },
      { day: "Fri", reach: 9100, engagement: 520 },
      { day: "Sat", reach: 4800, engagement: 210 },
      { day: "Sun", reach: 5700, engagement: 240 },
    ],
  };
}
