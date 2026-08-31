import { Box, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { GLASS_SX } from "../../constants/layout";
import { PageHeader } from "../ui/PageHeader";
import { ScreenFrame } from "../ui/ScreenFrame";

type AccessDeniedPageProps = {
  title?: string;
  description?: string;
};

// Route guards (RoleGuard, PermissionGuard, ProductAccessGuard) render this
// instead of silently redirecting, per spec §49.
export function AccessDeniedPage({
  title = "You do not have access",
  description = "Your account doesn't have permission to view this page. Ask a Company Admin to grant you access if you think this is a mistake.",
}: AccessDeniedPageProps) {
  return (
    <ScreenFrame>
      <PageHeader eyebrow="Restricted" title={title} description={description} />
      <Box sx={{ ...GLASS_SX, p: 3, borderRadius: 1, maxWidth: 640 }}>
        <Button component={RouterLink} to="/app/dashboard" variant="contained">
          Back to dashboard
        </Button>
      </Box>
    </ScreenFrame>
  );
}
