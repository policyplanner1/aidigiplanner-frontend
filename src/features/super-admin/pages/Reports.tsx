import { Download } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { getApiErrorMessage } from "../../../services/api/errors";
import { useAdminKpis } from "../hooks/useAdminKpis";

// Built from the real /admin/kpis endpoint — this is a genuine export of live
// platform numbers, not a mock. (AI generations / posts published stay blank —
// the backend doesn't populate those fields yet.)
function toCsv(rows: [string, string | number][]): string {
  const header = "Metric,Value";
  const body = rows.map(([label, value]) => `"${label}",${value}`).join("\n");
  return `${header}\n${body}`;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const kpis = useAdminKpis();

  const rows: [string, string | number][] = kpis.data
    ? [
        ["Companies — total", kpis.data.companies.total],
        ["Companies — active", kpis.data.companies.active],
        ["Companies — pending approval", kpis.data.companies.pending_approval],
        ["Companies — rejected", kpis.data.companies.rejected],
        ["Companies — suspended", kpis.data.companies.suspended],
        ["Users — total", kpis.data.users.total],
        ["Users — active", kpis.data.users.active],
        ["Users — pending", kpis.data.users.pending],
        ["Users — suspended", kpis.data.users.suspended],
        ["Users — super admins", kpis.data.users.super_admins],
        ["Social accounts — total", kpis.data.social_accounts.total],
        ["Social accounts — active", kpis.data.social_accounts.active],
        ["Social accounts — disabled", kpis.data.social_accounts.disabled],
      ]
    : [];

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Platform"
          title="Reports"
          description="Export a snapshot of platform-wide numbers."
          action={
            kpis.data ? (
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => downloadCsv(`aidigiplanner-report-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))}
              >
                Export CSV
              </Button>
            ) : null
          }
        />

        {kpis.isLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : kpis.isError ? (
          <Alert severity="error">{getApiErrorMessage(kpis.error)}</Alert>
        ) : (
          <Paper sx={{ borderRadius: 1, overflow: "auto", maxWidth: 560 }}>
            <Table>
              <TableBody>
                {rows.map(([label, value]) => (
                  <TableRow key={label} hover>
                    <TableCell>
                      <Typography color="text.secondary">{label}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </ScreenFrame>
  );
}
