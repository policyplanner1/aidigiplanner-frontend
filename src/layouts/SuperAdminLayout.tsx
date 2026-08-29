import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import { SuperAdminHeader } from "../components/header/SuperAdminHeader";
import { AppSidebar } from "../components/sidebar/AppSidebar";
import { superAdminNav } from "../constants/navigation";
import { CANVAS_BG } from "../constants/layout";
import { CursorHost } from "../cursor/CursorHost";

export function SuperAdminLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AppSidebar items={superAdminNav} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: CANVAS_BG,
        }}
      >
        <SuperAdminHeader />

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
