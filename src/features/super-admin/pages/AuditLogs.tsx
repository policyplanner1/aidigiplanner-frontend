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
import { Fragment, useMemo, useState } from "react";

import { AnimatedSearchField } from "../../../components/ui/AnimatedSearchField";
import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import {
  actionLabel,
  actorLabel,
  deviceFromUserAgent,
  formatWhen,
  kindColor,
  matchesKind,
  rangeFrom,
  type AuditKind,
} from "../auditLabels";
import { AuditLogExpand } from "../components/AuditLogExpand";
import { useAuditLogs } from "../hooks/useAuditLogs";

const KINDS: { id: AuditKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "login", label: "Sign-in" },
  { id: "logout", label: "Sign-out" },
  { id: "company", label: "Companies" },
];

const RANGES = [
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "all", label: "All time" },
] as const;

const PAGE_SIZE = 10;

export function AuditLogsPage() {
  const live = isLiveAuth();
  const [kind, setKind] = useState<AuditKind>("all");
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("7d");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = kind !== "all" || search.trim().length > 0;
  const query = useMemo(
    () => ({
      from_date: rangeFrom(range),
      limit: filtered ? 200 : PAGE_SIZE,
      offset: filtered ? 0 : page * PAGE_SIZE,
    }),
    [filtered, page, range],
  );

  const logs = useAuditLogs(query, live);
  const items = logs.data?.items ?? [];

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((log) => {
      if (!matchesKind(log.action, kind)) return false;
      if (!needle) return true;
      return [log.actor_name, log.actor_email, log.company_name, log.ip_address, log.action]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [items, kind, search]);

  const paged = filtered ? visible.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : visible;
  const total = filtered ? visible.length : logs.data?.total ?? 0;

  return (
    <ScreenFrame>
      <PageHeader
        eyebrow="Platform"
        title="Audit logs"
        description="Sign-ins, password changes, and company decisions across the platform."
      />

      {!live ? (
        <Alert severity="info">
          Live auth is off. Set VITE_LIVE_AUTH=true, restart the app, and sign in as Super Admin
          to review real audit logs.
        </Alert>
      ) : (
        <Paper sx={{ borderRadius: 1, overflow: "hidden" }}>
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              display: "flex",
              flexWrap: "nowrap",
              gap: 2,
              alignItems: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "nowrap",
                gap: 1.25,
                minWidth: 0,
                flex: 1,
                overflowX: "auto",
                pr: 0.5,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <CapsuleFilter
                items={KINDS}
                value={kind}
                onChange={(id) => {
                setKind(id);
                setPage(0);
                setOpenId(null);
                }}
              />
              <CapsuleFilter
                items={[...RANGES]}
                value={range}
                onChange={(id) => {
                setRange(id);
                setPage(0);
                setOpenId(null);
                }}
              />
            </Box>
            <AnimatedSearchField
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(0);
                setOpenId(null);
              }}
              phrases={["name, email, or company", "an IP address"]}
            />
          </Box>

          {logs.isLoading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
              <CircularProgress size={28} />
            </Box>
          ) : logs.isError ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {getApiErrorMessage(logs.error)}
            </Alert>
          ) : paged.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography sx={{ ...TYPE.section }}>No activity in this view.</Typography>
              <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.5 }}>
                Try another time range or clear the search.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={48} />
                  <TableCell>When</TableCell>
                  <TableCell>Person</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>IP address</TableCell>
                  <TableCell>Device</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((log) => {
                  const open = openId === log.id;
                  return (
                    <Fragment key={log.id}>
                      <TableRow
                        hover
                        selected={open}
                        onClick={() => setOpenId(open ? null : log.id)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell sx={{ pr: 0 }}>
                          <IconButton size="small" aria-label={open ? "Hide details" : "Show details"}>
                            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatWhen(log.created_at)}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700 }}>{actorLabel(log)}</Typography>
                          {log.actor_email && log.actor_email !== actorLabel(log) ? (
                            <Typography variant="body2" color="text.secondary">
                              {log.actor_email}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={actionLabel(log.action)}
                            sx={{
                              backgroundColor: `${kindColor(log.action)}18`,
                              color: kindColor(log.action),
                            }}
                          />
                        </TableCell>
                        <TableCell>{log.company_name ?? "—"}</TableCell>
                        <TableCell sx={{ fontSize: 13, wordBreak: "break-all" }}>
                          {log.ip_address ?? "—"}
                        </TableCell>
                        <TableCell>{deviceFromUserAgent(log.user_agent)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, borderBottom: open ? undefined : 0 }}>
                          <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box
                              sx={{
                                px: 2,
                                py: 2,
                                mb: 1,
                                borderRadius: 1,
                                backgroundColor: SURFACE.well,
                              }}
                            >
                              <Typography sx={{ ...TYPE.label, mb: 1.5 }}>Log details</Typography>
                              <AuditLogExpand logId={log.id} />
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            labelRowsPerPage="Logs per page"
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
