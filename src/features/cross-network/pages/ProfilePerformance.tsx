import {
  East,
  FileUploadOutlined,
  FilterList,
  KeyboardArrowDown,
  NorthEast,
  SouthEast,
  StarBorder,
  Tune,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { FONT_FAMILY, TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { listSocialAccounts } from "../../../services/social/socialAccountsService";
import type { SocialPlatform } from "../../../types/organization";
import {
  REPORT_NETWORKS,
  buildProfilePerformance,
  comparisonLabel,
  formatChange,
  formatCount,
  networkLabel,
  periodLabel,
  type SourceFilter,
} from "../profilePerformanceData";

export function ProfilePerformancePage() {
  const { can } = usePermissions();
  const { projects } = useWorkspace();
  const [tab, setTab] = useState<"overview" | "profiles">("overview");
  const [source, setSource] = useState<SourceFilter>({ kind: "all" });
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(REPORT_NETWORKS);
  const [sourceEl, setSourceEl] = useState<null | HTMLElement>(null);
  const [accountEl, setAccountEl] = useState<null | HTMLElement>(null);

  const listed = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["social-accounts", project.id],
      queryFn: () => listSocialAccounts(project.id),
      enabled: Boolean(project.id),
    })),
  });

  const accounts = useMemo(
    () =>
      listed
        .flatMap((query) => query.data ?? [])
        .filter((item) => item.status === "connected"),
    [listed],
  );

  const report = useMemo(
    () => buildProfilePerformance(projects, accounts, source, platforms),
    [accounts, platforms, projects, source],
  );

  if (!can(PERMISSIONS.CROSS_NETWORK_VIEW)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const sourceLabel =
    source.kind === "all"
      ? "Viewing all"
      : source.kind === "project"
        ? (projects.find((item) => item.id === source.projectId)?.name ?? "Project")
        : (accounts.find((item) => item.id === source.accountId)?.accountName ?? "Account");
  const allAccounts = platforms.length === REPORT_NETWORKS.length;
  const accountLabel = allAccounts
    ? "Viewing all"
    : platforms.map((item) => networkLabel(item)).join(", ") || "Viewing all";
  const filtersActive = source.kind !== "all" || !allAccounts;
  const monthLabel = report.period.from.toLocaleDateString(undefined, { month: "short" }).toUpperCase();

  const togglePlatform = (platform: SocialPlatform) => {
    setPlatforms((current) => {
      const next = current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform];
      return next.length ? next : REPORT_NETWORKS;
    });
  };

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography sx={{ ...TYPE.title, fontSize: { xs: "1.35rem", md: "1.55rem" } }}>
              Profile Performance
            </Typography>
            <Typography sx={{ ...TYPE.body, color: "secondary.dark", mt: 0.5 }}>
              Activity from {periodLabel(report.period.from, report.period.to)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" startIcon={<FilterList />} sx={{ backgroundColor: "#3D2F2A" }}>
              Filters
            </Button>
            <Box sx={{ ...GLASS_SX, px: 1.25, py: 0.85, borderRadius: 1, fontSize: 12, fontWeight: 600 }}>
              {comparisonLabel(report.period.from, report.period.to, report.period.prevFrom, report.period.prevTo)}
            </Box>
            <IconButton size="small"><StarBorder fontSize="small" /></IconButton>
            <IconButton size="small"><FileUploadOutlined fontSize="small" /></IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            ...GLASS_SX,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <FilterTrigger label="Sources" value={sourceLabel} onClick={(event) => setSourceEl(event.currentTarget)} />
          <FilterTrigger label="Accounts" value={accountLabel} onClick={(event) => setAccountEl(event.currentTarget)} />
          {filtersActive ? (
            <Button
              size="small"
              onClick={() => {
                setSource({ kind: "all" });
                setPlatforms(REPORT_NETWORKS);
              }}
            >
              Clear all
            </Button>
          ) : null}
        </Box>

        <Menu anchorEl={sourceEl} open={Boolean(sourceEl)} onClose={() => setSourceEl(null)}>
          <MenuItem
            selected={source.kind === "all"}
            onClick={() => {
              setSource({ kind: "all" });
              setSourceEl(null);
            }}
          >
            Viewing all
          </MenuItem>
          {projects.map((project) => (
            <MenuItem
              key={project.id}
              selected={source.kind === "project" && source.projectId === project.id}
              onClick={() => {
                setSource({ kind: "project", projectId: project.id });
                setSourceEl(null);
              }}
            >
              Project · {project.name}
            </MenuItem>
          ))}
          {accounts.map((account) => (
            <MenuItem
              key={account.id}
              selected={source.kind === "account" && source.accountId === account.id}
              onClick={() => {
                setSource({ kind: "account", accountId: account.id });
                setSourceEl(null);
              }}
            >
              {account.accountName}
            </MenuItem>
          ))}
        </Menu>

        <Menu anchorEl={accountEl} open={Boolean(accountEl)} onClose={() => setAccountEl(null)}>
          <MenuItem
            onClick={() => {
              setPlatforms(REPORT_NETWORKS);
              setAccountEl(null);
            }}
          >
            <Checkbox size="small" checked={allAccounts} />
            Viewing all
          </MenuItem>
          {REPORT_NETWORKS.map((platform) => (
            <MenuItem key={platform} onClick={() => togglePlatform(platform)}>
              <Checkbox size="small" checked={platforms.includes(platform)} />
              {networkLabel(platform)}
            </MenuItem>
          ))}
        </Menu>

        <Tabs
          value={tab}
          onChange={(_event, value: "overview" | "profiles") => setTab(value)}
          sx={{ borderBottom: `1px solid ${SURFACE.border}`, minHeight: 40 }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="profiles" label="Profiles" />
        </Tabs>

        {tab === "overview" ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            <SectionCard
              title="Performance summary"
              body="View your key profile performance metrics accrued during the selected time period."
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                <SummaryStat label="Impressions" value={report.summary.impressions} change={report.summary.impressionsChange} />
                <SummaryStat label="Engagements" value={report.summary.engagements} change={report.summary.engagementsChange} />
                <SummaryStat label="Post link clicks" value={report.summary.clicks} change={report.summary.clicksChange} />
                <SummaryStat label="Engagement rate" value={`${report.summary.rate}%`} change={report.summary.rateChange} raw />
              </Box>
            </SectionCard>

            <SectionCard title="Audience growth" body="See how your audience grew during the selected time period.">
              <NetworkChart
                data={report.daily}
                networks={report.networks}
                dataKey={(platform) => `${platform}Audience`}
                monthLabel={monthLabel}
              />
            </SectionCard>

            <SectionCard
              title="Message volume"
              body="Review the volume of sent and received messages across networks during the selected time period."
            >
              <Typography sx={{ ...TYPE.label, mb: 1 }}>Messages per day</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sent" name="Sent messages" stroke="#1F8A80" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="received" name="Received messages" stroke="#7C5CFC" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </SectionCard>

            <MetricTable title="Sent messages metrics" totalLabel="Total sent messages" total={report.sent.total} change={report.sent.change} rows={report.sent.rows} />
            <MetricTable title="Received messages metrics" totalLabel="Total received messages" total={report.received.total} change={report.received.change} rows={report.received.rows} />

            <SectionCard title="Impressions" body="Review how your content was seen across networks during the selected time period.">
              <NetworkChart data={report.daily} networks={report.networks} dataKey={(platform) => platform} monthLabel={monthLabel} stacked />
            </SectionCard>
            <MetricTable title="Impression metrics" totalLabel="Impressions" total={report.impressions.total} change={report.impressions.change} rows={report.impressions.rows} />

            <SectionCard title="Video views" body="Review how your videos were viewed across networks during the selected time period.">
              <NetworkChart data={report.daily} networks={report.networks} dataKey={(platform) => `${platform}Video`} monthLabel={monthLabel} stacked />
            </SectionCard>
            <MetricTable title="Video views metrics" totalLabel="Video views" total={report.video.total} change={report.video.change} rows={report.video.rows} />

            <SectionCard title="Engagements" body="See how people are engaging with your posts during the selected time period.">
              <NetworkChart data={report.daily} networks={report.networks} dataKey={(platform) => `${platform}Engage`} monthLabel={monthLabel} stacked />
            </SectionCard>
            <MetricTable title="Engagement metrics" totalLabel="Engagements" total={report.engagements.total} change={report.engagements.change} rows={report.engagements.rows} />

            <SectionCard title="Engagement rate" body="See how engaged people are with your posts during the selected time period.">
              <NetworkChart data={report.daily} networks={report.networks} dataKey={(platform) => `${platform}Rate`} monthLabel={monthLabel} percent />
            </SectionCard>
            <MetricTable
              title="Engagement rate metrics"
              totalLabel="Engagement rate (per impression)"
              total={report.rate.total}
              change={report.rate.change}
              rows={report.rate.rows}
              asRate
            />

            <MetricTable title="Audience metrics" totalLabel="Net audience growth" total={report.audience.total} change={report.audience.change} rows={report.audience.rows} />
          </Box>
        ) : (
          <Box sx={{ ...GLASS_SX, borderRadius: 1, overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${SURFACE.border}` }}>
              <Typography sx={{ ...TYPE.section }}>Profiles</Typography>
              <Typography color="text.secondary">
                Performance for each connected social profile in the selected source and accounts.
              </Typography>
            </Box>
            {report.profiles.length === 0 ? (
              <Box sx={{ px: 2, py: 4 }}>
                <Typography color="text.secondary">Connect social accounts to see profile performance.</Typography>
              </Box>
            ) : (
              report.profiles.map((profile) => (
                <Box
                  key={profile.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1.4fr repeat(4, 0.7fr)" },
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${SURFACE.border}`,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{profile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.platformLabel} · {profile.projectName} · {profile.handle}
                    </Typography>
                  </Box>
                  <MiniCol label="Impressions" value={formatCount(profile.impressions)} />
                  <MiniCol label="Engagements" value={formatCount(profile.engagements)} />
                  <MiniCol label="Sent" value={formatCount(profile.sent)} />
                  <MiniCol label="Followers" value={formatCount(profile.followers)} />
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>
    </ScreenFrame>
  );
}

function NetworkChart({
  data,
  networks,
  dataKey,
  monthLabel,
  stacked,
  percent,
}: {
  data: Record<string, number | string>[];
  networks: { platform: SocialPlatform; label: string; color: string; chart: "area" | "line" }[];
  dataKey: (platform: SocialPlatform) => string;
  monthLabel: string;
  stacked?: boolean;
  percent?: boolean;
}) {
  return (
    <Box sx={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
          <XAxis dataKey="label" tickFormatter={(value) => (value === "1" ? `1 ${monthLabel}` : String(value))} />
          <YAxis tickFormatter={percent ? (value) => `${value}%` : undefined} />
          <Tooltip />
          <Legend />
          {networks.map((network) =>
            stacked || network.chart === "area" ? (
              <Area
                key={network.platform}
                type="monotone"
                dataKey={dataKey(network.platform)}
                name={network.label}
                stackId={stacked ? "stack" : undefined}
                stroke={network.color}
                fill={network.color}
                fillOpacity={stacked ? 0.55 : 0.22}
                strokeWidth={2}
              />
            ) : (
              <Line
                key={network.platform}
                type="monotone"
                dataKey={dataKey(network.platform)}
                name={network.label}
                stroke={network.color}
                strokeWidth={2.25}
                dot={false}
              />
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}

function FilterTrigger({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        appearance: "none",
        border: 0,
        background: "transparent",
        textAlign: "left",
        cursor: "pointer",
        minWidth: 140,
        maxWidth: 280,
      }}
    >
      <Typography sx={{ ...TYPE.label, fontSize: 11, color: "text.secondary" }}>{label}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13 }} noWrap>
          {value}
        </Typography>
        <KeyboardArrowDown fontSize="small" />
      </Box>
    </Box>
  );
}

function SectionCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ ...GLASS_SX, p: 2.25, borderRadius: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.35 }}>
        <Typography sx={{ ...TYPE.title, fontSize: "1.05rem" }}>{title}</Typography>
        <Tune fontSize="small" sx={{ color: "text.secondary" }} />
      </Box>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mb: 1.75 }}>{body}</Typography>
      {children}
    </Box>
  );
}

