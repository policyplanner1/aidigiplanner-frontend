import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import { AnimatedCount } from "../../../components/ui/AnimatedCount";
import { PageHeader } from "../../../components/ui/PageHeader";
import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { TYPE } from "../../../constants/fonts";
import { getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import type { ApiCompanyStatus, ApiCompanySummary } from "../../../types/api";
import { RejectCompanyDialog } from "../components/RejectCompanyDialog";
import { DeleteCompanyDialog } from "../components/DeleteCompanyDialog";
import { SuspendCompanyDialog } from "../components/SuspendCompanyDialog";
import { useAdminKpis } from "../hooks/useAdminKpis";
import {
  mutationErrorMessage,
  useAdminCompanies,
  useApproveCompany,
  useDeleteCompany,
  useRejectCompany,
  useSuspendCompany,
  type CompanyStatusFilter,
} from "../hooks/useAdminCompanies";

const FILTERS: { value: CompanyStatusFilter; label: string }[] = [
  { value: "pending_approval", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
  { value: "all", label: "All" },
];

function statusLabel(status: ApiCompanyStatus) {
  if (status === "pending_approval") return "Pending";
  if (status === "active") return "Active";
  if (status === "rejected") return "Rejected";
  return "Suspended";
}

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
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrganizationsPage() {
  const live = isLiveAuth();
  const [status, setStatus] = useState<CompanyStatusFilter>("pending_approval");
  const [rejecting, setRejecting] = useState<ApiCompanySummary | null>(null);
  const [suspending, setSuspending] = useState<ApiCompanySummary | null>(null);
  const [deleting, setDeleting] = useState<ApiCompanySummary | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const kpis = useAdminKpis(live);
  const companies = useAdminCompanies(status, live);
  const approve = useApproveCompany();
  const reject = useRejectCompany();
  const suspend = useSuspendCompany();
  const remove = useDeleteCompany();

  const busyId = approve.isPending
    ? approve.variables
    : reject.isPending
      ? reject.variables?.companyId
      : suspend.isPending
        ? suspend.variables
        : remove.isPending
          ? remove.variables
          : null;

  const rows = useMemo(() => {
    const list = companies.data ?? [];
    return [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [companies.data]);

  const onApprove = async (company: ApiCompanySummary) => {
    setActionError(null);
    try {
      await approve.mutateAsync(company.id);
    } catch (error) {
      setActionError(mutationErrorMessage(error));
    }
  };

  const onReject = async (reason: string) => {
    if (!rejecting) return;
    setActionError(null);
    try {
      await reject.mutateAsync({ companyId: rejecting.id, reason });
      setRejecting(null);
    } catch (error) {
      setActionError(mutationErrorMessage(error));
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    setActionError(null);
    try {
      await remove.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (error) {
      setActionError(mutationErrorMessage(error));
    }
  };

  const onSuspend = async () => {
    if (!suspending) return;
    setActionError(null);
    try {
      await suspend.mutateAsync(suspending.id);
      setSuspending(null);
    } catch (error) {
      setActionError(mutationErrorMessage(error));
    }
  };

  return (
    <ScreenFrame>
      <PageHeader
        eyebrow="Platform"
        title="Requests"
        description="Companies that register wait here until they are approved."
        stats={
          live
            ? [
                {
                  label: "Pending",
                  value: <AnimatedCount value={kpis.data?.companies.pending_approval ?? 0} fontSize={20} color="#FF6B45" />,
                  active: status === "pending_approval",
                  onClick: () => setStatus("pending_approval"),
                },
                {
                  label: "Active",
                  value: <AnimatedCount value={kpis.data?.companies.active ?? 0} fontSize={20} color="#FF6B45" />,
                  active: status === "active",
                  onClick: () => setStatus("active"),
                },
                {
                  label: "Rejected",
                  value: <AnimatedCount value={kpis.data?.companies.rejected ?? 0} fontSize={20} color="#FF6B45" />,
                  active: status === "rejected",
                  onClick: () => setStatus("rejected"),
                },
                {
                  label: "Suspended",
                  value: <AnimatedCount value={kpis.data?.companies.suspended ?? 0} fontSize={20} color="#FF6B45" />,
                  active: status === "suspended",
                  onClick: () => setStatus("suspended"),
                },
              ]
            : undefined
        }
      />

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      {!live ? (
        <Alert severity="info">
          Live auth is off. Set VITE_LIVE_AUTH=true, restart the app, and sign in as
          Super Admin at /admin/login to review real registrations.
        </Alert>
      ) : (
        <Paper sx={{ borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ px: 1.5, py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}>
          <CapsuleFilter
            items={FILTERS.map((filter) => ({ id: filter.value, label: filter.label }))}
            value={status}
            onChange={setStatus}
          />
        </Box>

        {companies.isLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : companies.isError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {getApiErrorMessage(companies.error)}
          </Alert>
        ) : rows.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ ...TYPE.section }}>
              {status === "pending_approval"
                ? "No companies waiting for approval."
                : "No companies in this list."}
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Decided</TableCell>
                <TableCell align="right"> </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((company) => {
                const pending = company.status === "pending_approval";
                const active = company.status === "active";
                const rowBusy = busyId === company.id;

                return (
                  <TableRow key={company.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{company.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {company.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={statusColor(company.status)}
                        label={statusLabel(company.status)}
                      />
                    </TableCell>
                    <TableCell>{formatWhen(company.created_at)}</TableCell>
                    <TableCell>
                      {formatWhen(company.approved_at ?? company.rejected_at)}
                    </TableCell>
                    <TableCell align="right">
                      {pending ? (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={rowBusy}
                            onClick={() => {
                              setActionError(null);
                              setRejecting(company);
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={rowBusy}
                            onClick={() => void onApprove(company)}
                          >
                            {rowBusy && approve.isPending ? "Approving..." : "Approve"}
                          </Button>
                        </Box>
                      ) : active ? (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            disabled={rowBusy}
                            onClick={() => {
                              setActionError(null);
                              setSuspending(company);
                            }}
                          >
                            {rowBusy && suspend.isPending ? "Suspending..." : "Suspend"}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={rowBusy}
                            onClick={() => {
                              setActionError(null);
                              setDeleting(company);
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={rowBusy}
                          onClick={() => {
                            setActionError(null);
                            setDeleting(company);
                          }}
                        >
                          {rowBusy && remove.isPending ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        </Paper>
      )}

      <RejectCompanyDialog
        open={Boolean(rejecting)}
        companyName={rejecting?.name ?? "company"}
        busy={reject.isPending}
        error={reject.isError ? mutationErrorMessage(reject.error) : null}
        onClose={() => {
          if (!reject.isPending) setRejecting(null);
        }}
        onConfirm={(reason) => void onReject(reason)}
      />
      <SuspendCompanyDialog
        open={Boolean(suspending)}
        companyName={suspending?.name ?? "company"}
        busy={suspend.isPending}
        error={suspend.isError ? mutationErrorMessage(suspend.error) : null}
        onClose={() => {
          if (!suspend.isPending) setSuspending(null);
        }}
        onConfirm={() => void onSuspend()}
      />
      <DeleteCompanyDialog
        open={Boolean(deleting)}
        companyName={deleting?.name ?? "company"}
        busy={remove.isPending}
        error={remove.isError ? mutationErrorMessage(remove.error) : null}
        onClose={() => {
          if (!remove.isPending) setDeleting(null);
        }}
        onConfirm={() => void onDelete()}
      />
    </ScreenFrame>
  );
}
