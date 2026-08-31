import type { ReactElement } from "react";
import {
  AutoAwesome,
  Business,
  CalendarMonth,
  Campaign,
  ContactPage,
  CreditCard,
  Dashboard,
  DeviceHub,
  ExpandLess,
  ExpandMore,
  Assessment,
  Description,
  FolderOpen,
  Group,
  Hub,
  Inbox,
  Insights,
  Inventory2,
  ManageAccounts,
  Palette,
  PlayCircle,
  Policy,
  Rule,
  Search,
  Settings,
  Share,
  Speed,
  Storefront,
  TravelExplore,
  VerifiedUser,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { NavEntry, NavGroup, NavIconName, NavItem } from "../../constants/navigation";
import { TYPE } from "../../constants/fonts";
import {
  CHROME_BORDER,
  CHROME_GLASS_SX,
  HEADER_HEIGHT,
  SIDEBAR_BG,
  SIDEBAR_WIDTH,
  SURFACE,
} from "../../constants/layout";
import { hasPermission } from "../../permissions/permissions";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";

const icons: Record<NavIconName, ReactElement> = {
  dashboard: <Dashboard fontSize="small" />,
  organizations: <Business fontSize="small" />,
  users: <ManageAccounts fontSize="small" />,
  subscriptions: <CreditCard fontSize="small" />,
  plans: <Inventory2 fontSize="small" />,
  billing: <CreditCard fontSize="small" />,
  aiUsage: <AutoAwesome fontSize="small" />,
  apiUsage: <Speed fontSize="small" />,
  integrations: <Hub fontSize="small" />,
  settings: <Settings fontSize="small" />,
  audit: <Policy fontSize="small" />,
  brands: <Storefront fontSize="small" />,
  products: <Inventory2 fontSize="small" />,
  accounts: <Share fontSize="small" />,
  content: <AutoAwesome fontSize="small" />,
  calendar: <CalendarMonth fontSize="small" />,
  inbox: <Inbox fontSize="small" />,
  approvals: <Rule fontSize="small" />,
  media: <FolderOpen fontSize="small" />,
  campaigns: <Campaign fontSize="small" />,
  analytics: <Insights fontSize="small" />,
  agents: <VerifiedUser fontSize="small" />,
  agentRuns: <PlayCircle fontSize="small" />,
  discover: <TravelExplore fontSize="small" />,
  leads: <Search fontSize="small" />,
  crm: <ContactPage fontSize="small" />,
  team: <Group fontSize="small" />,
  brandProfile: <Palette fontSize="small" />,
  crossNetwork: <DeviceHub fontSize="small" />,
  templates: <Description fontSize="small" />,
  reports: <Assessment fontSize="small" />,
};

function itemVisible(item: NavItem, permissions: string[]) {
  if (!item.permission) return true;
  const required = Array.isArray(item.permission) ? item.permission : [item.permission];
  return required.some((permission) => hasPermission(permissions, permission));
}

function getVisibleNav(entries: NavEntry[], permissions: string[]): NavEntry[] {
  const withAccess = entries.flatMap((entry): NavEntry[] => {
    if (entry.type === "section") return [entry];
    if (entry.type === "item") return itemVisible(entry, permissions) ? [entry] : [];
    const children = entry.children.filter((child) => itemVisible(child, permissions));
    if (!itemVisible({ ...entry, type: "item", path: entry.children[0]?.path ?? "" }, permissions)) {
      return [];
    }
    return children.length > 0 ? [{ ...entry, children }] : [];
  });

  return withAccess.filter((entry, index) => {
    if (entry.type === "section") {
      const following = withAccess.slice(index + 1);
      const nextSectionIndex = following.findIndex((item) => item.type === "section");
      const sectionItems =
        nextSectionIndex === -1 ? following : following.slice(0, nextSectionIndex);
      return sectionItems.some((item) => item.type === "item" || item.type === "group");
    }
    return true;
  });
}

function navItemActive(pathname: string, path: string) {
  return (
    pathname === path ||
    (path !== "/app/dashboard" && pathname.startsWith(`${path}/`))
  );
}

function NavLinkButton({
  item,
  nested = false,
  onNavigate,
}: {
  item: NavItem;
  nested?: boolean;
  onNavigate: (path: string) => void;
}) {
  const location = useLocation();
  const active = navItemActive(location.pathname, item.path);

  return (
    <ListItemButton
      selected={active}
      onClick={() => onNavigate(item.path)}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 1,
        mb: 0.25,
        minHeight: 36,
        py: 0.4,
        px: 1,
        pl: nested ? 1.5 : 1,
        ml: nested ? 1.25 : 0,
        color: active ? "#E25030" : "text.primary",
        backgroundColor: active ? "rgba(255,248,243,0.78)" : "transparent",
        border: "1px solid",
        borderColor: active ? SURFACE.border : "transparent",
        boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.72)" : "none",
        backdropFilter: active ? "blur(10px)" : "none",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 6,
          bottom: 6,
          width: 3,
          borderRadius: "0 2px 2px 0",
          backgroundColor: active ? "#FF6B45" : "transparent",
        },
        "&.Mui-selected": {
          backgroundColor: "rgba(255,248,243,0.78)",
          "&:hover": { backgroundColor: "rgba(255,248,243,0.92)" },
        },
        "&:hover": {
          backgroundColor: active ? "rgba(255,248,243,0.92)" : "rgba(255,248,243,0.45)",
          borderColor: SURFACE.border,
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 28, color: active ? "#FF6B45" : "#8A6F64" }}>
        {icons[item.icon]}
      </ListItemIcon>
      <ListItemText
        primary={item.label}
        sx={{
          "& .MuiListItemText-primary": {
            fontWeight: active ? 600 : 500,
            fontSize: nested ? 12.5 : 13,
            fontFamily: "inherit",
          },
        }}
      />
    </ListItemButton>
  );
}

