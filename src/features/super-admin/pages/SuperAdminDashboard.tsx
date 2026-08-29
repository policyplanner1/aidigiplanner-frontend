import { KeyboardArrowRight } from "@mui/icons-material";
import { Alert, Box, Chip, CircularProgress, Typography } from "@mui/material";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { AnimatedCount, padCount } from "../../../components/ui/AnimatedCount";
import { PageHeader, StatCard } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { TYPE } from "../../../constants/fonts";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { DashboardSection } from "../../dashboard/components/DashboardSection";
import { getApiErrorMessage, isLiveAuth } from "../../../services/api/errors";
import { actionLabel, actorLabel, formatRelative } from "../auditLabels";
import { useAdminCompanies } from "../hooks/useAdminCompanies";
import { useAdminKpis } from "../hooks/useAdminKpis";
import { useAuditLogs } from "../hooks/useAuditLogs";

function extraCount(
  kpis: { ai_generations?: number | null; posts_published?: number | null } | undefined,
  key: "ai_generations" | "posts_published",
) {
  const value = kpis?.[key];
  return typeof value === "number" ? value : 0;
}

function platformLabel(value: string) {
  const known: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    whatsapp: "WhatsApp",
    twitter: "X",
    x: "X",
    threads: "Threads",
    pinterest: "Pinterest",
  };
  return known[value.toLowerCase()] ?? value.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function MixRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const width = total > 0 ? `${Math.max(value > 0 ? 6 : 0, (value / total) * 100)}%` : "0%";
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.6 }}>
        <Typography sx={{ ...TYPE.label, color: "text.secondary", fontSize: 12 }}>{label}</Typography>
        <AnimatedCount value={value} fontSize={14} color={color} />
      </Box>
      <Box sx={{ height: 8, borderRadius: 99, backgroundColor: SURFACE.well, overflow: "hidden" }}>
        <Box sx={{ width, height: "100%", backgroundColor: color, borderRadius: 99, transition: "width 0.4s ease" }} />
      </Box>
    </Box>
  );
}