function SummaryStat({
  label,
  value,
  change,
  raw,
}: {
  label: string;
  value: number | string;
  change: number;
  raw?: boolean;
}) {
  return (
    <Box sx={{ pr: 2, borderRight: { lg: `1px solid ${SURFACE.border}` }, "&:last-child": { borderRight: 0 } }}>
      <Typography sx={{ ...TYPE.label, color: "text.secondary", fontSize: 12 }}>{label}</Typography>
      <Typography sx={{ ...TYPE.metric, fontSize: 26, mt: 0.5 }}>
        {typeof value === "number" && !raw ? formatCount(value) : value}
      </Typography>
      <Change value={change} />
    </Box>
  );
}

function MetricTable({
  title,
  totalLabel,
  total,
  change,
  rows,
  asRate,
}: {
  title: string;
  totalLabel: string;
  total: number;
  change: number;
  rows: { id: string; label: string; total: number; change: number }[];
  asRate?: boolean;
}) {
  const show = (value: number) => (asRate ? `${value.toFixed(1)}%` : formatCount(value));
  return (
    <Box sx={{ ...GLASS_SX, borderRadius: 1, overflow: "hidden", backgroundColor: "#FFFDFB" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 120px",
          gap: 1,
          px: 2.25,
          py: 1.25,
        }}
      >
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 12, color: "#8A6F64" }}>
          {title}
        </Typography>
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 12, color: "#8A6F64", textAlign: "right" }}>
          {asRate ? "Rate" : "Totals"}
        </Typography>
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 12, color: "#8A6F64", textAlign: "right" }}>
          % Change
        </Typography>
      </Box>
      <MetricRow label={totalLabel} totalLabel={show(total)} change={change} summary />
      {rows.map((row) => (
        <MetricRow key={row.id} label={row.label} totalLabel={show(row.total)} change={row.change} />
      ))}
    </Box>
  );
}