function NavGroupBlock({
  group,
  onNavigate,
}: {
  group: NavGroup;
  onNavigate: (path: string) => void;
}) {
  const location = useLocation();
  const childActive = group.children.some((child) => navItemActive(location.pathname, child.path));
  const [open, setOpen] = useState(childActive);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen((current) => !current)}
        sx={{
          borderRadius: 1,
          mb: 0.25,
          minHeight: 36,
          py: 0.4,
          px: 1,
          color: childActive ? "#E25030" : "text.primary",
          backgroundColor: childActive ? "rgba(255,248,243,0.5)" : "transparent",
          "&:hover": { backgroundColor: "rgba(255,248,243,0.45)" },
        }}
      >
        <ListItemIcon sx={{ minWidth: 28, color: childActive ? "#FF6B45" : "#8A6F64" }}>
          {icons[group.icon]}
        </ListItemIcon>
        <ListItemText
          primary={group.label}
          sx={{
            "& .MuiListItemText-primary": {
              fontWeight: childActive ? 600 : 500,
              fontSize: 13,
              fontFamily: "inherit",
            },
          }}
        />
        {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </ListItemButton>
      <Collapse in={open || childActive} timeout="auto" unmountOnExit>
        {group.children.map((child) => (
          <NavLinkButton key={child.path} item={child} nested onNavigate={onNavigate} />
        ))}
      </Collapse>
    </>
  );
}

type AppSidebarProps = {
  items: NavEntry[];
  title?: string;
  subtitle?: string;
};

export function AppSidebar({
  items,
  title = "AI Social Planner",
  subtitle,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const permissions = useAuthStore((state) => state.session?.permissions ?? []);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const visibleItems = getVisibleNav(items, permissions);

  const content = (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: SIDEBAR_BG,
        color: "text.primary",
        borderRight: "1px solid",
        borderColor: CHROME_BORDER,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 180,
          height: 180,
          right: -70,
          top: -70,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,69,0.28), transparent 68%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 160,
          height: 160,
          left: -60,
          bottom: 40,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(31,138,128,0.2), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          height: HEADER_HEIGHT,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1.5,
          mx: 1.25,
          mt: 1.25,
          borderRadius: 1,
          ...CHROME_GLASS_SX,
          border: `1px solid ${SURFACE.border}`,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            backgroundColor: "#FF6B45",
            color: "#FFF9F5",
            display: "grid",
            placeItems: "center",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: -0.3,
            flexShrink: 0,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          AI
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ ...TYPE.title, fontSize: 13.5 }} noWrap>
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              sx={{ ...TYPE.eyebrow, color: "secondary.dark", fontSize: 10, letterSpacing: 0.6 }}
              noWrap
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <List
        disablePadding
        sx={{
          position: "relative",
          px: 1.25,
          py: 1.25,
          overflowY: "auto",
          flex: 1,
          scrollbarWidth: "thin",
        }}
      >
        {visibleItems.map((item) => {
          if (item.type === "section") {
            return (
              <Typography
                key={item.label}
                sx={{
                  ...TYPE.eyebrow,
                  display: "block",
                  px: 1,
                  pt: 1.75,
                  pb: 0.5,
                  color: "secondary.dark",
                  fontSize: 10.5,
                }}
              >
                {item.label}
              </Typography>
            );
          }

          const onNavigate = (path: string) => {
            navigate(path);
            setSidebarOpen(false);
          };

          if (item.type === "group") {
            return <NavGroupBlock key={item.label} group={item} onNavigate={onNavigate} />;
          }

          return <NavLinkButton key={item.path} item={item} onNavigate={onNavigate} />;
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            background: SIDEBAR_BG,
            border: 0,
            borderRadius: 0,
            boxShadow: "none",
          },
        }}
      >
        {content}
      </Drawer>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          height: "100vh",
        }}
      >
        {content}
      </Box>
    </>
  );
}
