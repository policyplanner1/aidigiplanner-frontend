import { AccountCircle, ChevronRight, ExpandMore, Menu, NotificationsNone } from "@mui/icons-material";
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
import { useWorkspace } from "../../hooks/useWorkspace";
import { ROLE_LABELS, accountDisplayName } from "../../permissions/roles";
import { useUiStore } from "../../store/uiStore";

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
        slotProps={{ paper: { sx: { mt: 0.75 } } }}
      >
        <MenuItem disabled>No notifications yet</MenuItem>
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