function MetricRow({
  label,
  totalLabel,
  change,
  summary,
}: {
  label: string;
  totalLabel: string;
  change: number;
  summary?: boolean;
}) {
  const textSx = summary
    ? { fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 16, color: "#3D2F2A" }
    : { fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: 14, color: "#6B5E57" };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 120px 120px",
        gap: 1,
        px: 2.25,
        py: summary ? 1.5 : 1.2,
        borderTop: "1px solid #EDE4DC",
        alignItems: "center",
      }}
    >
      <Typography sx={{ ...textSx, textDecoration: summary ? "none" : "underline", textUnderlineOffset: 3 }}>
        {label}
      </Typography>
      <Typography sx={{ ...textSx, textAlign: "right" }}>{totalLabel}</Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Change value={change} strong={summary} />
      </Box>
    </Box>
  );
}

function Change({ value, strong }: { value: number; strong?: boolean }) {
  const up = value > 0;
  const flat = value === 0;
  const color = flat ? "#8A6F64" : up ? "#1F8A80" : "#3D2F2A";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        color,
        fontFamily: FONT_FAMILY,
        fontWeight: strong ? 700 : 400,
        fontSize: strong ? 15 : 14,
      }}
    >
      {flat ? (
        <East sx={{ fontSize: strong ? 16 : 14 }} />
      ) : up ? (
        <NorthEast sx={{ fontSize: strong ? 16 : 14 }} />
      ) : (
        <SouthEast sx={{ fontSize: strong ? 16 : 14 }} />
      )}
      {formatChange(value)}
    </Box>
  );
}

function MiniCol({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ ...TYPE.label, fontSize: 11, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}
