import type { NotificationType } from "../../store/notificationStore";

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  invitation_sent: "Invitation sent",
  content_submitted: "Content submitted",
  changes_requested: "Changes requested",
  content_approved: "Content approved",
  content_scheduled: "Content scheduled",
  content_published: "Content published",
  publishing_failed: "Publishing failed",
  social_account_disconnected: "Social account disconnected",
};

export function notificationMeta(type: NotificationType) {
  return { label: NOTIFICATION_LABELS[type] ?? type };
}
