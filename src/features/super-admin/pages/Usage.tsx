import { Alert, Box, Typography } from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader, StatCard } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";

// aidigiplanner-backend logs per-generation cost/audit rows (creatives.audit) but
// has no aggregation endpoint yet — this is illustrative sample data, not a real
// usage report.
const SAMPLE_TREND = [
  { day: "Mon", generations: 18, apiCalls: 240 },
  { day: "Tue", generations: 24, apiCalls: 310 },
  { day: "Wed", generations: 15, apiCalls: 198 },
  { day: "Thu", generations: 31, apiCalls: 402 },
  { day: "Fri", generations: 27, apiCalls: 355 },
  { day: "Sat", generations: 9, apiCalls: 120 },
  { day: "Sun", generations: 12, apiCalls: 150 },
];

export function UsagePage() {
  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader eyebrow="Platform" title="Usage" description="AI generation and API call volume across the platform." />

        <Alert severity="info">
          Sample data — there's no usage-aggregation endpoint on the backend yet
          (per-generation cost is logged, but not rolled up platform-wide).
        </Alert>

        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
          <StatCard label="AI generations" value="136" hint="Last 7 days" />
          <StatCard label="API calls" value="1,775" hint="Last 7 days" />
        </Box>

        <Box sx={{ ...GLASS_SX, p: 2.5, borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 800, mb: 2 }}>Weekly volume</Typography>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SAMPLE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="generations" stroke="#FF6B45" strokeWidth={2} name="AI generations" />
                <Line type="monotone" dataKey="apiCalls" stroke="#1F8A80" strokeWidth={2} name="API calls" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </ScreenFrame>
  );
}
