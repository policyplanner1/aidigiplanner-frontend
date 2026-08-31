import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { useNotificationStore } from "../../../store/notificationStore";

export function NotificationsPage() {
  const navigate = useNavigate();
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Workspace"
          title="Notifications"
          description="Updates from things you've done in this workspace — content submitted, approved, scheduled, or published."
          action={
            notifications.some((item) => !item.read) ? (
              <Button variant="outlined" onClick={() => markAllRead()}>
                Mark all read
              </Button>
            ) : null
          }
        />

        {notifications.length === 0 ? (
          <Box sx={{ ...GLASS_SX, p: 3, borderRadius: 1, maxWidth: 480 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No notifications yet.</Typography>
            <Typography color="text.secondary">
              You'll see updates here as content moves through review, scheduling, and publishing.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {notifications.map((item) => (
              <Box
                key={item.id}
                onClick={() => {
                  markRead(item.id);
                  if (item.path) navigate(item.path);
                }}
                sx={{
                  ...GLASS_SX,
                  p: 1.75,
                  borderRadius: 1,
                  cursor: item.path ? "pointer" : "default",
                  display: "flex",
                  gap: 1.25,
                  alignItems: "flex-start",
                  border: `1px solid ${item.read ? SURFACE.border : "#FF6B45"}`,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    mt: 0.6,
                    borderRadius: "50%",
                    backgroundColor: item.read ? "transparent" : "#FF6B45",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: item.read ? 600 : 700 }}>{item.title}</Typography>
                  {item.detail ? (
                    <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
                      {item.detail}
                    </Typography>
                  ) : null}
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </ScreenFrame>
  );
}
