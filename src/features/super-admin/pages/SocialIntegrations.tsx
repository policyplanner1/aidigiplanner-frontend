import { Cancel } from "@mui/icons-material";
import { Alert, Box, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { SOCIAL_PLATFORMS } from "../../../constants/platforms";

// aidigiplanner-backend never implemented real OAuth for social platforms —
// social accounts are manual handle-entry only (see services/social/socialAccountsService.ts
// usesManualSocialHandles()). So every platform is genuinely "not connected" here —
// this table reflects the real state, not a fabricated one.
export function SocialIntegrationsPage() {
  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Platform"
          title="Social Integrations"
          description="Platform-wide OAuth app configuration for each network."
        />

        <Alert severity="warning">
          No platform has a real OAuth app configured on the backend yet — companies connect
          social accounts by entering a public handle and profile URL instead.
        </Alert>

        <Paper sx={{ borderRadius: 1, overflow: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Platform</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>OAuth app</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SOCIAL_PLATFORMS.map((platform) => (
                <TableRow key={platform.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{platform.label}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {platform.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" icon={<Cancel fontSize="small" />} label="Not configured" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </ScreenFrame>
  );
}
