import { create } from "zustand";
import { persist } from "zustand/middleware";

// aidigiplanner-backend has no notification/event feed yet (no websocket, no
// activity-log endpoint scoped to a user's own company). This store is real,
// session-local state — every entry is pushed by an actual action the current
// user took (see pushNotification() call sites: ContentEditor's approve/
// reject/schedule/publish, team invites, social-account disconnects) — it just
// can't reflect other users' actions or true system events until a real
// notifications API exists (spec §43).
export type NotificationType =
  | "invitation_sent"
  | "content_submitted"
  | "changes_requested"
  | "content_approved"
  | "content_scheduled"
  | "content_published"
  | "publishing_failed"
  | "social_account_disconnected";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  detail?: string;
  path?: string;
  read: boolean;
  createdAt: string;
};

type NotificationState = {
  notifications: AppNotification[];
  push: (input: { type: NotificationType; title: string; detail?: string; path?: string }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      push: ({ type, title, detail, path }) =>
        set((state) => ({
          notifications: [
            {
              id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              type,
              title,
              detail,
              path,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 100),
        })),
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
        })),
      markAllRead: () =>
        set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })) })),
      clear: () => set({ notifications: [] }),
    }),
    { name: "ai-growth-notifications" },
  ),
);

export function pushNotification(input: { type: NotificationType; title: string; detail?: string; path?: string }) {
  useNotificationStore.getState().push(input);
}
