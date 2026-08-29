import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import { AppHeader } from "../components/header/AppHeader";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { organizationNav } from "../constants/navigation";
import { CANVAS_BG } from "../constants/layout";
import { CursorHost } from "../cursor/CursorHost";
import { useAuth } from "../hooks/useAuth";
import { useSyncProductPermissions } from "../hooks/useSyncProductPermissions";
import { useWorkspace } from "../hooks/useWorkspace";
import { useCompanyProjects, useProductSubProducts } from "../features/projects/hooks/useCompanyProjects";

export function OrganizationLayout() {
  const { session } = useAuth();
  const { organization, currentProject } = useWorkspace();
  const live = session?.source === "api";
  useCompanyProjects(organization?.id, live);
  useProductSubProducts(currentProject?.id, live);
  useSyncProductPermissions();

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AppSidebar items={organizationNav} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: CANVAS_BG,
        }}
      >
        <AppHeader />

        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, md: 3 },
            background: CANVAS_BG,
            scrollbarWidth: "thin",
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <CursorHost />
    </Box>
  );
}
