export type CursorModule =
  | "dashboard"
  | "projects"
  | "leads"
  | "ai"
  | "rcs"
  | "email"
  | "social"
  | "campaigns"
  | "automation"
  | "analytics"
  | "settings";

export type CursorAction = "default" | "hover" | "click" | "drag" | "text" | "disabled";

export type CursorStatus = "idle" | "loading" | "thinking" | "success" | "error";

export const CURSOR_ACCENT: Record<CursorModule, string> = {
  dashboard: "#FF6B45",
  projects: "#1F8A80",
  leads: "#FF6B45",
  ai: "#1F8A80",
  rcs: "#1F8A80",
  email: "#1F8A80",
  social: "#FF6B45",
  campaigns: "#FF6B45",
  automation: "#1F8A80",
  analytics: "#1F8A80",
  settings: "#8A6F64",
};

const INTERACTIVE =
  "a,button,[role='button'],[role='link'],[role='menuitem'],.MuiButtonBase-root,.MuiChip-root,.MuiIconButton-root,[data-cursor]";

const TEXTUAL =
  "input,textarea,select,[contenteditable='true'],.MuiInputBase-input,[role='textbox']";

export function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE));
}

export function isTextTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(TEXTUAL));
}

export function moduleFromPath(pathname: string): CursorModule {
  if (pathname.includes("/leads")) return "leads";
  if (pathname.includes("/ai-agents") || pathname.includes("/ai-usage")) return "ai";
  if (pathname.includes("/social/inbox")) return "rcs";
  if (pathname.includes("/social/campaigns") || pathname.includes("/campaigns")) return "campaigns";
  if (pathname.includes("/social/analytics") || pathname.includes("/cross-network")) return "analytics";
  if (pathname.includes("/social") || pathname.includes("/brand-profile") || pathname.includes("/content")) {
    return "social";
  }
  if (pathname.includes("/crm") || pathname.includes("/integrations")) return "automation";
  if (pathname.includes("/projects") || pathname.includes("/organizations")) return "projects";
  if (pathname.includes("/settings") || pathname.includes("/billing") || pathname.includes("/team")) {
    return "settings";
  }
  return "dashboard";
}

export function shouldEnableCursor() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia("(hover: none)").matches;
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  return !coarse && !noHover && !narrow;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
