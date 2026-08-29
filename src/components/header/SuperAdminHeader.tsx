import { AccountCircle, Menu, NotificationsNone } from "@mui/icons-material";
import {
  Avatar,
  Box,
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
import { ROLE_LABELS, accountDisplayName } from "../../permissions/roles";
import { useUiStore } from "../../store/uiStore";

export function SuperAdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const openMenu =
    (setter: (value: HTMLElement | null) => void) =>
    (event: MouseEvent<HTMLElement>) => {
      setter(event.currentTarget);
    };

  const closeMenus = () => {
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
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <IconButton
          onClick={toggleSidebar}
          size="small"
          sx={{ display: { xs: "inline-flex", md: "none" }, borderRadius: "4px" }}
          aria-label="Open navigation"
        >
          <Menu fontSize="small" />
        </IconButton>
        <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>Platform</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <IconButton
          onClick={openMenu(setNotificationAnchor)}
          aria-label="Notifications"
          size="small"
          sx={{ color: "text.secondary", borderRadius: "4px" }}
        >
          <NotificationsNone fontSize="small" />
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />
        <Box
          onClick={openMenu(setUserAnchor)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            borderRadius: "4px",
            px: 0.5,
            py: 0.25,
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
            {(user ? accountDisplayName(user) : "S").charAt(0)}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" }, pr: 0.25 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.15 }}>
              {user ? accountDisplayName(user) : ""}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user ? ROLE_LABELS[user.role] : ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      <MuiMenu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={closeMenus}
        slotProps={{ paper: { sx: { mt: 0.75 } } }}
      >
        <MenuItem disabled>No platform alerts</MenuItem>
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
            navigate("/super-admin/settings");
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          System settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeMenus();
            logout();
            navigate("/admin/login");
          }}
        >
          Log out
        </MenuItem>
      </MuiMenu>
    </Box>
  );
}
