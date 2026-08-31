import { AccountCircle, AutoAwesome, ChevronRight, ExpandMore, Menu, NotificationsNone } from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  MenuItem,
  Menu as MuiMenu,
  Typography,
} from "@mui/material";
import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import { CHROME_BORDER, HEADER_HEIGHT, SURFACE } from "../../constants/layout";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useWorkspace } from "../../hooks/useWorkspace";
import { PERMISSIONS } from "../../permissions/permissions";
import { ROLE_LABELS, accountDisplayName } from "../../permissions/roles";
import { useNotificationStore } from "../../store/notificationStore";
import { useUiStore } from "../../store/uiStore";

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const {
    organization,
    projects,
    currentProject,
    subProducts,
    currentSubProduct,
    setCurrentProjectId,
    setCurrentSubProductId,
  } = useWorkspace();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const [productAnchor, setProductAnchor] = useState<null | HTMLElement>(null);
  const [subAnchor, setSubAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const openMenu =
    (setter: (value: HTMLElement | null) => void) =>
    (event: MouseEvent<HTMLElement>) => {
      setter(event.currentTarget);
    };

  const closeMenus = () => {
    setProductAnchor(null);
    setSubAnchor(null);
    setUserAnchor(null);
    setNotificationAnchor(null);
  };

  return (
    <Box
      component="header"
      sx={{
        height: HEADER_HEIGHT,
        px: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid",
        borderColor: CHROME_BORDER,
        backgroundColor: "rgba(255,248,243,0.72)",
        backdropFilter: "blur(14px)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <IconButton
          onClick={toggleSidebar}
          size="small"
          sx={{ display: { xs: "inline-flex", md: "none" }, borderRadius: "4px" }}
          aria-label="Open navigation"
        >
          <Menu fontSize="small" />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0, flexWrap: "wrap" }}>
          <Typography noWrap sx={{ fontWeight: 600, fontSize: 13.5 }}>
            {organization?.name ?? "Company"}
          </Typography>
          <ChevronRight sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
          <Box
            onClick={projects.length > 0 ? openMenu(setProductAnchor) : undefined}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              minWidth: 0,
              cursor: projects.length > 0 ? "pointer" : "default",
              px: 0.75,
              py: 0.4,
              borderRadius: "4px",
              "&:hover": projects.length > 0 ? { backgroundColor: SURFACE.well } : undefined,
            }}
          >
            <Typography noWrap sx={{ fontWeight: 500, fontSize: 13.5, color: "text.secondary" }}>
              {currentProject?.name ?? "Select product"}
            </Typography>
            {projects.length > 1 ? <ExpandMore sx={{ fontSize: 16, color: "text.secondary" }} /> : null}
          </Box>
          {subProducts.length > 0 ? (
            <>
              <ChevronRight sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
              <Box
                onClick={openMenu(setSubAnchor)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.4,
                  minWidth: 0,
                  cursor: "pointer",
                  px: 0.75,
                  py: 0.4,
                  borderRadius: "4px",
                  "&:hover": { backgroundColor: SURFACE.well },
                }}
              >
                <Typography noWrap sx={{ fontWeight: 500, fontSize: 13.5, color: "text.secondary" }}>
                  {currentSubProduct?.name ?? "All"}
                </Typography>
                <ExpandMore sx={{ fontSize: 16, color: "text.secondary" }} />
              </Box>
            </>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {can(PERMISSIONS.CONTENT_CREATE) ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<AutoAwesome fontSize="small" />}
            onClick={() => navigate("/app/create")}
            sx={{ borderRadius: "999px", px: 1.75, display: { xs: "none", sm: "inline-flex" } }}
          >
            Create with AI
          </Button>
        ) : null}
        <IconButton
          onClick={openMenu(setNotificationAnchor)}
          aria-label="Notifications"
          size="small"
          sx={{ color: "text.secondary", borderRadius: "4px" }}
        >
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <NotificationsNone fontSize="small" />
          </Badge>
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />
        <Box
          onClick={openMenu(setUserAnchor)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            pl: 0.5,
            pr: 0.5,
            py: 0.25,
            borderRadius: "4px",
            "&:hover": { backgroundColor: SURFACE.well },
          }}
        >
          <Avatar
            sx={{
              width: 26,
              height: 26,
              bgcolor: "primary.main",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: "4px",
            }}
          >
            {(user ? accountDisplayName(user) : "U").charAt(0)}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" }, pr: 0.25 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.15, fontSize: 13 }}>
              {user ? accountDisplayName(user) : "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              {user ? ROLE_LABELS[user.role] : ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      <MuiMenu
        anchorEl={productAnchor}
        open={Boolean(productAnchor)}
        onClose={closeMenus}
        slotProps={{ paper: { sx: { mt: 0.75, minWidth: 220 } } }}
      >
        {projects.map((project) => (
          <MenuItem
            key={project.id}
            selected={project.id === currentProject?.id}
            onClick={() => {
              setCurrentProjectId(project.id);
              closeMenus();
            }}
          >
            {project.name}
          </MenuItem>
        ))}
      </MuiMenu>

      <MuiMenu
        anchorEl={subAnchor}
        open={Boolean(subAnchor)}
        onClose={closeMenus}
        slotProps={{ paper: { sx: { mt: 0.75, minWidth: 220 } } }}
      >
        <MenuItem
          selected={!currentSubProduct}
          onClick={() => {
            setCurrentSubProductId(null);
            closeMenus();
          }}
        >
          All
        </MenuItem>
        {subProducts.map((item) => (
          <MenuItem
            key={item.id}
            selected={item.id === currentSubProduct?.id}
            onClick={() => {
              setCurrentSubProductId(item.id);
              closeMenus();
            }}
          >
            {item.name}
          </MenuItem>
        ))}
      </MuiMenu>

      <MuiMenu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={closeMenus}
        slotProps={{ paper: { sx: { mt: 0.75, width: 340, maxHeight: 420 } } }}
      >
        <Box sx={{ px: 1.5, py: 0.75, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Notifications</Typography>
          {notifications.length > 0 ? (
            <Typography
              component="button"
              onClick={() => markAllRead()}
              sx={{ border: 0, background: "none", cursor: "pointer", fontSize: 12, color: "secondary.dark", fontWeight: 600 }}
            >
              Mark all read
            </Typography>
          ) : null}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications yet</MenuItem>
        ) : (
          notifications.slice(0, 8).map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => {
                markRead(item.id);
                closeMenus();
                if (item.path) navigate(item.path);
              }}
              sx={{ whiteSpace: "normal", alignItems: "flex-start", py: 1 }}
            >
              <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    mt: 0.6,
                    borderRadius: "50%",
                    backgroundColor: item.read ? "transparent" : "#FF6B45",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: item.read ? 500 : 700, fontSize: 13 }}>{item.title}</Typography>
                  {item.detail ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {item.detail}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            closeMenus();
            navigate("/app/notifications");
          }}
          sx={{ justifyContent: "center", fontSize: 12.5, fontWeight: 600, color: "secondary.dark" }}
        >
          View all notifications
        </MenuItem>
      </MuiMenu>

      <MuiMenu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={closeMenus}
        slotProps={{ paper: { sx: { mt: 0.75 } } }}
      >
        <MenuItem
          onClick={() => {
            closeMenus();
            navigate("/app/settings");
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile & settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeMenus();
            logout();
            navigate("/login");
          }}
        >
          Log out
        </MenuItem>
      </MuiMenu>
    </Box>
  );
}
