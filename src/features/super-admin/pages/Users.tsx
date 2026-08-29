import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";

import { AnimatedCount } from "../../../components/ui/AnimatedCount";
import { AnimatedSearchField } from "../../../components/ui/AnimatedSearchField";
import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { adminApi } from "../../../services/admin/adminApi";
import { getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import { AdminUserExpand } from "../components/AdminUserExpand";
import { CompanyKpiCard } from "../components/CompanyKpiCard";
import { useAdminCompanies } from "../hooks/useAdminCompanies";
import { useAdminKpis } from "../hooks/useAdminKpis";
import { useAdminUsers } from "../hooks/useAdminUsers";

type OrgView = "companies" | "active_users" | "connected_accounts";

const PAGE_SIZE = 8;

function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function statusColor(status: string) {
  if (status === "active") return "success" as const;
  if (status === "pending" || status === "pending_approval") return "warning" as const;
  return "default" as const;
}

function extraCount(kpis: { ai_generations?: number | null; posts_published?: number | null } | undefined, key: "ai_generations" | "posts_published") {
  const value = kpis?.[key];
  return typeof value === "number" ? value : 0;
}

export function UsersPage() {
  const live = isLiveAuth();
  const [view, setView] = useState<OrgView>("companies");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const kpis = useAdminKpis(live);
  const companies = useAdminCompanies("all", live);
  const users = useAdminUsers({ limit: 200, offset: 0 }, live);

  const counts = useMemo(() => {
    const map = new Map<string, { members: number; activeUsers: number }>();
    for (const user of users.data?.items ?? []) {
      for (const company of user.companies ?? []) {
        const current = map.get(company.company_id) ?? { members: 0, activeUsers: 0 };
        current.members += 1;
        if (user.status === "active") current.activeUsers += 1;
        map.set(company.company_id, current);
      }
    }
    return map;
  }, [users.data]);

  const companyRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return [...(companies.data ?? [])]
      .filter((company) => !needle || company.name.toLowerCase().includes(needle) || company.slug.toLowerCase().includes(needle))
      .map((company) => ({
        ...company,
        members: counts.get(company.id)?.members ?? 0,
        activeUsers: counts.get(company.id)?.activeUsers ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companies.data, counts, search]);

  const userRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return [...(users.data?.items ?? [])]
      .filter((user) => user.status === "active")
      .filter((user) => {
        if (!needle) return true;
        return [user.full_name, user.email, ...(user.companies ?? []).map((item) => item.company_name)].some(
          (value) => String(value).toLowerCase().includes(needle),
        );
      })
      .sort((a, b) => (a.full_name || a.email).localeCompare(b.full_name || b.email));
  }, [search, users.data]);

  const showUsers = view === "active_users";
  const pagedCompanies = companyRows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const pagedUsers = userRows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const details = useQueries({
    queries: pagedCompanies.map((company) => ({
      queryKey: ["admin-company", company.id],
      queryFn: async () => (await adminApi.getCompany(company.id)).data,
      enabled: live && !showUsers,
      staleTime: 30_000,
    })),
  });

  const selectView = (next: OrgView) => {
    setView(next);
    setPage(0);
    setOpenId(null);
  };

  const summary = [
    {
      key: "companies" as const,
      label: "Active organization",
      value: kpis.data?.companies.active ?? 0,
    },
    {
      key: "active_users" as const,
      label: "Active users",
      value: kpis.data?.users.active ?? 0,
    },
    {
      key: "connected_accounts" as const,
      label: "Connected accounts",
      value: kpis.data?.social_accounts.active ?? 0,
    },
    {
      key: "companies" as const,
      label: "AI generations",
      value: extraCount(kpis.data, "ai_generations"),
    },
    {
      key: "companies" as const,
      label: "Posts published",
      value: extraCount(kpis.data, "posts_published"),
    },
  ];

  return (
    <ScreenFrame>
      <PageHeader
        eyebrow="Platform"
        title="Organization"
        description="Live counts for every company on AI Digi Planner."
        stats={
          live
            ? summary.map((item) => ({
                label: item.label,
                value: <AnimatedCount value={item.value} fontSize={20} color="#FF6B45" />,
                active: view === item.key && (item.key !== "companies" || item.label === "Active organization"),
                onClick: () => selectView(item.key),
              }))
            : undefined
        }
      />

      {!live ? (
        <Alert severity="info">
          Live auth is off. Set VITE_LIVE_AUTH=true, restart the app, and sign in as Super Admin
          to review organizations.
        </Alert>
      ) : (
        <Paper sx={{ borderRadius: 1, overflow: "hidden" }}>
            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography sx={{ ...TYPE.section, flex: 1 }}>
                {showUsers ? "Active users" : "Company-wise KPIs"}
              </Typography>
              <AnimatedSearchField
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(0);
                  setOpenId(null);
                }}
                phrases={showUsers ? ["name or email"] : ["a company"]}
              />
            </Box>

            {companies.isLoading || users.isLoading ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
                <CircularProgress size={28} />
              </Box>
            ) : companies.isError ? (
              <Alert severity="error" sx={{ m: 2 }}>
                {getApiErrorMessage(companies.error)}
              </Alert>
            ) : showUsers ? (
              pagedUsers.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <Typography sx={{ ...TYPE.section }}>No active users.</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={48} />
                      <TableCell>Member</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedUsers.map((user) => {
                      const open = openId === user.id;
                      return (
                        <Fragment key={user.id}>
                          <TableRow hover selected={open} onClick={() => setOpenId(open ? null : user.id)} sx={{ cursor: "pointer" }}>
                            <TableCell sx={{ pr: 0 }}>
                              <IconButton size="small">
                                {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 700 }}>{user.full_name || user.email}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" color={statusColor(user.status)} label={user.status} />
                            </TableCell>
                            <TableCell>{user.companies?.[0]?.company_name ?? "—"}</TableCell>
                            <TableCell>{formatWhen(user.created_at)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={5} sx={{ py: 0, borderBottom: open ? undefined : 0 }}>
                              <Collapse in={open} timeout="auto" unmountOnExit>
                                <Box sx={{ px: 2, py: 2, mb: 1, borderRadius: 1, backgroundColor: SURFACE.well }}>
                                  <AdminUserExpand user={user} />
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )
            ) : pagedCompanies.length === 0 ? (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography sx={{ ...TYPE.section }}>No companies yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 1.5, display: "grid", gap: 1.5 }}>
                {pagedCompanies.map((company, index) => {
                  const detail = details[index]?.data;
                  const connectedAccounts = (detail?.social_accounts ?? []).filter(
                    (account) => account.status === "active",
                  ).length;
                  return (
                    <CompanyKpiCard
                      key={company.id}
                      companyId={company.id}
                      name={company.name}
                      slug={company.slug}
                      status={company.status}
                      members={company.members}
                      activeUsers={company.activeUsers}
                      connectedAccounts={connectedAccounts}
                      aiGenerations={0}
                      postsPublished={0}
                      open={openId === company.id}
                      onToggle={() => setOpenId(openId === company.id ? null : company.id)}
                    />
                  );
                })}
              </Box>
            )}

            <TablePagination
              component="div"
              count={showUsers ? userRows.length : companyRows.length}
              page={page}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
              onPageChange={(_, next) => {
                setPage(next);
                setOpenId(null);
              }}
            />
          </Paper>
      )}
    </ScreenFrame>
  );
}
