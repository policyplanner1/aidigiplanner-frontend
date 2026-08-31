import { ArrowBack } from "@mui/icons-material";
import { Alert, Box, Button, Chip, CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { getApiErrorMessage } from "../../../services/api/errors";
import type { ApiCompanyStatus } from "../../../types/api";
import { useAdminCompany } from "../hooks/useAdminKpis";

function statusColor(status: ApiCompanyStatus) {
  if (status === "pending_approval") return "warning" as const;
  if (status === "active") return "success" as const;
  if (status === "rejected") return "error" as const;
  return "default" as const;
}

function formatWhen(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function CompanyDetailPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const company = useAdminCompany(companyId ?? null);

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/super-admin/companies")} sx={{ justifySelf: "start" }}>
          Back to companies
        </Button>

        {company.isLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : company.isError ? (
          <Alert severity="error">{getApiErrorMessage(company.error)}</Alert>
        ) : company.data ? (
          <>
            <PageHeader
              eyebrow="Company"
              title={company.data.name}
              description={company.data.slug}
              action={<Chip color={statusColor(company.data.status)} label={company.data.status.replace("_", " ")} />}
            />

            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
              <Box sx={{ ...GLASS_SX, p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Registered</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatWhen(company.data.created_at)}</Typography>
              </Box>
              <Box sx={{ ...GLASS_SX, p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Approved</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatWhen(company.data.approved_at)}</Typography>
              </Box>
              <Box sx={{ ...GLASS_SX, p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Rejected</Typography>
                <Typography sx={{ fontWeight: 700 }}>{formatWhen(company.data.rejected_at)}</Typography>
                {company.data.rejection_reason ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {company.data.rejection_reason}
                  </Typography>
                ) : null}
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1.25 }}>Members ({company.data.members.length})</Typography>
              <Paper sx={{ borderRadius: 1, overflow: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {company.data.members.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                            No members yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      company.data.members.map((member) => (
                        <TableRow key={member.id} hover>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700 }}>{member.user_full_name || member.user_email}</Typography>
                            <Typography variant="body2" color="text.secondary">{member.user_email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={member.role === "company_admin" ? "Company Admin" : "Member"} />
                          </TableCell>
                          <TableCell>
                            <Chip size="small" color={member.status === "active" ? "success" : "default"} label={member.status} />
                          </TableCell>
                          <TableCell>{formatWhen(member.joined_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1.25 }}>
                Connected social accounts ({company.data.social_accounts.length})
              </Typography>
              <Paper sx={{ borderRadius: 1, overflow: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Platform</TableCell>
                      <TableCell>Handle</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {company.data.social_accounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                            No connected accounts.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      company.data.social_accounts.map((account) => (
                        <TableRow key={account.id} hover>
                          <TableCell sx={{ textTransform: "capitalize" }}>{account.platform}</TableCell>
                          <TableCell>{account.handle}</TableCell>
                          <TableCell>
                            <Chip size="small" color={account.status === "active" ? "success" : "default"} label={account.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </>
        ) : null}
      </Box>
    </ScreenFrame>
  );
}
