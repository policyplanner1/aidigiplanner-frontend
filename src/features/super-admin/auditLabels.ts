import type { ApiAuditLog } from "../../types/api";
import { ROLE_LABELS } from "../../permissions/roles";

export type AuditKind = "all" | "login" | "logout" | "password" | "company";

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.logout": "Signed out",
  "auth.logout_all": "Signed out everywhere",
  "auth.login_failed": "Sign-in failed",
  "auth.failed_login": "Sign-in failed",
  "auth.login.success": "Signed in",
  "auth.login.failed": "Sign-in failed",
  "auth.logout.success": "Signed out",
  login: "Signed in",
  logout: "Signed out",
  logout_all: "Signed out everywhere",
  login_failed: "Sign-in failed",
  failed_login: "Sign-in failed",
  "auth.register": "Created an account",
  register: "Created an account",
  "auth.verify_email": "Verified email",
  "auth.change_password": "Changed password",
  "auth.reset_password": "Reset password",
  "auth.forgot_password": "Asked to reset password",
  change_password: "Changed password",
  reset_password: "Reset password",
  forgot_password: "Asked to reset password",
  "company.approve": "Approved a company",
  "company.reject": "Rejected a company",
  approve_company: "Approved a company",
  reject_company: "Rejected a company",
  "member.add": "Added a teammate",
  "member.remove": "Removed a teammate",
  "member.update": "Updated a teammate",
  "project.create": "Created a project",
  "company.update": "Updated a company",
};

export function actionLabel(action: string) {
  const mapped = ACTION_LABELS[action] ?? ACTION_LABELS[action.toLowerCase()];
  if (mapped) return mapped;
  return action
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function actionKind(action: string): Exclude<AuditKind, "all"> {
  const value = action.toLowerCase();
  if (/log.?out|sign.?out/.test(value)) return "logout";
  if (/password|reset.?otp|forgot/.test(value)) return "password";
  if (/login|sign.?in/.test(value)) return "login";
  return "company";
}

export function matchesKind(action: string, kind: AuditKind) {
  if (kind === "all") return true;
  const value = action.toLowerCase();
  if (kind === "login") return /login|sign.?in/.test(value) && !/log.?out/.test(value);
  if (kind === "logout") return /log.?out|sign.?out/.test(value);
  if (kind === "password") return /password|reset.?otp|forgot/.test(value);
  return /compan(y|ies)|approve|reject|member|project/.test(value);
}

export function actorLabel(log: Pick<ApiAuditLog, "actor_name" | "actor_email">) {
  const name = log.actor_name?.trim() ?? "";
  const email = log.actor_email?.trim() ?? "";
  const roleNames = Object.values(ROLE_LABELS);
  if (name && !roleNames.includes(name)) return name;
  return email || name || "Unknown person";
}

export function eventSummary(log: ApiAuditLog) {
  const who = actorLabel(log);
  const what = actionLabel(log.action).toLowerCase();
  if (log.company_name) return `${who} ${what} · ${log.company_name}`;
  return `${who} ${what}`;
}

export function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatRelative(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatWhen(value);
  const delta = Date.now() - date.getTime();
  const minutes = Math.round(delta / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatWhen(value);
}

export function deviceFromUserAgent(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const os = /Windows NT/.test(userAgent)
    ? "Windows"
    : /Mac OS X/.test(userAgent)
      ? "macOS"
      : /Android/.test(userAgent)
        ? "Android"
        : /iPhone|iPad/.test(userAgent)
          ? "iOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Unknown OS";
  return `${browser} on ${os}`;
}

export function kindColor(action: string) {
  const value = action.toLowerCase();
  if (/fail|denied|reject/.test(value)) return "#E25030";
  if (/login|sign.?in/.test(value) && !/log.?out/.test(value)) return "#1F8A80";
  if (/password/.test(value)) return "#E8A838";
  return "#FF6B45";
}

export function metadataRows(metadata: Record<string, unknown> | null) {
  if (!metadata) return [];
  return Object.entries(metadata)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({
      label: key.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      value: typeof value === "string" ? value : JSON.stringify(value),
    }));
}

export function rangeFrom(id: "24h" | "7d" | "30d" | "all") {
  if (id === "all") return undefined;
  const from = new Date();
  if (id === "24h") from.setHours(from.getHours() - 24);
  if (id === "7d") from.setDate(from.getDate() - 7);
  if (id === "30d") from.setDate(from.getDate() - 30);
  return from.toISOString();
}