export function SuperAdminDashboard() {
  const live = isLiveAuth();
  const navigate = useNavigate();
  const kpis = useAdminKpis(live);
  const companies = useAdminCompanies("all", live);
  const pending = useAdminCompanies("pending_approval", live);
  const activity = useAuditLogs({ limit: 8, offset: 0 }, live);

  const data = kpis.data;
  const companyTotal = data?.companies.total ?? 0;
  const userTotal = data?.users.total ?? 0;
  const accountTotal = data?.social_accounts.total ?? 0;
  const weekSignups = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return { i: index, v: 0, key: date.toISOString().slice(0, 10) };
    });
    for (const company of companies.data ?? []) {
      const key = new Date(company.created_at).toISOString().slice(0, 10);
      const row = days.find((day) => day.key === key);
      if (row) row.v += 1;
    }
    return days.map(({ i, v }) => ({ i, v }));
  }, [companies.data]);

  const channels = useMemo(() => {
    const byPlatform = data?.social_accounts.by_platform ?? {};
    return Object.entries(byPlatform)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [data]);

  const waiting = [...(pending.data ?? [])]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, 6);
  const logs = activity.data?.items ?? [];

  const pulse = [
    {
      title: "Organizations",
      value: companyTotal,
      hint: "Every company on the platform",
      accent: "#FF6B45",
      to: "/super-admin/users",
    },
    {
      title: "Active users",
      value: data?.users.active ?? 0,
      hint: "Signed-in members",
      accent: "#1F8A80",
      to: "/super-admin/users",
    },
    {
      title: "Connected accounts",
      value: data?.social_accounts.active ?? 0,
      hint: "Live social profiles",
      accent: "#E8A838",
      to: "/super-admin/users",
    },
    {
      title: "Pending requests",
      value: data?.companies.pending_approval ?? 0,
      hint: "Waiting for approval",
      accent: "#E25030",
      to: "/super-admin/organizations",
    },
    {
      title: "AI generations",
      value: extraCount(data, "ai_generations"),
      hint: "Content created",
      accent: "#FF6B45",
    },
    {
      title: "Posts published",
      value: extraCount(data, "posts_published"),
      hint: "Published this period",
      accent: "#1F8A80",
    },
  ];

  const health = [
    {
      title: "Suspended companies",
      value: data?.companies.suspended ?? 0,
      hint: "Need a review",
      accent: "#E8A838",
      to: "/super-admin/organizations",
    },
    {
      title: "Rejected companies",
      value: data?.companies.rejected ?? 0,
      hint: "Not approved",
      accent: "#E25030",
      to: "/super-admin/organizations",
    },
    {
      title: "Pending users",
      value: data?.users.pending ?? 0,
      hint: "Not active yet",
      accent: "#FF6B45",
      to: "/super-admin/users",
    },
    {
      title: "Disabled accounts",
      value: data?.social_accounts.disabled ?? 0,
      hint: "Social profiles off",
      accent: "#176E66",
      to: "/super-admin/users",
    },
  ];

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 3 }}>
        <PageHeader
          eyebrow="Control center"
          title="Platform overview"
          description="Live counts and what needs a Super Admin decision."
          sparkline={weekSignups}
          sparkLabel="New companies this week"
        />

        {!live ? (
          <Alert severity="info">
            Live auth is off. Set VITE_LIVE_AUTH=true, restart the app, and sign in as Super Admin
            to see platform counts.
          </Alert>
        ) : kpis.isLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
            <CircularProgress size={28} />
          </Box>
        ) : kpis.isError ? (
          <Alert severity="error">{getApiErrorMessage(kpis.error)}</Alert>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
              }}
            >
              {pulse.map((stat) => (
                <StatCard
                  key={stat.title}
                  label={stat.title}
                  accent={stat.accent}
                  hint={stat.hint}
                  onClick={stat.to ? () => navigate(stat.to) : undefined}
                  value={<AnimatedCount value={stat.value} fontSize={22} color={stat.accent} />}
                />
              ))}
            </Box>

            <Box>
              <DashboardSection
                eyebrow="Health"
                title="Watch these next"
                description="Companies and accounts that may need a Super Admin action."
              />
              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
                }}
              >
                {health.map((stat) => (
                  <StatCard
                    key={stat.title}
                    label={stat.title}
                    accent={stat.accent}
                    hint={stat.hint}
                    onClick={() => navigate(stat.to)}
                    value={<AnimatedCount value={stat.value} fontSize={22} color={stat.accent} />}
                  />
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gap: 1.75,
                alignItems: "start",
                gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" },
              }}
            >
              <Box sx={{ display: "grid", gap: 1.75, alignContent: "start" }}>
                <Box sx={{ ...GLASS_SX, p: 2.25, borderRadius: 1, height: "fit-content" }}>
                  <Typography sx={{ ...TYPE.title, fontSize: "1.05rem" }}>Company mix</Typography>
                  <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.25, mb: 1.75 }}>
                    How every organization currently sits.
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1.35 }}>
                    <MixRow label="Active" value={data?.companies.active ?? 0} total={companyTotal} color="#1F8A80" />
                    <MixRow label="Pending" value={data?.companies.pending_approval ?? 0} total={companyTotal} color="#E8A838" />
                    <MixRow label="Rejected" value={data?.companies.rejected ?? 0} total={companyTotal} color="#E25030" />
                    <MixRow label="Suspended" value={data?.companies.suspended ?? 0} total={companyTotal} color="#FF6B45" />
                  </Box>
                </Box>

                <Box sx={{ ...GLASS_SX, p: 2.25, borderRadius: 1, height: "fit-content" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: waiting.length > 0 ? 1.25 : 0.75 }}>
                    <Box>
                      <Typography sx={{ ...TYPE.title, fontSize: "1.05rem" }}>Needs a decision</Typography>
                      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.25 }}>
                        Companies still waiting for approval.
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${padCount(data?.companies.pending_approval ?? 0)} pending`}
                      onClick={() => navigate("/super-admin/organizations")}
                    />
                  </Box>
                  {pending.isLoading ? (
                    <Box sx={{ display: "grid", placeItems: "center", py: 1.5 }}>
                      <CircularProgress size={18} />
                    </Box>
                  ) : waiting.length === 0 ? (
                    <Typography color="text.secondary">No requests waiting.</Typography>
                  ) : (
                    waiting.map((company) => (
                      <Box
                        key={company.id}
                        onClick={() => navigate("/super-admin/organizations")}
                        sx={{
                          py: 1.1,
                          px: 1,
                          mx: -1,
                          borderRadius: 1,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 1,
                          alignItems: "center",
                          "&:hover": { backgroundColor: SURFACE.well },
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ ...TYPE.section }} noWrap>
                            {company.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {company.slug}
                          </Typography>
                        </Box>
                        <KeyboardArrowRight fontSize="small" sx={{ color: "text.secondary" }} />
                      </Box>
                    ))
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "grid", gap: 1.75, alignContent: "start" }}>
                <Box sx={{ ...GLASS_SX, p: 2.25, borderRadius: 1, height: "fit-content" }}>
                  <Typography sx={{ ...TYPE.title, fontSize: "1.05rem" }}>People & channels</Typography>
                  <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.25, mb: 1.75 }}>
                    Users and connected social profiles.
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1.35, mb: 2 }}>
                    <MixRow label="Active users" value={data?.users.active ?? 0} total={userTotal} color="#1F8A80" />
                    <MixRow label="Pending users" value={data?.users.pending ?? 0} total={userTotal} color="#E8A838" />
                    <MixRow label="Suspended users" value={data?.users.suspended ?? 0} total={userTotal} color="#E25030" />
                  </Box>
                  {channels.length === 0 ? (
                    <Typography color="text.secondary">No connected accounts yet.</Typography>
                  ) : (
                    <Box sx={{ display: "grid", gap: 1.1 }}>
                      {channels.map((item) => (
                        <MixRow
                          key={item.platform}
                          label={platformLabel(item.platform)}
                          value={item.count}
                          total={accountTotal}
                          color="#FF6B45"
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ ...GLASS_SX, p: 2.25, borderRadius: 1, height: "fit-content" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: logs.length > 0 ? 1.25 : 0.75 }}>
                    <Box>
                      <Typography sx={{ ...TYPE.title, fontSize: "1.05rem" }}>Latest activity</Typography>
                      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.25 }}>
                        Recent sign-ins and company actions.
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${padCount(activity.data?.total ?? logs.length)} logs`}
                      onClick={() => navigate("/super-admin/audit-logs")}
                    />
                  </Box>
                  {activity.isLoading ? (
                    <Box sx={{ display: "grid", placeItems: "center", py: 1.5 }}>
                      <CircularProgress size={18} />
                    </Box>
                  ) : logs.length === 0 ? (
                    <Typography color="text.secondary">No activity yet.</Typography>
                  ) : (
                    logs.map((log) => (
                      <Box
                        key={log.id}
                        onClick={() => navigate("/super-admin/audit-logs")}
                        sx={{
                          py: 1.1,
                          px: 1,
                          mx: -1,
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": { backgroundColor: SURFACE.well },
                        }}
                      >
                        <Typography sx={{ ...TYPE.section }} noWrap>
                          {actionLabel(log.action)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {actorLabel(log)}
                          {log.company_name ? ` · ${log.company_name}` : ""} · {formatRelative(log.created_at)}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </ScreenFrame>
  );
}
